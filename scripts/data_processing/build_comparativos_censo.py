"""
Atualiza comparativos_series no JSON de contas públicas usando a
população do Censo IBGE para selecionar municípios pares de 50-70k hab.

Adiciona a série de mediana de investimentos_pct_despesa_total para esse grupo
em todos os anos disponíveis (2013-2024).

Uso:
    python scripts/data_processing/build_comparativos_censo.py
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = PROJECT_ROOT / "data" / "raw"
FISCAL_DIR = PROJECT_ROOT / "data" / "processed" / "fiscal"
JSON_PATH = PROJECT_ROOT / "src" / "features" / "contas-publicas" / "data" / "contas_publicas_tijucas.json"

TIJUCAS_IBGE = "4218004"
CENSO_POP_MIN = 50_000
CENSO_POP_MAX = 70_000


def load_censo_peers() -> list[str]:
    """Retorna lista de cd_ibge (7 dígitos) de municípios SC com 50-70k hab no censo."""
    censo = pd.read_excel(RAW_DIR / "ibge" / "IBGE - POP CENSO.xlsx")
    censo_sc = censo[censo["uf"] == "SC"].copy()
    censo_sc["cd_ibge"] = censo_sc["cod_mun"].astype(str).str.zfill(7)
    peers = censo_sc[
        (censo_sc["populacao"] >= CENSO_POP_MIN)
        & (censo_sc["populacao"] <= CENSO_POP_MAX)
        & ~censo_sc["cd_ibge"].eq(TIJUCAS_IBGE)
    ]
    return peers["cd_ibge"].tolist(), peers[["nunicipio", "cd_ibge", "populacao"]].rename(
        columns={"nunicipio": "municipio"}
    )


def build_investment_series(peer_ids: list[str]) -> list[dict]:
    """Calcula mediana de investimentos_pct_despesa_total por ano para os pares."""
    fiscal = pd.read_parquet(
        FISCAL_DIR / "indicadores_fiscais_municipios_sc_2013_2024.parquet",
        columns=["cd_ibge", "ano", "investimentos_pct_despesa_total"],
    )
    peers_data = fiscal[fiscal["cd_ibge"].isin(peer_ids)].copy()
    peers_data["investimentos_pct_despesa_total"] = pd.to_numeric(
        peers_data["investimentos_pct_despesa_total"], errors="coerce"
    )

    rows = []
    for ano, grp in peers_data.groupby("ano"):
        vals = grp["investimentos_pct_despesa_total"].dropna()
        rows.append(
            {
                "ano": int(ano),
                "mediana_similares": round(float(vals.median()), 6) if len(vals) > 0 else None,
                "media_similares": round(float(vals.mean()), 6) if len(vals) > 0 else None,
                "n_municipios": int(len(vals)),
            }
        )
    return sorted(rows, key=lambda r: r["ano"])


def main() -> None:
    peer_ids, peers_df = load_censo_peers()
    print(f"Municípios pares (censo 50-70k, excluindo Tijucas): {len(peer_ids)}")
    print(peers_df.to_string(index=False))

    series = build_investment_series(peer_ids)
    print(f"\nSérie investimentos_pct_despesa_total ({series[0]['ano']}-{series[-1]['ano']}):")
    for row in series:
        print(f"  {row['ano']}: mediana={row['mediana_similares']:.2f}%  n={row['n_municipios']}")

    # Lê JSON atual e atualiza comparativos_series
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))

    criterio = (
        f"Municípios de SC com população entre {CENSO_POP_MIN:,} e {CENSO_POP_MAX:,} "
        "habitantes segundo o Censo IBGE 2022, excluindo Tijucas."
    ).replace(",", ".")

    if "comparativos_series" not in data:
        data["comparativos_series"] = {}

    comp = data["comparativos_series"]
    comp["criterio_censo_50_70k"] = criterio
    comp["municipios_censo_50_70k"] = peers_df.to_dict("records")

    if "indicadores" not in comp:
        comp["indicadores"] = {}

    comp["indicadores"]["investimentos_pct_despesa_total_censo_50_70k"] = series

    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nJSON atualizado: {JSON_PATH}")


if __name__ == "__main__":
    main()
