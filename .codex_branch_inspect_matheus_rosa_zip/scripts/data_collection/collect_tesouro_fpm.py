import argparse
import time
from datetime import date
from pathlib import Path

import pandas as pd
import requests


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"

BASE_URL = "https://apiapex.tesouro.gov.br/aria/v1/transferencias_constitucionais/custom"
SC_CODIGO_UF_TESOURO = "24"
FPM_CODIGO_TRANSFERENCIA = "3"
FPM_NOME_TRANSFERENCIA = "FPM"
MESES = "1:2:3:4:5:6:7:8:9:10:11:12"
DEFAULT_RETRIES = 3


def request_json(endpoint: str, params: dict[str, str], *, retries: int = DEFAULT_RETRIES) -> dict:
    url = f"{BASE_URL}/{endpoint}"
    headers = {"User-Agent": "poc-painel-tijucas/1.0"}

    for attempt in range(retries + 1):
        try:
            response = requests.get(url, params=params, headers=headers, timeout=90)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as exc:
            if attempt >= retries:
                raise RuntimeError(f"Erro ao consultar {response.url if 'response' in locals() else url}: {exc}") from exc

        wait_seconds = 5 * (attempt + 1)
        print(f"  tentativa {attempt + 1} falhou; aguardando {wait_seconds}s para repetir...")
        time.sleep(wait_seconds)

    raise RuntimeError(f"Falha inesperada ao consultar {url}")


def fetch_fpm_sc_year(ano: int, *, throttle_seconds: float) -> pd.DataFrame:
    params = {
        "P_ESTADO": SC_CODIGO_UF_TESOURO,
        "P_ANO": str(ano),
        "P_MES": MESES,
        "P_TRANSFERENCIA": FPM_CODIGO_TRANSFERENCIA,
        "P_SN_DETALHAR": "sim",
    }
    payload = request_json("por_estado_municipio", params)
    rows = payload.get("registros", [])
    if not rows:
        raise RuntimeError(f"Nenhum registro retornado para SC no ano {ano}.")

    time.sleep(throttle_seconds)
    return pd.DataFrame(rows)


def normalize_monthly(df: pd.DataFrame) -> pd.DataFrame:
    rename_map = {
        "UF": "uf",
        "ANO": "ano",
        "MES": "mes",
        "MUNICIPIO": "municipio",
        "CO_IBGE": "codigo_ibge",
        "codigo_siafi": "codigo_siafi",
        "TRANSFERENCIA": "transferencia",
        "VALOR": "valor_fpm",
    }
    df = df.rename(columns=rename_map).copy()

    expected_columns = [
        "codigo_ibge",
        "codigo_siafi",
        "uf",
        "municipio",
        "ano",
        "mes",
        "transferencia",
        "valor_fpm",
    ]
    missing = [column for column in expected_columns if column not in df.columns]
    if missing:
        raise RuntimeError(f"Colunas ausentes na resposta da API: {missing}")

    df = df[expected_columns]
    df["codigo_ibge"] = pd.to_numeric(df["codigo_ibge"], errors="coerce").astype("Int64")
    df["codigo_siafi"] = pd.to_numeric(df["codigo_siafi"], errors="coerce").astype("Int64")
    df["ano"] = pd.to_numeric(df["ano"], errors="coerce").astype("Int64")
    df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
    df["valor_fpm"] = pd.to_numeric(df["valor_fpm"], errors="coerce")
    df["uf"] = df["uf"].astype(str).str.upper().str.strip()
    df["municipio"] = df["municipio"].astype(str).str.strip()
    df["transferencia"] = df["transferencia"].astype(str).str.strip()
    df["data_referencia"] = pd.to_datetime(
        {
            "year": df["ano"].astype("int64"),
            "month": df["mes"].astype("int64"),
            "day": 1,
        },
        errors="coerce",
    )
    return df.sort_values(["ano", "mes", "municipio"]).reset_index(drop=True)


def build_annual(df: pd.DataFrame) -> pd.DataFrame:
    annual = (
        df.groupby(["codigo_ibge", "codigo_siafi", "uf", "municipio", "ano"], as_index=False)
        .agg(
            valor_fpm_anual=("valor_fpm", "sum"),
            meses_com_dados=("valor_fpm", "count"),
        )
        .sort_values(["ano", "municipio"])
        .reset_index(drop=True)
    )
    annual["rank_sc_maior_fpm"] = annual.groupby("ano")["valor_fpm_anual"].rank(
        ascending=False,
        method="min",
    )
    annual["rank_sc_maior_fpm"] = annual["rank_sc_maior_fpm"].astype("Int64")
    return annual


def validate_outputs(monthly: pd.DataFrame, annual: pd.DataFrame) -> None:
    tijucas = monthly[(monthly["codigo_ibge"] == 4218004) & (monthly["municipio"] == "Tijucas")]
    if tijucas.empty:
        raise RuntimeError("Tijucas/SC nao foi encontrada com codigo IBGE 4218004.")

    tijucas_do_sul = monthly[
        monthly["municipio"].str.contains("Tijucas do Sul", case=False, na=False)
    ]
    if not tijucas_do_sul.empty:
        raise RuntimeError("A base de SC trouxe Tijucas do Sul/PR, o que indica filtro incorreto de UF.")

    if set(monthly["uf"].dropna().unique()) != {"SC"}:
        raise RuntimeError("A base contem UFs diferentes de SC.")

    invalid_transfer = set(monthly["transferencia"].dropna().unique()) - {FPM_NOME_TRANSFERENCIA}
    if invalid_transfer:
        raise RuntimeError(f"A base contem transferencias diferentes de FPM: {sorted(invalid_transfer)}")

    incomplete = annual[annual["meses_com_dados"] != 12]
    if not incomplete.empty:
        sample = incomplete.head(10)[["ano", "municipio", "meses_com_dados"]].to_dict("records")
        raise RuntimeError(f"Ha municipios/anos com menos de 12 meses de FPM. Amostra: {sample}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Coleta a serie mensal de FPM dos municipios de Santa Catarina pela API do Tesouro."
    )
    parser.add_argument("--ano-inicio", type=int, default=1997)
    parser.add_argument("--ano-fim", type=int, default=date.today().year - 1)
    parser.add_argument("--throttle-seconds", type=float, default=0.2)
    parser.add_argument("--somente-csv", action="store_true", help="Nao grava arquivos parquet.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.ano_inicio > args.ano_fim:
        raise ValueError("--ano-inicio deve ser menor ou igual a --ano-fim.")

    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

    frames: list[pd.DataFrame] = []
    for ano in range(args.ano_inicio, args.ano_fim + 1):
        print(f"Coletando FPM SC {ano}...")
        frames.append(fetch_fpm_sc_year(ano, throttle_seconds=args.throttle_seconds))

    monthly = normalize_monthly(pd.concat(frames, ignore_index=True))
    annual = build_annual(monthly)
    validate_outputs(monthly, annual)

    suffix = f"{args.ano_inicio}_{args.ano_fim}"
    monthly_csv = PROCESSED_DATA_DIR / f"fpm_municipios_sc_mensal_{suffix}.csv"
    annual_csv = PROCESSED_DATA_DIR / f"fpm_municipios_sc_anual_{suffix}.csv"
    monthly.to_csv(monthly_csv, index=False, encoding="utf-8-sig")
    annual.to_csv(annual_csv, index=False, encoding="utf-8-sig")

    if not args.somente_csv:
        monthly_parquet = PROCESSED_DATA_DIR / f"fpm_municipios_sc_mensal_{suffix}.parquet"
        annual_parquet = PROCESSED_DATA_DIR / f"fpm_municipios_sc_anual_{suffix}.parquet"
        monthly.to_parquet(monthly_parquet, index=False)
        annual.to_parquet(annual_parquet, index=False)

    tijucas_annual = annual[annual["codigo_ibge"] == 4218004]
    print(f"Mensal: {monthly_csv}")
    print(f"Anual: {annual_csv}")
    print(f"Linhas mensais: {len(monthly):,}".replace(",", "."))
    print(f"Linhas anuais: {len(annual):,}".replace(",", "."))
    print("Tijucas/SC:")
    print(tijucas_annual.tail(10).to_string(index=False))


if __name__ == "__main__":
    main()
