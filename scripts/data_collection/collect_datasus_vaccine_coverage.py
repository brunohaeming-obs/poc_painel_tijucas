from __future__ import annotations

import argparse
import csv
import re
import sys
import time
from dataclasses import dataclass
from datetime import date
from html import unescape
from io import StringIO
from pathlib import Path
from typing import Iterable

import pandas as pd
import requests


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"

FORM_URL = "https://tabnet.datasus.gov.br/cgi/dhdat.exe?bd_pni/cpnibr.def"
QUERY_URL = "https://tabnet.datasus.gov.br/cgi/webtabx.exe?bd_pni/cpnibr.def"
FORM_CACHE = RAW_DATA_DIR / "datasus_pni_cobertura_form.html"

MUNICIPIO_LABEL = (
    "Município|CONCAT(CONCAT(DISSEMINACAO.TB_TBN_MUNICIPIO.CO_MUNICIPIO, ' '), "
    "DISSEMINACAO.TB_TBN_MUNICIPIO.NO_MUNICIPIO)  where FATO.CO_MUNICIPIO= "
    "DISSEMINACAO.TB_TBN_MUNICIPIO.CO_MUNICIPIO"
)
ANO_LABEL = "Ano|CO_ANO|1|BD_pni\\CNV\\ANO.CNV"

START_YEAR_BY_VACCINE = {
    "Hepatite B idade <= 30 dias": 2014,
    "Rotavírus Humano": 2004,
    "Meningococo C": 2009,
    "Penta": 2009,
    "Pneumocócica": 2009,
    "Poliomielite 4 anos": 2014,
    "Hepatite A": 2014,
    "Pneumocócica(1º ref)": 2009,
    "Meningococo C (1º ref)": 2009,
    "Poliomielite(1º ref)": 2009,
    "Tríplice Viral  D1": 1999,
    "Tríplice Viral  D2": 2013,
    "Tetra Viral(SRC+VZ)": 2013,
    "DTP REF (4 e 6 anos)": 2014,
    "Dupla adulto e dTpa gestante": 2013,
    "dTpa gestante": 2014,
    "Tetravalente(DTP/Hib)(TETRA)": 2002,
    "Varicela": 2013,
}


@dataclass(frozen=True)
class Option:
    label: str
    value: str
    selected: bool = False


def strip_tags(value: str) -> str:
    return unescape(re.sub(r"<[^>]*>", "", value)).strip()


def attr_value(attrs: str, name: str) -> str | None:
    pattern = rf"""{name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))"""
    match = re.search(pattern, attrs, flags=re.IGNORECASE)
    if not match:
        return None
    return next(group for group in match.groups() if group is not None)


def load_form_html(refresh: bool = False) -> str:
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    if refresh or not FORM_CACHE.exists():
        response = requests.get(FORM_URL, timeout=90)
        response.raise_for_status()
        FORM_CACHE.write_bytes(response.content)
    return FORM_CACHE.read_bytes().decode("iso-8859-1", errors="replace")


def select_options(html: str, select_name: str) -> list[Option]:
    pattern = rf"""<select\b[^>]*\bname\s*=\s*["']?{re.escape(select_name)}["']?[^>]*>(.*?)</select>"""
    match = re.search(pattern, html, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        raise ValueError(f"Select nao encontrado: {select_name}")

    options: list[Option] = []
    for raw_line in match.group(1).splitlines():
        line = raw_line.strip()
        if not line.lower().startswith("<option"):
            continue
        value_match = re.search(r"""value\s*=\s*"(.+?)"\s*(selected)?\s*>""", line, flags=re.IGNORECASE)
        if not value_match:
            value_match = re.search(r'''value\s*=\s*"(.+)''', line, flags=re.IGNORECASE)
        if not value_match:
            continue
        value = value_match.group(1)
        label = strip_tags(line[value_match.end() :])
        selected = "selected" in line.lower()
        options.append(Option(label=label, value=value, selected=selected))
    return options


def selected_or_all(options: Iterable[Option]) -> list[str]:
    options = list(options)
    selected = [option.value for option in options if option.selected]
    return selected or [option.value for option in options]


def years_from_options(options: Iterable[Option], year_start: int | None, year_end: int | None) -> list[Option]:
    rows = []
    for option in options:
        try:
            year = int(option.label)
        except ValueError:
            continue
        if year_start is not None and year < year_start:
            continue
        if year_end is not None and year > year_end:
            continue
        rows.append(option)
    return sorted(rows, key=lambda item: int(item.label))


def build_payload(html: str, year_options: list[Option], vaccine_options: list[Option]) -> dict[str, list[str] | str]:
    payload: dict[str, list[str] | str] = {
        "Linha": MUNICIPIO_LABEL,
        "Coluna": ANO_LABEL,
        "Incremento": [option.value for option in vaccine_options],
        "PAno": [option.value for option in year_options],
        "SRegião": ["TODAS_AS_CATEGORIAS__"],
        "SUnidade da Federação": ["TODAS_AS_CATEGORIAS__"],
        "SMunicípio": ["TODAS_AS_CATEGORIAS__"],
        "SCapital": ["TODAS_AS_CATEGORIAS__"],
        "SRegião de Saúde (CIR)": ["TODAS_AS_CATEGORIAS__"],
        "SMacrorregião de Saúde": ["TODAS_AS_CATEGORIAS__"],
        "SMicrorregião IBGE": ["TODAS_AS_CATEGORIAS__"],
        "SRegião Metropolitana - RIDE": ["TODAS_AS_CATEGORIAS__"],
        "STerritório da Cidadania": ["TODAS_AS_CATEGORIAS__"],
        "SMesorregião PNDR": ["TODAS_AS_CATEGORIAS__"],
        "SAmazônia Legal": ["TODAS_AS_CATEGORIAS__"],
        "SSemiárido": ["TODAS_AS_CATEGORIAS__"],
        "SMunicípios de Fronteira": ["TODAS_AS_CATEGORIAS__"],
        "SCidades Gêmeas": ["TODAS_AS_CATEGORIAS__"],
        "SMunicípio de extrema pobreza": ["TODAS_AS_CATEGORIAS__"],
        "grafico": "",
        "nomedef": "bd_pni/cpnibr.def",
    }

    # Keep future form additions from breaking the request: default every selector to all categories.
    for match in re.finditer(r"<select\b([^>]*)>", html, flags=re.IGNORECASE):
        name = attr_value(match.group(1), "name")
        if name and name.startswith("S") and name not in payload:
            payload[name] = ["TODAS_AS_CATEGORIAS__"]
    return payload


def fetch_table(payload: dict[str, list[str] | str]) -> str:
    last_error: Exception | None = None
    for attempt in range(1, 4):
        try:
            response = requests.post(
                QUERY_URL,
                data=payload,
                timeout=180,
                headers={"User-Agent": "Mozilla/5.0 coleta-dados-tijucas"},
            )
            response.raise_for_status()
            break
        except requests.RequestException as exc:
            last_error = exc
            if attempt == 3:
                raise
            time.sleep(8 * attempt)
    else:
        raise RuntimeError(f"Falha na requisicao TabNet: {last_error}")
    text = response.content.decode("iso-8859-1", errors="replace")
    if "Ocorreu um erro" in text or "Traceback" in text:
        raw_error = strip_tags(text)
        raise RuntimeError(raw_error[-1200:])
    if "não foram encontrados" in text.lower() or "nenhum registro" in text.lower():
        raise RuntimeError("TabNet retornou consulta sem registros.")
    return text


def parse_tables(html: str) -> list[pd.DataFrame]:
    try:
        return pd.read_html(StringIO(html), decimal=",", thousands=".")
    except ValueError:
        return []


def parse_google_datatable(html: str) -> pd.DataFrame:
    columns = re.findall(r"""data\.addColumn\('(?:string|number)'\s*,\s*'([^']+)'\);""", html)
    if not columns:
        raise RuntimeError("Colunas google.visualization.DataTable nao encontradas.")

    rows_block = re.search(r"data\.addRows\(\[(.*?)\]\s*\);", html, flags=re.DOTALL)
    if not rows_block:
        raise RuntimeError("Linhas google.visualization.DataTable nao encontradas.")

    rows: list[list[object]] = []
    value_pattern = re.compile(r"""\{v:\s*([-+]?\d+(?:\.\d+)?)\s*,""")
    row_pattern = re.compile(r"""\[\s*"(.+?)"\s*,(.*)\]\s*,?\s*$""")
    for raw_line in rows_block.group(1).splitlines():
        row_match = row_pattern.search(raw_line.strip())
        if not row_match:
            continue
        label = row_match.group(1).replace("\\'", "'").replace('\\"', '"')
        values = [float(value) for value in value_pattern.findall(row_match.group(2))]
        rows.append([label, *values])

    if not rows:
        raise RuntimeError("Nenhuma linha extraida do google.visualization.DataTable.")
    return pd.DataFrame(rows, columns=columns)


def normalize_table(table: pd.DataFrame, vaccine_name: str) -> pd.DataFrame:
    table = table.copy()
    table.columns = [strip_tags(str(col)) for col in table.columns]
    first_col = table.columns[0]
    table = table.rename(columns={first_col: "municipio"})
    table = table[~table["municipio"].astype(str).str.contains("Total", case=False, na=False)]
    table = table[~table["municipio"].astype(str).str.contains("Município", case=False, na=False)]
    table = table[table["municipio"].notna()]

    long_df = table.melt(id_vars=["municipio"], var_name="ano", value_name="cobertura_pct")
    long_df["ano"] = pd.to_numeric(long_df["ano"], errors="coerce").astype("Int64")
    long_df = long_df[long_df["ano"].notna()]
    long_df["cobertura_pct"] = pd.to_numeric(long_df["cobertura_pct"], errors="coerce")
    long_df["codigo_municipio"] = long_df["municipio"].astype(str).str.extract(r"^(\d{6})")[0]
    long_df["nome_municipio"] = long_df["municipio"].astype(str).str.replace(r"^\d{6}\s+", "", regex=True).str.strip()
    long_df["vacina"] = vaccine_name
    return long_df[["codigo_municipio", "nome_municipio", "ano", "vacina", "cobertura_pct"]]


def write_metadata(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["campo", "valor"])
        writer.writeheader()
        writer.writerows(rows)


def chunked(values: list[Option], size: int) -> Iterable[list[Option]]:
    for start in range(0, len(values), size):
        yield values[start : start + size]


def main() -> None:
    parser = argparse.ArgumentParser(description="Coleta cobertura vacinal municipal no TabNet/DATASUS.")
    parser.add_argument("--refresh-form", action="store_true", help="Baixa novamente o formulario do TabNet.")
    parser.add_argument("--year-start", type=int, default=1994)
    parser.add_argument("--year-end", type=int, default=None)
    parser.add_argument("--test", action="store_true", help="Coleta somente uma vacina e dois anos.")
    parser.add_argument("--year-chunk-size", type=int, default=5, help="Quantidade de anos por requisicao TabNet.")
    parser.add_argument("--sleep", type=float, default=1.2, help="Pausa entre requisicoes de vacinas.")
    args = parser.parse_args()

    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

    html = load_form_html(refresh=args.refresh_form)
    years = years_from_options(select_options(html, "PAno"), args.year_start, args.year_end)
    vaccines = select_options(html, "Incremento")
    if args.test:
        years = years[-2:]
        vaccines = vaccines[:1]
    if not years:
        raise SystemExit("Nenhum ano selecionado.")
    if not vaccines:
        raise SystemExit("Nenhuma vacina encontrada.")

    collected: list[pd.DataFrame] = []
    raw_dir = RAW_DATA_DIR / "datasus_pni_cobertura"
    raw_dir.mkdir(parents=True, exist_ok=True)

    print(f"Anos: {years[0].label}-{years[-1].label}; vacinas: {len(vaccines)}")
    year_chunks = list(chunked(years, args.year_chunk_size))
    total_requests = len(vaccines) * len(year_chunks)
    request_index = 0

    for vaccine_index, vaccine in enumerate(vaccines, start=1):
        safe_name = re.sub(r"[^A-Za-z0-9_-]+", "_", vaccine.label).strip("_")
        min_year = START_YEAR_BY_VACCINE.get(vaccine.label, args.year_start)
        vaccine_year_chunks = [
            [year for year in year_chunk if int(year.label) >= min_year]
            for year_chunk in year_chunks
        ]
        vaccine_year_chunks = [year_chunk for year_chunk in vaccine_year_chunks if year_chunk]
        for year_chunk in vaccine_year_chunks:
            request_index += 1
            chunk_label = f"{year_chunk[0].label}_{year_chunk[-1].label}"
            raw_path = raw_dir / f"cobertura_{safe_name}_{chunk_label}.html"
            empty_path = raw_dir / f"cobertura_{safe_name}_{chunk_label}.empty"
            print(f"[{request_index}/{total_requests}] {vaccine.label} | {year_chunk[0].label}-{year_chunk[-1].label}")
            if empty_path.exists():
                continue
            if raw_path.exists():
                response_html = raw_path.read_text(encoding="iso-8859-1", errors="replace")
            else:
                payload = build_payload(html, year_chunk, [vaccine])
                try:
                    response_html = fetch_table(payload)
                except RuntimeError as exc:
                    if "sem registros" in str(exc).lower():
                        print(f"  sem registros para {vaccine.label} em {year_chunk[0].label}-{year_chunk[-1].label}")
                        empty_path.write_text("sem registros", encoding="utf-8")
                        continue
                    raise
                raw_path.write_text(response_html, encoding="iso-8859-1", errors="replace")
                time.sleep(args.sleep)
            tables = parse_tables(response_html)
            data_tables = [table for table in tables if len(table.columns) >= 2 and len(table) > 5]
            table = data_tables[0] if data_tables else parse_google_datatable(response_html)
            collected.append(normalize_table(table, vaccine.label))

    result = pd.concat(collected, ignore_index=True)
    result = result.sort_values(["codigo_municipio", "vacina", "ano"], kind="stable")
    csv_path = PROCESSED_DATA_DIR / "datasus_cobertura_vacinal_municipios_brasil.csv"
    parquet_path = PROCESSED_DATA_DIR / "datasus_cobertura_vacinal_municipios_brasil.parquet"
    result.to_csv(csv_path, index=False, encoding="utf-8-sig")
    try:
        result.to_parquet(parquet_path, index=False)
    except Exception as exc:
        print(f"Parquet nao gerado: {exc}", file=sys.stderr)

    write_metadata(
        PROCESSED_DATA_DIR / "datasus_cobertura_vacinal_municipios_brasil_metadata.csv",
        [
            {"campo": "fonte", "valor": "DATASUS/TabNet, Imunizacoes desde 1994, Cobertura"},
            {"campo": "url_formulario", "valor": FORM_URL},
            {"campo": "url_consulta", "valor": QUERY_URL},
            {"campo": "data_coleta", "valor": date.today().isoformat()},
            {"campo": "anos", "valor": f"{years[0].label}-{years[-1].label}"},
            {"campo": "vacinas", "valor": "; ".join(vaccine.label for vaccine in vaccines)},
            {"campo": "observacao", "valor": "Dados de cobertura vacinal do DATASUS estao sujeitos a revisoes retroativas."},
        ],
    )
    print(f"Linhas: {len(result):,}".replace(",", "."))
    print(f"CSV: {csv_path}")


if __name__ == "__main__":
    main()
