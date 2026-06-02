from __future__ import annotations

import csv
import json
import shutil
from collections import defaultdict
from datetime import datetime
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed" / "educacao"
PUBLISHED_DIR = PROJECT_ROOT / "data" / "published" / "educacao"
PUBLIC_DATA_DIR = PROJECT_ROOT / "public" / "data" / "educacao"
PUBLIC_DOWNLOADS_DIR = PROJECT_ROOT / "public" / "downloads" / "educacao"

INDICADORES_LONG_CSV = PROCESSED_DIR / "painel_educacao_tijucas_indicadores_long.csv"
MAPA_ESCOLAS_CSV = PROCESSED_DIR / "painel_educacao_tijucas_mapa_escolas.csv"

OUTPUT_FILES = {
    "indicadores_long": PUBLISHED_DIR / "educacao_indicadores_long.json",
    "series_temporais": PUBLISHED_DIR / "educacao_series_temporais.json",
    "cards_resumo": PUBLISHED_DIR / "educacao_cards_resumo.json",
    "mapa_escolas": PUBLISHED_DIR / "educacao_mapa_escolas.json",
    "metadata": PUBLISHED_DIR / "educacao_metadata.json",
}

CARD_PRIORITIES = [
    "Escolas em funcionamento",
    "Matrículas totais da educação básica",
    "Docentes totais",
    "Turmas totais",
    "Percentual de escolas com internet",
]

METADATA_LIMITACOES = [
    "Fonte principal: Censo Escolar/INEP.",
    "As bases finais foram filtradas para Tijucas/SC e agregadas para consumo em painel público.",
    "Matrículas por turma e matrículas por docente são aproximações locais, não indicadores oficiais do INEP.",
    "Em 2025, a comparabilidade exige adaptação porque a estrutura passou a ser multi-tabela.",
    "A base de escolas com latitude e longitude foi preparada para uso futuro em mapa interativo.",
    "Este pacote não inclui IDEB, Saeb e indicadores oficiais de fluxo escolar.",
]

METADATA_CUIDADOS = [
    "Evitar ranking de escolas.",
    "Não publicar dados individualizados de estudantes, docentes ou gestores.",
    "Usar a base de escolas como inventário de equipamentos educacionais, não como mapa de desempenho.",
    "Documentar fonte, ano de referência e comparabilidade em cada visualização do painel.",
]


def ensure_directories() -> None:
    for directory in (PUBLISHED_DIR, PUBLIC_DATA_DIR, PUBLIC_DOWNLOADS_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def write_json(path: Path, payload: object) -> None:
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def parse_number(value: str | None) -> int | float | None:
    if value is None:
        return None

    normalized = value.strip()
    if not normalized:
        return None

    try:
        numeric = float(normalized.replace(",", "."))
    except ValueError:
        return None

    if numeric.is_integer():
        return int(numeric)
    return round(numeric, 2)


def build_indicadores_long(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    payload: list[dict[str, object]] = []
    for row in rows:
        payload.append(
            {
                "ano": row["ano"],
                "tema": row["tema"],
                "indicador": row["indicador"],
                "valor": parse_number(row["valor"]),
                "unidade": row["unidade"],
                "fonte": row["fonte"],
                "base_origem": row["base_origem"],
                "variaveis_usadas": row["variaveis_usadas"],
                "nivel_agregacao": row["nivel_agregacao"],
                "comparabilidade_2014_2025": row["comparabilidade_2014_2025"],
                "observacao_metodologica": row["observacao_metodologica"],
                "atualizado_em": row["atualizado_em"],
            }
        )
    return payload


def build_series_temporais(rows: list[dict[str, object]]) -> dict[str, object]:
    grouped: dict[tuple[str, ...], dict[str, object]] = {}
    years: list[str] = []

    for row in rows:
        year = str(row["ano"])
        if year not in years:
            years.append(year)

        key = (
            str(row["tema"]),
            str(row["indicador"]),
            str(row["unidade"]),
            str(row["fonte"]),
            str(row["base_origem"]),
            str(row["variaveis_usadas"]),
            str(row["comparabilidade_2014_2025"]),
            str(row["observacao_metodologica"]),
        )
        if key not in grouped:
            grouped[key] = {
                "tema": row["tema"],
                "indicador": row["indicador"],
                "unidade": row["unidade"],
                "fonte": row["fonte"],
                "base_origem": row["base_origem"],
                "variaveis_usadas": row["variaveis_usadas"],
                "comparabilidade_2014_2025": row["comparabilidade_2014_2025"],
                "observacao_metodologica": row["observacao_metodologica"],
                "serie": [],
            }
        grouped[key]["serie"].append({"ano": year, "valor": row["valor"]})

    return {"anos_disponiveis": years, "series": list(grouped.values())}


def build_cards_resumo(rows: list[dict[str, object]]) -> dict[str, object]:
    years = sorted({str(row["ano"]) for row in rows})
    latest_year = years[-1]
    latest_rows = [row for row in rows if str(row["ano"]) == latest_year]
    lookup = {str(row["indicador"]): row for row in latest_rows}

    cards: list[dict[str, object]] = []
    for indicator_name in CARD_PRIORITIES:
        row = lookup.get(indicator_name)
        if not row:
            continue
        cards.append(
            {
                "ano": row["ano"],
                "tema": row["tema"],
                "indicador": row["indicador"],
                "valor": row["valor"],
                "unidade": row["unidade"],
                "fonte": row["fonte"],
                "observacao": row["observacao_metodologica"],
                "comparabilidade_2014_2025": row["comparabilidade_2014_2025"],
            }
        )

    if len(cards) < 5:
        existing_names = {str(card["indicador"]) for card in cards}
        for row in latest_rows:
            if str(row["indicador"]) in existing_names:
                continue
            cards.append(
                {
                    "ano": row["ano"],
                    "tema": row["tema"],
                    "indicador": row["indicador"],
                    "valor": row["valor"],
                    "unidade": row["unidade"],
                    "fonte": row["fonte"],
                    "observacao": row["observacao_metodologica"],
                    "comparabilidade_2014_2025": row["comparabilidade_2014_2025"],
                }
            )
            existing_names.add(str(row["indicador"]))
            if len(cards) == 5:
                break

    return {
        "cards": cards[:5],
        "observacao": "Cards resumem o último ano disponível da base agregada.",
    }


def build_mapa_escolas(rows: list[dict[str, str]]) -> dict[str, object]:
    payload_rows: list[dict[str, str]] = []
    years: list[str] = []
    for row in rows:
        year = row["ano"]
        if year not in years:
            years.append(year)
        payload_rows.append(
            {
                "ano": row["ano"],
                "co_entidade": row["co_entidade"],
                "nome_escola": row["nome_escola"],
                "dependencia_administrativa": row["dependencia_administrativa"],
                "localizacao": row["localizacao"],
                "bairro": row["bairro"],
                "endereco": row["endereco"],
                "cep": row["cep"],
                "latitude": row["latitude"],
                "longitude": row["longitude"],
                "etapas_ofertadas_resumo": row["etapas_ofertadas_resumo"],
            }
        )
    return {"anos_disponiveis": years, "registros": payload_rows}


def detect_missing_value_alerts() -> list[str]:
    alerts: list[str] = []
    ignored_columns = {
        "ano",
        "co_entidade",
        "nome_escola",
        "bairro",
        "endereco",
        "cep",
        "latitude",
        "longitude",
    }

    for csv_path in sorted(PROCESSED_DIR.glob("*.csv")):
        rows = read_csv_rows(csv_path)
        missing_by_column: dict[str, list[str]] = defaultdict(list)
        for row in rows:
            year = row.get("ano", "sem ano")
            for column, value in row.items():
                if column in ignored_columns:
                    continue
                if value is None or not value.strip():
                    missing_by_column[column].append(year)

        for column, years in missing_by_column.items():
            unique_years: list[str] = []
            for year in years:
                if year not in unique_years:
                    unique_years.append(year)
            alerts.append(f"{csv_path.name}: {column} ausente em {', '.join(unique_years)}")

    return alerts


def build_metadata(
    indicadores_rows: list[dict[str, object]],
    mapa_rows: list[dict[str, str]],
) -> dict[str, object]:
    years = sorted({str(row["ano"]) for row in indicadores_rows})
    json_names = [path.name for path in OUTPUT_FILES.values()]
    csv_names = sorted(path.name for path in PROCESSED_DIR.glob("*.csv"))
    return {
        "pacote": "educacao_tijucas",
        "municipio": "Tijucas",
        "uf": "SC",
        "fonte_principal": "Censo Escolar/INEP",
        "anos_disponiveis": years,
        "arquivos_csv": csv_names,
        "jsons_publicados": json_names,
        "linhas_mapa_escolas": len(mapa_rows),
        "limitacoes": METADATA_LIMITACOES,
        "cuidados_publicacao": METADATA_CUIDADOS,
        "alertas_variaveis_ausentes": detect_missing_value_alerts(),
        "gerado_em": datetime.now().astimezone().isoformat(timespec="seconds"),
    }


def copy_outputs() -> tuple[list[str], list[str]]:
    copied_jsons: list[str] = []
    copied_csvs: list[str] = []

    for json_path in OUTPUT_FILES.values():
        destination = PUBLIC_DATA_DIR / json_path.name
        shutil.copy2(json_path, destination)
        copied_jsons.append(destination.name)

    for csv_path in sorted(PROCESSED_DIR.glob("*.csv")):
        destination = PUBLIC_DOWNLOADS_DIR / csv_path.name
        shutil.copy2(csv_path, destination)
        copied_csvs.append(destination.name)

    return copied_jsons, copied_csvs


def main() -> None:
    ensure_directories()

    if not INDICADORES_LONG_CSV.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {INDICADORES_LONG_CSV}")
    if not MAPA_ESCOLAS_CSV.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {MAPA_ESCOLAS_CSV}")

    indicadores_long_rows = build_indicadores_long(read_csv_rows(INDICADORES_LONG_CSV))
    mapa_escolas_rows = read_csv_rows(MAPA_ESCOLAS_CSV)

    write_json(OUTPUT_FILES["indicadores_long"], indicadores_long_rows)
    write_json(OUTPUT_FILES["series_temporais"], build_series_temporais(indicadores_long_rows))
    write_json(OUTPUT_FILES["cards_resumo"], build_cards_resumo(indicadores_long_rows))
    write_json(OUTPUT_FILES["mapa_escolas"], build_mapa_escolas(mapa_escolas_rows))
    write_json(
        OUTPUT_FILES["metadata"],
        build_metadata(indicadores_long_rows, mapa_escolas_rows),
    )

    copied_jsons, copied_csvs = copy_outputs()

    print("Publicação de educação concluída.")
    print("JSONs gerados em data/published/educacao:")
    for json_path in OUTPUT_FILES.values():
        print(f" - {json_path.relative_to(PROJECT_ROOT)}")

    print("JSONs copiados para public/data/educacao:")
    for name in copied_jsons:
        print(f" - public/data/educacao/{name}")

    print("CSVs copiados para public/downloads/educacao:")
    for name in copied_csvs:
        print(f" - public/downloads/educacao/{name}")


if __name__ == "__main__":
    main()
