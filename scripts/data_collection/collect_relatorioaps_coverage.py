from __future__ import annotations

import argparse
import csv
import json
import sys
import time
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any

import pandas as pd
import requests


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"

API_BASE_URL = "https://relatorioaps-prd.saude.gov.br"
RAW_DIR = RAW_DATA_DIR / "aps" / "cobertura"


@dataclass(frozen=True)
class ReportConfig:
    code: str
    endpoint: str
    start_year: int
    end_year: int


REPORTS = {
    "aps": ReportConfig("aps", "/cobertura/aps", 2019, 2026),
    "acs": ReportConfig("acs", "/cobertura/acs", 2007, 2026),
    "sb": ReportConfig("sb", "/cobertura/sb/v2", 2024, 2026),
    "pns": ReportConfig("pns", "/cobertura/pns", 2020, 2023),
}

MONTH_NAME_TO_NUMBER = {
    "JAN": 1,
    "FEV": 2,
    "FEB": 2,
    "MAR": 3,
    "ABR": 4,
    "APR": 4,
    "MAI": 5,
    "MAY": 5,
    "JUN": 6,
    "JUL": 7,
    "AGO": 8,
    "AUG": 8,
    "SET": 9,
    "SEP": 9,
    "OUT": 10,
    "OCT": 10,
    "NOV": 11,
    "DEZ": 12,
    "DEC": 12,
}


def parse_number(value: Any) -> Any:
    if value is None or isinstance(value, (int, float)):
        return value
    text = str(value).strip()
    if text == "":
        return None
    if "," in text and "." in text:
        text = text.replace(".", "").replace(",", ".")
    elif "," in text:
        parts = text.split(",")
        if len(parts[-1]) == 3 and all(part.isdigit() for part in parts):
            text = "".join(parts)
        else:
            text = text.replace(",", ".")
    try:
        parsed = float(text)
    except ValueError:
        return value
    return int(parsed) if parsed.is_integer() else parsed


def parse_competence(row: dict[str, Any]) -> tuple[int | None, int | None, str | None]:
    raw = row.get("nuComp") or row.get("nuCompetencia")
    if raw is None:
        return None, None, None
    text = str(raw).strip().upper()
    if len(text) == 6 and text.isdigit():
        return int(text[:4]), int(text[4:6]), text
    if "/" in text:
        month_text, year_text = text.split("/", 1)
        month = MONTH_NAME_TO_NUMBER.get(month_text[:3])
        if year_text.isdigit() and month:
            return int(year_text), month, f"{year_text}{month:02d}"
    return None, None, text


def fetch_json(report: ReportConfig, year: int, sleep: float) -> list[dict[str, Any]]:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    raw_path = RAW_DIR / f"{report.code}_{year}.json"
    empty_path = RAW_DIR / f"{report.code}_{year}.empty"
    if empty_path.exists():
        return []
    if raw_path.exists():
        return json.loads(raw_path.read_text(encoding="utf-8"))

    params = {
        "unidadeGeografica": "MUNICIPIO",
        "nuCompInicio": f"{year}01",
        "nuCompFim": f"{year}12",
    }
    last_error: Exception | None = None
    for attempt in range(1, 4):
        try:
            response = requests.get(API_BASE_URL + report.endpoint, params=params, timeout=240)
            response.raise_for_status()
            data = response.json()
            if not data:
                empty_path.write_text("sem registros", encoding="utf-8")
                return []
            raw_path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
            time.sleep(sleep)
            return data
        except requests.RequestException as exc:
            last_error = exc
            if attempt == 3:
                raise
            time.sleep(10 * attempt)
    raise RuntimeError(f"Falha ao coletar {report.code} {year}: {last_error}")


def normalize_rows(report_code: str, rows: list[dict[str, Any]]) -> pd.DataFrame:
    normalized: list[dict[str, Any]] = []
    for row in rows:
        year, month, competence = parse_competence(row)
        record = {
            "tipo_relatorio": report_code,
            "competencia": competence,
            "ano": year,
            "mes": month,
            "codigo_regiao": row.get("coRegiao"),
            "regiao": row.get("noRegiao"),
            "sigla_regiao": row.get("sgRegiao"),
            "codigo_uf": row.get("coUfIbge"),
            "uf": row.get("sgUf"),
            "nome_uf": row.get("noUfAcentuado") or row.get("noUf"),
            "codigo_municipio": row.get("coMunicipioIbge"),
            "nome_municipio": row.get("noMunicipioAcentuado") or row.get("noMunicipioIbge") or row.get("noMunicipio"),
        }
        for key, value in row.items():
            if key in {
                "nuComp",
                "nuCompetencia",
                "coRegiao",
                "noRegiao",
                "sgRegiao",
                "coUfIbge",
                "sgUf",
                "noUf",
                "noUfAcentuado",
                "coMunicipioIbge",
                "noMunicipioIbge",
                "noMunicipio",
                "noMunicipioAcentuado",
            }:
                continue
            record[key] = parse_number(value)
        normalized.append(record)
    return pd.DataFrame(normalized)


def write_metadata(path: Path, reports: list[ReportConfig]) -> None:
    rows = [
        {"campo": "fonte", "valor": "Relatorios Publicos da APS / SAPS-MS"},
        {"campo": "api_base_url", "valor": API_BASE_URL},
        {"campo": "data_coleta", "valor": date.today().isoformat()},
        {"campo": "unidade_geografica", "valor": "MUNICIPIO"},
        {"campo": "relatorios", "valor": "; ".join(f"{report.code}:{report.endpoint}" for report in reports)},
        {"campo": "observacao", "valor": "Dados agregados mensais de cobertura da APS, sujeitos a revisoes retroativas."},
    ]
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["campo", "valor"])
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Coleta cobertura APS municipal via relatorioaps.saude.gov.br.")
    parser.add_argument("--reports", nargs="+", choices=sorted(REPORTS), default=sorted(REPORTS))
    parser.add_argument("--year-start", type=int, default=None)
    parser.add_argument("--year-end", type=int, default=None)
    parser.add_argument("--sleep", type=float, default=1.0)
    parser.add_argument("--test", action="store_true", help="Coleta apenas APS 2024.")
    args = parser.parse_args()

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    (PROCESSED_DATA_DIR / "saude").mkdir(parents=True, exist_ok=True)

    selected_reports = [REPORTS[code] for code in (["aps"] if args.test else args.reports)]
    frames: list[pd.DataFrame] = []

    for report in selected_reports:
        start_year = max(report.start_year, args.year_start or report.start_year)
        end_year = min(report.end_year, args.year_end or report.end_year)
        if args.test:
            start_year = end_year = 2024
        for year in range(start_year, end_year + 1):
            print(f"Coletando {report.code} {year}...")
            rows = fetch_json(report, year, sleep=args.sleep)
            if rows:
                frames.append(normalize_rows(report.code, rows))

    if not frames:
        raise SystemExit("Nenhum dado coletado.")

    result = pd.concat(frames, ignore_index=True)
    result = result.sort_values(["tipo_relatorio", "codigo_municipio", "competencia"], kind="stable")

    suffix = "teste" if args.test else "municipios_brasil"
    health_dir = PROCESSED_DATA_DIR / "saude"
    csv_path = health_dir / f"relatorioaps_cobertura_{suffix}.csv"
    parquet_path = health_dir / f"relatorioaps_cobertura_{suffix}.parquet"
    metadata_path = health_dir / f"relatorioaps_cobertura_{suffix}_metadata.csv"

    result.to_csv(csv_path, index=False, encoding="utf-8-sig")
    try:
        result.to_parquet(parquet_path, index=False)
    except Exception as exc:
        print(f"Parquet nao gerado: {exc}", file=sys.stderr)
    write_metadata(metadata_path, selected_reports)

    print(f"Linhas: {len(result):,}".replace(",", "."))
    print(f"Municipios: {result['codigo_municipio'].nunique():,}".replace(",", "."))
    print(f"CSV: {csv_path}")
    print(f"Parquet: {parquet_path}")


if __name__ == "__main__":
    main()
