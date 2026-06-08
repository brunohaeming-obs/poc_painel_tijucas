from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
MONTH_LABELS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]


def format_period(date: pd.Timestamp) -> str:
    return f"{MONTH_LABELS[date.month - 1]}/{str(date.year)[-2:]}"


def export_datasus_long_to_excel() -> None:
    """Converte a base longa do DataSUS de CSV para XLSX."""
    input_path = RAW_DATA_DIR / "datasus - procedimento ambulatoriais sc long.csv"
    output_path = PROCESSED_DATA_DIR / "procedimento_ambulatoriais_sc_long.xlsx"

    df = pd.read_csv(input_path, sep=";")
    df.to_excel(output_path, index=False)
    print(f"Arquivo gerado: {output_path.relative_to(PROJECT_ROOT)}")


def build_tijucas_sc_monthly() -> None:
    input_path = RAW_DATA_DIR / "datasus - procedimento ambulatoriais sc long.csv"
    output_path = PROCESSED_DATA_DIR / "datasus_procedimentos_tijucas_sc_mensal.csv"

    df = pd.read_csv(input_path, sep=";")
    df["ano_mes_atendimento"] = pd.to_datetime(df["ano_mes_atendimento"])
    sc = df.groupby("ano_mes_atendimento", as_index=False)["qtd_aprovada"].sum()
    tijucas = df[df["codigo_municipio"].astype(str).str.startswith("421800")]
    tijucas = tijucas.groupby("ano_mes_atendimento", as_index=False)["qtd_aprovada"].sum()

    monthly = sc.merge(tijucas, on="ano_mes_atendimento", how="left", suffixes=("Sc", "Tijucas"))
    monthly = monthly.sort_values("ano_mes_atendimento").tail(36)
    monthly = monthly.rename(
        columns={
            "ano_mes_atendimento": "data",
            "qtd_aprovadaSc": "procedimentosSc",
            "qtd_aprovadaTijucas": "procedimentosTijucas",
        }
    )
    monthly["periodo"] = monthly["data"].map(format_period)
    monthly = monthly[["data", "periodo", "procedimentosSc", "procedimentosTijucas"]]
    monthly.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"Arquivo gerado: {output_path.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    export_datasus_long_to_excel()
    build_tijucas_sc_monthly()


