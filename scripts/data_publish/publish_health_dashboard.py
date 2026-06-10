from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
HEALTH_DATA_DIR = PROJECT_ROOT / "data" / "processed" / "saude"
PUBLIC_DATA_DIR = PROJECT_ROOT / "public" / "data"

TIJUCAS_CODE_6 = "421800"
TIJUCAS_CODE_7 = "4218004"
SC_CODE = "42"

PROCEDURES_PATH = HEALTH_DATA_DIR / "datasus_procedimentos_tijucas_sc_mensal.csv"
APS_PATH = HEALTH_DATA_DIR / "relatorioaps_cobertura_municipios_brasil.parquet"
VACCINATION_PATH = HEALTH_DATA_DIR / "datasus_cobertura_vacinal_municipios_brasil.parquet"

OUTPUT_DASHBOARD = PUBLIC_DATA_DIR / "saude_dashboard.json"
OUTPUT_PROCEDURES = PUBLIC_DATA_DIR / "saude_procedimentos.json"
OUTPUT_APS = PUBLIC_DATA_DIR / "saude_aps.json"
OUTPUT_VACCINATION = PUBLIC_DATA_DIR / "saude_vacinacao.json"

SELECTED_VACCINES = [
    "BCG",
    "Penta",
    "Poliomielite",
    "Tríplice Viral  D1",
    "Tríplice Viral  D2",
    "Meningococo C",
    "Pneumocócica",
    "dTpa gestante",
]


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def clean_number(value: object, digits: int = 2) -> float | int | None:
    if value is None or pd.isna(value):
        return None
    parsed = float(value)
    if parsed.is_integer():
        return int(parsed)
    return round(parsed, digits)


def format_competence(year: int | float | None, month: int | float | None) -> str | None:
    if year is None or month is None or pd.isna(year) or pd.isna(month):
        return None
    return f"{int(month):02d}/{int(year)}"


def parse_competence(value: object) -> tuple[int | None, int | None, str | None]:
    if value is None or pd.isna(value):
        return None, None, None
    text = str(value)
    if len(text) == 6 and text.isdigit():
        return int(text[:4]), int(text[4:]), f"{int(text[4:]):02d}/{text[:4]}"
    if "/" in text:
        first, second = text.split("/", 1)
        if first.isdigit() and second.isdigit() and len(first) == 2:
            return int(second), int(first), f"{first}/{second}"
    return None, None, text


def build_procedures() -> dict[str, object]:
    df = pd.read_csv(PROCEDURES_PATH, parse_dates=["data"])
    df = df.sort_values("data").reset_index(drop=True)
    first_tijucas = df["procedimentosTijucas"].iloc[0]
    first_sc = df["procedimentosSc"].iloc[0]
    df["indiceTijucas"] = df["procedimentosTijucas"] / first_tijucas * 100
    df["indiceSc"] = df["procedimentosSc"] / first_sc * 100
    df["mediaMovel3"] = df["procedimentosTijucas"].rolling(3, min_periods=1).mean()
    df["variacaoMensalPct"] = df["procedimentosTijucas"].pct_change() * 100
    df["participacaoScPct"] = df["procedimentosTijucas"] / df["procedimentosSc"] * 100

    latest = df.iloc[-1]
    previous = df.iloc[-2]
    avg12 = df.tail(12)["procedimentosTijucas"].mean()

    series = [
        {
            "data": row.data.date().isoformat(),
            "periodo": row.periodo,
            "procedimentosTijucas": int(row.procedimentosTijucas),
            "procedimentosSc": int(row.procedimentosSc),
            "indiceTijucas": clean_number(row.indiceTijucas),
            "indiceSc": clean_number(row.indiceSc),
            "mediaMovel3": clean_number(row.mediaMovel3),
            "variacaoMensalPct": clean_number(row.variacaoMensalPct),
            "participacaoScPct": clean_number(row.participacaoScPct, 4),
        }
        for row in df.itertuples(index=False)
    ]

    return {
        "metadata": {
            "fonte": "DataSUS/SIA",
            "periodoInicio": df["data"].min().date().isoformat(),
            "periodoFim": df["data"].max().date().isoformat(),
            "ultimaCompetencia": str(latest.periodo),
            "geradoEm": datetime.now().date().isoformat(),
        },
        "summary": {
            "ultimoValor": int(latest.procedimentosTijucas),
            "ultimaCompetencia": str(latest.periodo),
            "variacaoMensalPct": clean_number((latest.procedimentosTijucas / previous.procedimentosTijucas - 1) * 100),
            "mediaUltimos12Meses": clean_number(avg12),
            "participacaoScPct": clean_number(latest.participacaoScPct, 4),
        },
        "series": series,
    }


def build_aps() -> dict[str, object]:
    df = pd.read_parquet(APS_PATH)
    df["codigo_municipio"] = df["codigo_municipio"].astype(str).str[:6]
    tijucas = df[df["codigo_municipio"].eq(TIJUCAS_CODE_6)].copy()

    parsed = tijucas["competencia"].apply(parse_competence)
    tijucas["ano_calc"] = parsed.apply(lambda item: item[0])
    tijucas["mes_calc"] = parsed.apply(lambda item: item[1])
    tijucas["competencia_label"] = parsed.apply(lambda item: item[2])
    tijucas = tijucas[tijucas["ano_calc"].notna() & tijucas["mes_calc"].notna()].copy()
    tijucas["competencia_ordem"] = tijucas["ano_calc"].astype(int) * 100 + tijucas["mes_calc"].astype(int)

    def latest_row(report: str) -> pd.Series | None:
        rows = tijucas[tijucas["tipo_relatorio"].eq(report)].sort_values("competencia_ordem")
        return None if rows.empty else rows.iloc[-1]

    aps_latest = latest_row("aps")
    acs_latest = latest_row("acs")
    sb_latest = latest_row("sb")
    pns_rows = tijucas[tijucas["tipo_relatorio"].eq("pns")].sort_values("competencia_ordem")

    month_keys = sorted(tijucas["competencia_ordem"].dropna().astype(int).unique())
    series = []
    for key in month_keys:
        rows = tijucas[tijucas["competencia_ordem"].eq(key)]
        aps = rows[rows["tipo_relatorio"].eq("aps")]
        acs = rows[rows["tipo_relatorio"].eq("acs")]
        sb = rows[rows["tipo_relatorio"].eq("sb")]
        pns = rows[rows["tipo_relatorio"].eq("pns")]
        year = key // 100
        month = key % 100
        record = {
            "competencia": f"{month:02d}/{year}",
            "ano": int(year),
            "mes": int(month),
            "coberturaAps": clean_number(aps["qtCobertura"].iloc[-1]) if not aps.empty else None,
            "coberturaAcs": clean_number(acs["pcCoberturaAcsAb"].iloc[-1]) if not acs.empty else None,
            "coberturaSaudeBucal": clean_number(sb["pcCoberturaSbAps"].iloc[-1]) if not sb.empty else None,
            "equipesEsf": clean_number(aps["qtEsf"].iloc[-1]) if not aps.empty else None,
            "acsAtivos": clean_number(acs["qtAcsAtivoAb"].iloc[-1]) if not acs.empty else None,
            "equipesSaudeBucal40h": clean_number(sb["qtEquipeSb40h"].iloc[-1]) if not sb.empty else None,
            "equipesSaudeBucal30h": clean_number(sb["qtEquipeSb30h"].iloc[-1]) if not sb.empty else None,
            "equipesSaudeBucal20h": clean_number(sb["qtEquipeSb20h"].iloc[-1]) if not sb.empty else None,
            "cadastrosAps": clean_number(pns["qtTotalCadastroApsPaga"].iloc[-1]) if not pns.empty else None,
            "populacao": clean_number(rows["qtPopulacao"].dropna().iloc[-1]) if rows["qtPopulacao"].notna().any() else None,
        }
        series.append(record)

    latest_competence = max(
        item
        for item in [
            aps_latest["competencia_label"] if aps_latest is not None else None,
            acs_latest["competencia_label"] if acs_latest is not None else None,
            sb_latest["competencia_label"] if sb_latest is not None else None,
        ]
        if item
    )

    return {
        "metadata": {
            "fonte": "Relatórios Públicos da APS",
            "codigoMunicipio": TIJUCAS_CODE_7,
            "codigoMunicipioBase": TIJUCAS_CODE_6,
            "ultimaCompetencia": latest_competence,
            "geradoEm": datetime.now().date().isoformat(),
        },
        "summary": {
            "coberturaAps": {
                "valor": clean_number(aps_latest["qtCobertura"]) if aps_latest is not None else None,
                "competencia": aps_latest["competencia_label"] if aps_latest is not None else None,
                "equipesEsf": clean_number(aps_latest["qtEsf"]) if aps_latest is not None else None,
                "capacidadeEquipe": clean_number(aps_latest["qtCapacidadeEquipe"]) if aps_latest is not None else None,
                "populacao": clean_number(aps_latest["qtPopulacao"]) if aps_latest is not None else None,
            },
            "coberturaAcs": {
                "valor": clean_number(acs_latest["pcCoberturaAcsAb"]) if acs_latest is not None else None,
                "competencia": acs_latest["competencia_label"] if acs_latest is not None else None,
                "acsAtivos": clean_number(acs_latest["qtAcsAtivoAb"]) if acs_latest is not None else None,
                "populacao": clean_number(acs_latest["qtPopulacao"]) if acs_latest is not None else None,
            },
            "saudeBucal": {
                "valor": clean_number(sb_latest["pcCoberturaSbAps"]) if sb_latest is not None else None,
                "competencia": sb_latest["competencia_label"] if sb_latest is not None else None,
                "equipes40h": clean_number(sb_latest["qtEquipeSb40h"]) if sb_latest is not None else None,
                "equipes20h": clean_number(sb_latest["qtEquipeSb20h"]) if sb_latest is not None else None,
                "populacao": clean_number(sb_latest["qtPopulacao"]) if sb_latest is not None else None,
            },
            "cadastros": {
                "disponivel": not pns_rows.empty,
                "ultimaCompetencia": pns_rows.iloc[-1]["competencia_label"] if not pns_rows.empty else None,
                "valor": clean_number(pns_rows.iloc[-1]["qtTotalCadastroApsPaga"]) if not pns_rows.empty else None,
            },
        },
        "series": series,
    }


def vaccine_status(value: float | int | None) -> str:
    if value is None:
        return "sem dado"
    if value > 120:
        return "revisar interpretação"
    if value >= 95:
        return "adequada"
    if value >= 90:
        return "atenção moderada"
    return "atenção"


def build_vaccination() -> dict[str, object]:
    df = pd.read_parquet(VACCINATION_PATH)
    df["codigo_municipio"] = df["codigo_municipio"].astype(str).str[:6]
    df["ano"] = pd.to_numeric(df["ano"], errors="coerce")
    latest_year = int(df[df["codigo_municipio"].eq(TIJUCAS_CODE_6)]["ano"].max())

    selected = df[df["vacina"].isin(SELECTED_VACCINES)].copy()
    tijucas = selected[selected["codigo_municipio"].eq(TIJUCAS_CODE_6)].copy()
    sc = selected[selected["codigo_municipio"].str.startswith(SC_CODE)].copy()

    latest_rows = tijucas[tijucas["ano"].eq(latest_year)].copy()
    latest_rows["status"] = latest_rows["cobertura_pct"].apply(vaccine_status)
    latest_rows["ordem"] = latest_rows["vacina"].apply(lambda value: SELECTED_VACCINES.index(value))
    latest_rows = latest_rows.sort_values("ordem")

    sc_latest = (
        sc[sc["ano"].eq(latest_year)]
        .groupby("vacina", as_index=False)["cobertura_pct"]
        .mean()
        .rename(columns={"cobertura_pct": "mediaSc"})
    )

    evolution = []
    for row in tijucas.sort_values(["ano", "vacina"]).itertuples(index=False):
        evolution.append(
            {
                "ano": int(row.ano),
                "vacina": row.vacina,
                "cobertura": clean_number(row.cobertura_pct),
            }
        )

    comparison = latest_rows.merge(sc_latest, on="vacina", how="left")
    attentions = latest_rows[
        latest_rows["status"].isin(["atenção", "atenção moderada", "revisar interpretação"])
    ]

    return {
        "metadata": {
            "fonte": "DataSUS/TabNet",
            "codigoMunicipio": TIJUCAS_CODE_7,
            "codigoMunicipioBase": TIJUCAS_CODE_6,
            "ultimoAno": latest_year,
            "referenciaCoberturaPct": 95,
            "observacao": "Coberturas acima de 100% podem ocorrer por diferenças entre registros administrativos e estimativas populacionais.",
            "geradoEm": datetime.now().date().isoformat(),
        },
        "summary": {
            "ultimoAno": latest_year,
            "vacinasSelecionadas": len(SELECTED_VACCINES),
            "vacinasEmAtencao": int(len(attentions)),
        },
        "latest": [
            {
                "vacina": row.vacina,
                "cobertura": clean_number(row.cobertura_pct),
                "status": row.status,
            }
            for row in latest_rows.itertuples(index=False)
        ],
        "evolution": evolution,
        "comparisonSc": [
            {
                "vacina": row.vacina,
                "tijucas": clean_number(row.cobertura_pct),
                "mediaSc": clean_number(row.mediaSc),
                "status": row.status,
            }
            for row in comparison.itertuples(index=False)
        ],
    }


def build_dashboard(procedures: dict[str, object], aps: dict[str, object], vaccination: dict[str, object]) -> dict[str, object]:
    aps_summary = aps["summary"]
    latest_dates = [
        procedures["metadata"]["ultimaCompetencia"],
        aps["metadata"]["ultimaCompetencia"],
        str(vaccination["metadata"]["ultimoAno"]),
    ]
    return {
        "metadata": {
            "titulo": "Saúde em Tijucas",
            "subtitulo": "Entenda como a rede pública atende a população, amplia a cobertura da atenção básica e protege por meio da vacinação.",
            "ultimaAtualizacao": max(latest_dates),
            "geradoEm": datetime.now().date().isoformat(),
        },
        "cards": [
            {
                "id": "procedimentos",
                "label": "Procedimentos ambulatoriais",
                "value": procedures["summary"]["ultimoValor"],
                "unit": "procedimentos",
                "note": procedures["summary"]["ultimaCompetencia"],
                "source": "DataSUS/SIA",
            },
            {
                "id": "coberturaAps",
                "label": "Cobertura APS",
                "value": aps_summary["coberturaAps"]["valor"],
                "unit": "%",
                "note": aps_summary["coberturaAps"]["competencia"],
                "source": "Relatórios Públicos da APS",
            },
            {
                "id": "coberturaAcs",
                "label": "Cobertura ACS",
                "value": aps_summary["coberturaAcs"]["valor"],
                "unit": "%",
                "note": aps_summary["coberturaAcs"]["competencia"],
                "source": "Relatórios Públicos da APS",
            },
            {
                "id": "saudeBucal",
                "label": "Saúde Bucal APS",
                "value": aps_summary["saudeBucal"]["valor"],
                "unit": "%",
                "note": aps_summary["saudeBucal"]["competencia"],
                "source": "Relatórios Públicos da APS",
            },
            {
                "id": "vacinasAtencao",
                "label": "Vacinas em atenção",
                "value": vaccination["summary"]["vacinasEmAtencao"],
                "unit": "vacinas",
                "note": str(vaccination["summary"]["ultimoAno"]),
                "source": "DataSUS/TabNet",
            },
        ],
    }


def main() -> None:
    procedures = build_procedures()
    aps = build_aps()
    vaccination = build_vaccination()
    dashboard = build_dashboard(procedures, aps, vaccination)

    write_json(OUTPUT_PROCEDURES, procedures)
    write_json(OUTPUT_APS, aps)
    write_json(OUTPUT_VACCINATION, vaccination)
    write_json(OUTPUT_DASHBOARD, dashboard)

    print(f"Arquivos publicados em {PUBLIC_DATA_DIR.relative_to(PROJECT_ROOT)}")
    for path in (OUTPUT_DASHBOARD, OUTPUT_PROCEDURES, OUTPUT_APS, OUTPUT_VACCINATION):
        print(path.relative_to(PROJECT_ROOT))


if __name__ == "__main__":
    main()
