"""Coleta dados RREO 2025 (Tijucas/SC) via API SICONFI.

Endpoints coletados:
  - Anexo 01: Balanço Orçamentário (receitas e despesas totais)
  - Anexo 02: Despesas por Função/Subfunção
  - Anexo 06: Resultado Primário e Nominal
  - Anexo 07: Restos a Pagar

Saída: data/raw/siconfi/rreo_2025/rreo_<ano>_<periodo>_<anexo>.json
       data/raw/siconfi/rreo_2025/rreo_2025_consolidado.csv  (todos os bimestres)
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import pandas as pd
import requests

PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw" / "siconfi" / "rreo_2025"

BASE_URL = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo"
TIJUCAS_IBGE = 4218004
ANO = 2025
PERIODOS = list(range(1, 7))  # bimestres 1-6

ANEXOS = {
    "RREO-Anexo 01": "balanco_orcamentario",
    "RREO-Anexo 02": "despesas_funcao",
    "RREO-Anexo 06": "resultado_primario_nominal",
    "RREO-Anexo 07": "restos_a_pagar",
}

DEFAULT_RETRIES = 3
DEFAULT_SLEEP = 1.2


def request_rreo(
    ano: int,
    periodo: int,
    id_ente: int,
    anexo: str,
    *,
    retries: int = DEFAULT_RETRIES,
    sleep: float = DEFAULT_SLEEP,
) -> list[dict]:
    params = {
        "an_exercicio": ano,
        "nr_periodo": periodo,
        "co_tipo_demonstrativo": "RREO",
        "no_anexo": anexo,
        "id_ente": id_ente,
    }
    headers = {"User-Agent": "poc-painel-tijucas/1.0"}

    for attempt in range(retries + 1):
        try:
            resp = requests.get(BASE_URL, params=params, headers=headers, timeout=60)
            resp.raise_for_status()
            data = resp.json()
            items = data.get("items", data) if isinstance(data, dict) else data
            return items if isinstance(items, list) else []
        except requests.RequestException as exc:
            if attempt == retries:
                print(f"  ERRO após {retries + 1} tentativas: {exc}", file=sys.stderr)
                return []
            wait = sleep * (2 ** attempt)
            print(f"  Tentativa {attempt + 1} falhou ({exc}); aguardando {wait:.1f}s...")
            time.sleep(wait)
    return []


def collect_all(
    ano: int = ANO,
    periodos: list[int] | None = None,
    id_ente: int = TIJUCAS_IBGE,
    sleep: float = DEFAULT_SLEEP,
) -> pd.DataFrame:
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    periodos = periodos or PERIODOS
    all_rows: list[dict] = []

    for periodo in periodos:
        for anexo_name, anexo_slug in ANEXOS.items():
            print(f"Coletando RREO {ano} P{periodo} {anexo_name}...")
            rows = request_rreo(ano, periodo, id_ente, anexo_name, sleep=sleep)
            cache_path = RAW_DATA_DIR / f"rreo_{ano}_p{periodo}_{anexo_slug}.json"
            cache_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

            if rows:
                for row in rows:
                    row["_periodo"] = periodo
                    row["_anexo"] = anexo_name
                all_rows.extend(rows)
                print(f"  {len(rows)} registros salvos em {cache_path.name}")
            else:
                print(f"  sem dados para {anexo_name} P{periodo}")

            time.sleep(sleep)

    if not all_rows:
        print("AVISO: nenhum dado coletado.", file=sys.stderr)
        return pd.DataFrame()

    df = pd.DataFrame(all_rows)
    csv_path = RAW_DATA_DIR / f"rreo_{ano}_consolidado.csv"
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    print(f"\nConsolidado: {len(df)} linhas em {csv_path}")
    return df


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Coleta RREO via SICONFI API")
    parser.add_argument("--ano", type=int, default=ANO)
    parser.add_argument(
        "--periodos",
        type=lambda s: [int(x) for x in s.split(",")],
        default=PERIODOS,
        help="Bimestres separados por vírgula, ex: 1,2,3 (default: 1-6)",
    )
    parser.add_argument("--id-ente", type=int, default=TIJUCAS_IBGE, help="Código IBGE do município")
    parser.add_argument("--sleep", type=float, default=DEFAULT_SLEEP, help="Pausa entre requisições (s)")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    df = collect_all(ano=args.ano, periodos=args.periodos, id_ente=args.id_ente, sleep=args.sleep)
    if df.empty:
        sys.exit(1)
    print("\nColunas disponíveis:", list(df.columns))
    print(f"Períodos coletados: {sorted(df['_periodo'].unique().tolist())}")
    print(f"Anexos coletados:   {sorted(df['_anexo'].unique().tolist())}")
