from __future__ import annotations

import json
import math
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
FISCAL_DATA_DIR = PROCESSED_DATA_DIR / "fiscal"
DOCS_DIR = PROJECT_ROOT / "docs"
FPM_ANUAL_PATH = FISCAL_DATA_DIR / "fpm_municipios_sc_anual_1997_2025.parquet"
CONTAS_PUBLICAS_JSON = PROJECT_ROOT / "src" / "features" / "contas-publicas" / "data" / "contas_publicas_tijucas.json"

TIJUCAS_IBGE = "4218004"
MIN_PEERS = 10
PEER_POP_MIN = 40_000
PEER_POP_MAX = 80_000


@dataclass(frozen=True)
class AccountRule:
    name: str
    anexo: str
    columns: tuple[str, ...]
    codes: tuple[str, ...] = ()
    code_prefixes: tuple[str, ...] = ()
    contains: tuple[str, ...] = ()
    excludes: tuple[str, ...] = ()


def strip_accents(value: str) -> str:
    return "".join(char for char in unicodedata.normalize("NFKD", value) if not unicodedata.combining(char))


def normalize_text(value: object) -> str:
    if pd.isna(value):
        return ""
    return strip_accents(str(value)).lower()


def normalize_code(value: object) -> str:
    if pd.isna(value):
        return ""
    return re.sub(r"\s+", "", str(value).strip())


def normalize_anexo(value: object) -> str:
    return str(value).replace("DCA-", "") if not pd.isna(value) else ""


def normalize_column(value: object) -> str:
    if pd.isna(value):
        return ""
    text = str(value).strip()
    aliases = {
        "Inscrição de RP Não Processados": "Inscrição de Restos a Pagar Não Processados",
        "Inscrição de RP Processados": "Inscrição de Restos a Pagar Processados",
    }
    return aliases.get(text, text)


def safe_divide(numerator: float | None, denominator: float | None, multiplier: float = 1.0) -> float | None:
    if numerator is None or denominator is None:
        return None
    if pd.isna(numerator) or pd.isna(denominator) or denominator == 0:
        return None
    return float(numerator) / float(denominator) * multiplier


def calculate_growth(current: float | None, previous: float | None) -> float | None:
    return safe_divide(None if current is None or previous is None else current - previous, previous, 100)


def classify_comparison(value: float | None, median: float | None, higher_is_better: bool = True) -> str:
    if value is None or median is None or pd.isna(value) or pd.isna(median) or median == 0:
        return "indisponivel"
    diff_pct = (value - median) / abs(median)
    if abs(diff_pct) <= 0.05:
        return "proximo da mediana"
    if higher_is_better is None:
        return "acima da mediana" if diff_pct > 0 else "abaixo da mediana"
    if higher_is_better:
        return "bom desempenho relativo" if diff_pct > 0 else "ponto de atencao"
    return "ponto de atencao" if diff_pct > 0 else "bom desempenho relativo"


def percentile_rank(series: pd.Series, value: float | None) -> float | None:
    clean = pd.to_numeric(series, errors="coerce").dropna()
    if value is None or pd.isna(value) or len(clean) < MIN_PEERS:
        return None
    return float((clean.le(value).sum() / len(clean)) * 100)


def calculate_ranking(series: pd.Series, value: float | None, higher_is_better: bool = True) -> int | None:
    clean = pd.to_numeric(series, errors="coerce").dropna()
    if value is None or pd.isna(value) or len(clean) < MIN_PEERS:
        return None
    values = pd.concat([clean, pd.Series([float(value)])], ignore_index=True)
    return int(values.rank(ascending=not higher_is_better, method="min").iloc[-1])


def extract_municipio(instituicao: object) -> str:
    if pd.isna(instituicao):
        return ""
    return re.sub(r"^Prefeitura Municipal de\s+|\s+-\s+[A-Z]{2}$", "", str(instituicao)).strip()


def load_dca() -> pd.DataFrame:
    path = RAW_DATA_DIR / "siconfi" / "SICONFI_DCA_SC_municipios_2013_2024.csv"
    columns = [
        "an_exercicio_consulta",
        "id_ente_consulta",
        "municipio_consulta",
        "exercicio",
        "instituicao",
        "cod_ibge",
        "uf",
        "populacao",
        "anexo",
        "coluna",
        "cod_conta",
        "conta",
        "valor",
    ]
    df = pd.read_csv(path, usecols=columns, low_memory=False)
    df["cd_ibge"] = df["id_ente_consulta"].astype(str).str.zfill(7)
    df["ano"] = pd.to_numeric(df["an_exercicio_consulta"], errors="coerce").astype("Int64")
    df["municipio"] = df["municipio_consulta"].fillna(df["instituicao"].map(extract_municipio))
    df["anexo_norm"] = df["anexo"].map(normalize_anexo)
    df["coluna_norm"] = df["coluna"].map(normalize_column)
    df["cod_norm"] = df["cod_conta"].map(normalize_code)
    df["conta_norm"] = df["conta"].map(normalize_text)
    df["valor"] = pd.to_numeric(df["valor"], errors="coerce")
    df["populacao"] = pd.to_numeric(df["populacao"], errors="coerce")
    return df


def load_tesouro_fpm() -> pd.DataFrame:
    if not FPM_ANUAL_PATH.exists():
        return pd.DataFrame(columns=["cd_ibge", "ano", "fpm_tesouro"])
    fpm = pd.read_parquet(FPM_ANUAL_PATH)
    fpm["cd_ibge"] = pd.to_numeric(fpm["codigo_ibge"], errors="coerce").astype("Int64").astype(str).str.zfill(7)
    fpm["ano"] = pd.to_numeric(fpm["ano"], errors="coerce").astype("Int64")
    fpm["fpm_tesouro"] = pd.to_numeric(fpm["valor_fpm_anual"], errors="coerce")
    fpm = fpm[fpm["uf"].eq("SC")][["cd_ibge", "ano", "fpm_tesouro"]]
    return fpm.dropna(subset=["ano"]).drop_duplicates(["cd_ibge", "ano"])


def merge_tesouro_fpm(indicators: pd.DataFrame, fpm: pd.DataFrame) -> pd.DataFrame:
    if fpm.empty:
        indicators["fonte_fpm"] = np.where(indicators["fpm"].notna(), "DCA/SICONFI", None)
        return indicators
    output = indicators.merge(fpm, on=["cd_ibge", "ano"], how="left")
    output["fpm"] = output["fpm_tesouro"].combine_first(output["fpm"])
    output["fonte_fpm"] = np.where(output["fpm_tesouro"].notna(), "Tesouro Transparente", "DCA/SICONFI")
    output = output.drop(columns=["fpm_tesouro"])
    add_per_capita(output, "fpm_per_capita", "fpm")
    add_ratio(output, "fpm_pct_receita_corrente", "fpm", "receita_corrente")
    add_ratio(output, "fpm_pct_receita_total", "fpm", "receita_total_realizada")
    output["participacao_fpm_receita_corrente"] = output["fpm_pct_receita_corrente"]
    output["participacao_fpm_receita_total"] = output["fpm_pct_receita_total"]
    return output


def add_frontend_aliases(indicators: pd.DataFrame) -> pd.DataFrame:
    output = indicators.copy()
    aliases = {
        "receita_total": "receita_total_realizada",
        "receita_per_capita": "receita_total_realizada_per_capita",
        "despesa_total": "despesa_empenhada_total",
        "despesa_per_capita": "despesa_empenhada_total_per_capita",
        "participacao_transferencias": "transferencias_correntes_pct_receita_corrente",
        "investimento_total": "investimentos",
        "investimento_per_capita": "investimentos_per_capita",
        "investimento_pct_despesa": "investimentos_pct_despesa_total",
        "investimento_pct_receita": "investimentos_pct_receita_corrente",
        "administracao_pct_despesa": "administracao_pct_despesa_total",
        "restos_a_pagar_total": "total_restos_pagar_inscritos",
        "restos_a_pagar_pct_despesa": "total_restos_pagar_pct_empenhado",
    }
    for alias, source in aliases.items():
        if source in output.columns:
            output[alias] = output[source]
    return output


def locate_accounts(df: pd.DataFrame, rule: AccountRule) -> pd.DataFrame:
    mask = df["anexo_norm"].eq(rule.anexo) & df["coluna_norm"].isin(rule.columns)
    if rule.codes:
        mask &= df["cod_norm"].isin(rule.codes)
    if rule.code_prefixes:
        mask &= df["cod_norm"].apply(lambda code: any(code.startswith(prefix) for prefix in rule.code_prefixes))
    for term in rule.contains:
        mask &= df["conta_norm"].str.contains(normalize_text(term), na=False)
    for term in rule.excludes:
        mask &= ~df["conta_norm"].str.contains(normalize_text(term), na=False)
    return df.loc[mask]


def account_value(df: pd.DataFrame, rule: AccountRule) -> pd.Series:
    parts = []
    # Use column priority: the first available column for each municipality-year wins.
    for priority, column in enumerate(rule.columns):
        sub_rule = AccountRule(
            name=rule.name,
            anexo=rule.anexo,
            columns=(column,),
            codes=rule.codes,
            code_prefixes=rule.code_prefixes,
            contains=rule.contains,
            excludes=rule.excludes,
        )
        sub = locate_accounts(df, sub_rule)
        if sub.empty:
            continue
        grouped = sub.groupby(["cd_ibge", "ano"], observed=True)["valor"].sum().rename(rule.name).reset_index()
        grouped["_priority"] = priority
        parts.append(grouped)
    if not parts:
        return pd.Series(dtype="float64", name=rule.name)
    values = pd.concat(parts, ignore_index=True).sort_values("_priority")
    values = values.drop_duplicates(["cd_ibge", "ano"], keep="first")
    return values.set_index(["cd_ibge", "ano"])[rule.name]


def add_metric(base: pd.DataFrame, df: pd.DataFrame, column: str, rule: AccountRule) -> pd.DataFrame:
    values = account_value(df, rule).rename(column)
    return base.join(values, on=["cd_ibge", "ano"])


def add_ratio(frame: pd.DataFrame, target: str, numerator: str, denominator: str, multiplier: float = 100.0) -> None:
    frame[target] = [
        safe_divide(num, den, multiplier)
        for num, den in zip(frame[numerator], frame[denominator], strict=False)
    ]


def add_per_capita(frame: pd.DataFrame, target: str, value_col: str) -> None:
    frame[target] = [safe_divide(value, pop) for value, pop in zip(frame[value_col], frame["populacao"], strict=False)]


def build_base(df: pd.DataFrame) -> pd.DataFrame:
    base = (
        df.groupby(["cd_ibge", "ano"], observed=True)
        .agg(
            municipio=("municipio", "first"),
            uf=("uf", "first"),
            populacao=("populacao", "max"),
        )
        .reset_index()
    )
    base["cd_ibge"] = base["cd_ibge"].astype(str).str.zfill(7)
    return base


REVENUE_COLUMNS = ("Receitas Realizadas", "Receitas Brutas Realizadas")
EXPENSE_COLUMNS = ("Despesas Empenhadas",)

RULES = {
    "receita_total_realizada": AccountRule("receita_total_realizada", "Anexo I-C", REVENUE_COLUMNS, codes=("TotalReceitas",)),
    "receita_corrente": AccountRule(
        "receita_corrente",
        "Anexo I-C",
        REVENUE_COLUMNS,
        codes=("RO1.0.0.0.00.00.00", "RO1.0.0.0.00.0.0"),
    ),
    "receita_tributaria": AccountRule(
        "receita_tributaria",
        "Anexo I-C",
        REVENUE_COLUMNS,
        codes=("RO1.1.0.0.00.00.00", "RO1.1.0.0.00.0.0"),
    ),
    "transferencias_correntes": AccountRule(
        "transferencias_correntes",
        "Anexo I-C",
        REVENUE_COLUMNS,
        codes=("RO1.7.0.0.00.00.00", "RO1.7.0.0.00.0.0"),
    ),
    "cota_parte_icms": AccountRule(
        "cota_parte_icms",
        "Anexo I-C",
        REVENUE_COLUMNS,
        contains=("Cota-Parte do ICMS",),
        excludes=("Desoneracao", "Desoneração"),
    ),
    "fpm": AccountRule("fpm", "Anexo I-C", REVENUE_COLUMNS, contains=("FPM",)),
    "despesa_empenhada_total": AccountRule("despesa_empenhada_total", "Anexo I-D", ("Despesas Empenhadas",), codes=("TotalDespesas",)),
    "despesa_liquidada_total": AccountRule("despesa_liquidada_total", "Anexo I-D", ("Despesas Liquidadas",), codes=("TotalDespesas",)),
    "despesa_paga_total": AccountRule("despesa_paga_total", "Anexo I-D", ("Despesas Pagas",), codes=("TotalDespesas",)),
    "despesa_corrente": AccountRule(
        "despesa_corrente",
        "Anexo I-D",
        EXPENSE_COLUMNS,
        codes=("DO3.0.00.00.00.00", "DO3.0.00.00.00"),
    ),
    "despesa_capital": AccountRule(
        "despesa_capital",
        "Anexo I-D",
        EXPENSE_COLUMNS,
        codes=("DO4.0.00.00.00.00", "DO4.0.00.00.00"),
    ),
    "investimentos": AccountRule(
        "investimentos",
        "Anexo I-D",
        EXPENSE_COLUMNS,
        codes=("DO4.4.00.00.00.00", "DO4.4.00.00.00"),
    ),
    "pessoal_encargos": AccountRule(
        "pessoal_encargos",
        "Anexo I-D",
        EXPENSE_COLUMNS,
        codes=("DO3.1.00.00.00.00", "DO3.1.00.00.00"),
    ),
    "juros_encargos_divida": AccountRule(
        "juros_encargos_divida",
        "Anexo I-D",
        EXPENSE_COLUMNS,
        codes=("DO3.2.00.00.00.00", "DO3.2.00.00.00"),
    ),
    "amortizacao_divida": AccountRule(
        "amortizacao_divida",
        "Anexo I-D",
        EXPENSE_COLUMNS,
        codes=("DO4.6.00.00.00.00", "DO4.6.00.00.00"),
    ),
    "rp_nao_processados_inscritos": AccountRule(
        "rp_nao_processados_inscritos",
        "Anexo I-D",
        ("Inscrição de Restos a Pagar Não Processados",),
        codes=("TotalDespesas",),
    ),
    "rp_processados_inscritos": AccountRule(
        "rp_processados_inscritos",
        "Anexo I-D",
        ("Inscrição de Restos a Pagar Processados",),
        codes=("TotalDespesas",),
    ),
}


OWN_REVENUE_RULES = [
    AccountRule("receita_propria_part", "Anexo I-C", REVENUE_COLUMNS, codes=("RO1.1.0.0.00.00.00", "RO1.1.0.0.00.0.0")),
    AccountRule("receita_propria_part", "Anexo I-C", REVENUE_COLUMNS, codes=("RO1.2.0.0.00.00.00", "RO1.2.0.0.00.0.0")),
    AccountRule("receita_propria_part", "Anexo I-C", REVENUE_COLUMNS, codes=("RO1.3.0.0.00.00.00", "RO1.3.0.0.00.0.0")),
    AccountRule("receita_propria_part", "Anexo I-C", REVENUE_COLUMNS, codes=("RO1.6.0.0.00.00.00", "RO1.6.0.0.00.0.0")),
    AccountRule("receita_propria_part", "Anexo I-C", REVENUE_COLUMNS, codes=("RO1.9.0.0.00.00.00", "RO1.9.0.0.00.0.0")),
]


FUNCTIONS = {
    "saude": "10 - Saúde",
    "educacao": "12 - Educação",
    "urbanismo": "15 - Urbanismo",
    "administracao": "04 - Administração",
    "assistencia_social": "08 - Assistência Social",
    "saneamento": "17 - Saneamento",
    "transporte": "26 - Transporte",
    "seguranca_publica": "06 - Segurança Pública",
    "previdencia": "09 - Previdência Social",
}


FINALISTIC_FUNCTIONS = ["saude", "educacao", "urbanismo", "assistencia_social", "saneamento", "transporte", "seguranca_publica"]
MEIO_FUNCTIONS = ["administracao", "previdencia"]


def build_function_metrics(df: pd.DataFrame) -> pd.DataFrame:
    function_rows = df[
        df["anexo_norm"].eq("Anexo I-E")
        & df["coluna_norm"].eq("Despesas Empenhadas")
        & df["cod_norm"].eq("TotalDespesas")
    ].copy()
    output = []
    for key, label in FUNCTIONS.items():
        values = (
            function_rows[function_rows["conta"].eq(label)]
            .groupby(["cd_ibge", "ano"], observed=True)["valor"]
            .sum()
            .rename(f"despesa_funcao_{key}")
            .reset_index()
        )
        output.append(values)
    if not output:
        return pd.DataFrame(columns=["cd_ibge", "ano"])
    result = output[0]
    for item in output[1:]:
        result = result.merge(item, on=["cd_ibge", "ano"], how="outer")
    return result


def build_indicators(df: pd.DataFrame) -> pd.DataFrame:
    indicators = build_base(df).set_index(["cd_ibge", "ano"]).sort_index()
    for column, rule in RULES.items():
        indicators = add_metric(indicators, df, column, rule)

    own_parts = []
    for rule in OWN_REVENUE_RULES:
        own_parts.append(account_value(df, rule))
    if own_parts:
        own = pd.concat(own_parts, axis=1).sum(axis=1, min_count=1).rename("receita_propria")
        indicators = indicators.join(own, on=["cd_ibge", "ano"])

    function_metrics = build_function_metrics(df).set_index(["cd_ibge", "ano"])
    indicators = indicators.join(function_metrics, how="left")
    indicators = indicators.reset_index()

    indicators["resultado_orcamentario"] = indicators["receita_total_realizada"] - indicators["despesa_empenhada_total"]
    indicators["servico_divida"] = indicators["juros_encargos_divida"].fillna(0) + indicators["amortizacao_divida"].fillna(0)
    indicators["total_restos_pagar_inscritos"] = indicators["rp_nao_processados_inscritos"].fillna(0) + indicators["rp_processados_inscritos"].fillna(0)
    indicators["diferenca_empenhado_pago"] = indicators["despesa_empenhada_total"] - indicators["despesa_paga_total"]
    indicators["diferenca_liquidado_pago"] = indicators["despesa_liquidada_total"] - indicators["despesa_paga_total"]

    for value_col in [
        "receita_total_realizada",
        "receita_propria",
        "receita_tributaria",
        "despesa_empenhada_total",
        "investimentos",
        "fpm",
    ]:
        add_per_capita(indicators, f"{value_col}_per_capita", value_col)

    add_ratio(indicators, "resultado_orcamentario_pct_receita", "resultado_orcamentario", "receita_total_realizada")
    add_ratio(indicators, "receita_propria_pct_receita_corrente", "receita_propria", "receita_corrente")
    add_ratio(indicators, "receita_tributaria_pct_receita_corrente", "receita_tributaria", "receita_corrente")
    add_ratio(indicators, "transferencias_correntes_pct_receita_corrente", "transferencias_correntes", "receita_corrente")
    indicators["dependencia_transferencias_intergovernamentais_pct"] = indicators["transferencias_correntes_pct_receita_corrente"]
    add_ratio(indicators, "cota_parte_icms_pct_receita_corrente", "cota_parte_icms", "receita_corrente")
    add_ratio(indicators, "fpm_pct_receita_corrente", "fpm", "receita_corrente")
    add_ratio(indicators, "fpm_pct_receita_total", "fpm", "receita_total_realizada")
    add_ratio(indicators, "despesa_corrente_pct_despesa_total", "despesa_corrente", "despesa_empenhada_total")
    add_ratio(indicators, "despesa_capital_pct_despesa_total", "despesa_capital", "despesa_empenhada_total")
    add_ratio(indicators, "investimentos_pct_despesa_total", "investimentos", "despesa_empenhada_total")
    add_ratio(indicators, "investimentos_pct_despesa_corrente", "investimentos", "despesa_corrente")
    add_ratio(indicators, "investimentos_pct_receita_corrente", "investimentos", "receita_corrente")
    add_ratio(indicators, "pessoal_encargos_pct_receita_corrente", "pessoal_encargos", "receita_corrente")
    add_ratio(indicators, "juros_encargos_pct_receita_corrente", "juros_encargos_divida", "receita_corrente")
    add_ratio(indicators, "amortizacao_divida_pct_receita_corrente", "amortizacao_divida", "receita_corrente")
    add_ratio(indicators, "servico_divida_pct_receita_corrente", "servico_divida", "receita_corrente")
    add_ratio(indicators, "liquidado_empenhado_pct", "despesa_liquidada_total", "despesa_empenhada_total")
    add_ratio(indicators, "pago_empenhado_pct", "despesa_paga_total", "despesa_empenhada_total")
    add_ratio(indicators, "pago_liquidado_pct", "despesa_paga_total", "despesa_liquidada_total")
    add_ratio(indicators, "rp_nao_processados_pct_empenhado", "rp_nao_processados_inscritos", "despesa_empenhada_total")
    add_ratio(indicators, "rp_processados_pct_empenhado", "rp_processados_inscritos", "despesa_empenhada_total")
    add_ratio(indicators, "total_restos_pagar_pct_empenhado", "total_restos_pagar_inscritos", "despesa_empenhada_total")

    for key in FUNCTIONS:
        value_col = f"despesa_funcao_{key}"
        add_ratio(indicators, f"{value_col}_pct_despesa_total", value_col, "despesa_empenhada_total")
        add_per_capita(indicators, f"{value_col}_per_capita", value_col)
        indicators[f"{value_col}_crescimento_nominal_pct"] = (
            indicators.sort_values(["cd_ibge", "ano"]).groupby("cd_ibge", observed=True)[value_col].pct_change() * 100
        )

    indicators["saude_educacao_pct_despesa_total"] = (
        (indicators["despesa_funcao_saude"].fillna(0) + indicators["despesa_funcao_educacao"].fillna(0))
        / indicators["despesa_empenhada_total"].replace(0, np.nan)
        * 100
    )
    indicators["urbanismo_saneamento_pct_despesa_total"] = (
        (indicators["despesa_funcao_urbanismo"].fillna(0) + indicators["despesa_funcao_saneamento"].fillna(0))
        / indicators["despesa_empenhada_total"].replace(0, np.nan)
        * 100
    )
    indicators["administracao_pct_despesa_total"] = indicators["despesa_funcao_administracao_pct_despesa_total"]
    indicators["despesa_finalistica"] = indicators[[f"despesa_funcao_{key}" for key in FINALISTIC_FUNCTIONS]].fillna(0).sum(axis=1)
    indicators["despesa_meio"] = indicators[[f"despesa_funcao_{key}" for key in MEIO_FUNCTIONS]].fillna(0).sum(axis=1)
    add_ratio(indicators, "despesa_finalistica_pct_despesa_total", "despesa_finalistica", "despesa_empenhada_total")
    add_ratio(indicators, "despesa_meio_pct_despesa_total", "despesa_meio", "despesa_empenhada_total")
    add_ratio(indicators, "razao_gasto_administrativo_finalistico", "despesa_funcao_administracao", "despesa_finalistica")

    indicators = indicators.sort_values(["cd_ibge", "ano"])
    for value_col in ["receita_total_realizada", "receita_corrente", "despesa_empenhada_total"]:
        indicators[f"{value_col}_crescimento_nominal_pct"] = indicators.groupby("cd_ibge", observed=True)[value_col].pct_change() * 100

    return indicators


BENCHMARK_INDICATORS = {
    "receita_total_realizada_per_capita": True,
    "receita_propria_per_capita": True,
    "receita_tributaria_per_capita": True,
    "receita_propria_pct_receita_corrente": True,
    "transferencias_correntes_pct_receita_corrente": False,
    "fpm_per_capita": False,
    "fpm_pct_receita_corrente": False,
    "fpm_pct_receita_total": False,
    "despesa_empenhada_total_per_capita": False,
    "resultado_orcamentario_pct_receita": True,
    "investimentos_pct_despesa_total": True,
    "investimentos_per_capita": True,
    "pessoal_encargos_pct_receita_corrente": False,
    "despesa_corrente_pct_despesa_total": False,
    "liquidado_empenhado_pct": True,
    "pago_liquidado_pct": True,
    "total_restos_pagar_pct_empenhado": False,
    "despesa_funcao_saude_pct_despesa_total": None,
    "despesa_funcao_educacao_pct_despesa_total": None,
    "despesa_funcao_urbanismo_pct_despesa_total": None,
    "despesa_funcao_administracao_pct_despesa_total": False,
    "despesa_funcao_assistencia_social_pct_despesa_total": None,
    "despesa_funcao_saneamento_pct_despesa_total": None,
    "despesa_funcao_transporte_pct_despesa_total": None,
    "despesa_funcao_seguranca_publica_pct_despesa_total": None,
    "despesa_funcao_previdencia_pct_despesa_total": False,
    "despesa_funcao_saude_per_capita": None,
    "despesa_funcao_educacao_per_capita": None,
    "despesa_funcao_urbanismo_per_capita": None,
    "despesa_funcao_administracao_per_capita": False,
    "despesa_funcao_assistencia_social_per_capita": None,
    "despesa_funcao_saneamento_per_capita": None,
    "despesa_funcao_transporte_per_capita": None,
    "despesa_funcao_seguranca_publica_per_capita": None,
    "despesa_funcao_previdencia_per_capita": False,
    "despesa_finalistica_pct_despesa_total": True,
}


def identify_peers(indicators: pd.DataFrame) -> pd.DataFrame:
    latest = indicators[indicators["ano"].eq(2024)].copy()
    peers = latest[
        latest["uf"].eq("SC")
        & latest["populacao"].between(PEER_POP_MIN, PEER_POP_MAX)
        & ~latest["cd_ibge"].eq(TIJUCAS_IBGE)
    ][["cd_ibge", "municipio", "uf", "populacao"]].sort_values("populacao")
    if len(peers) < MIN_PEERS:
        tij_pop = float(latest.loc[latest["cd_ibge"].eq(TIJUCAS_IBGE), "populacao"].iloc[0])
        peers = latest[
            latest["uf"].eq("SC")
            & latest["populacao"].between(tij_pop * 0.5, tij_pop * 1.5)
            & ~latest["cd_ibge"].eq(TIJUCAS_IBGE)
        ][["cd_ibge", "municipio", "uf", "populacao"]].sort_values("populacao")
    return peers


def build_benchmark(indicators: pd.DataFrame, peers: pd.DataFrame) -> pd.DataFrame:
    peer_ids = set(peers["cd_ibge"])
    rows = []
    for year in sorted(indicators["ano"].dropna().unique()):
        tij_row = indicators[indicators["cd_ibge"].eq(TIJUCAS_IBGE) & indicators["ano"].eq(year)]
        peer_rows = indicators[indicators["cd_ibge"].isin(peer_ids) & indicators["ano"].eq(year)]
        if tij_row.empty:
            continue
        tij = tij_row.iloc[0]
        for indicator, higher_is_better in BENCHMARK_INDICATORS.items():
            if indicator not in indicators.columns:
                continue
            values = pd.to_numeric(peer_rows[indicator], errors="coerce").dropna()
            value = tij[indicator] if indicator in tij else np.nan
            median = float(values.median()) if len(values) >= MIN_PEERS else np.nan
            mean = float(values.mean()) if len(values) >= MIN_PEERS else np.nan
            diff = None if pd.isna(value) or pd.isna(median) else float(value - median)
            diff_pct = safe_divide(diff, median, 100) if diff is not None else None
            ranking_direction = True if higher_is_better is None else higher_is_better
            rows.append(
                {
                    "ano": int(year),
                    "indicador": indicator,
                    "valor_tijucas": None if pd.isna(value) else float(value),
                    "media_similares": None if pd.isna(mean) else mean,
                    "mediana_similares": None if pd.isna(median) else median,
                    "diferenca_mediana": diff,
                    "diferenca_pct_mediana": diff_pct,
                    "n_similares_validos": int(len(values)),
                    "percentil_tijucas": percentile_rank(values, value),
                    "ranking_tijucas": calculate_ranking(values, value, ranking_direction),
                    "classificacao": classify_comparison(value, median, higher_is_better),
                }
            )
    return pd.DataFrame(rows)


def score_from_peers(indicators: pd.DataFrame, peers: pd.DataFrame) -> pd.DataFrame:
    peer_ids = set(peers["cd_ibge"])
    score_specs = {
        "subindice_arrecadacao": [("receita_propria_pct_receita_corrente", True), ("receita_tributaria_per_capita", True)],
        "subindice_equilibrio": [("resultado_orcamentario_pct_receita", True)],
        "subindice_rigidez": [("pessoal_encargos_pct_receita_corrente", False), ("despesa_corrente_pct_despesa_total", False)],
        "subindice_investimento": [("investimentos_pct_despesa_total", True), ("investimentos_per_capita", True)],
        "subindice_execucao": [("pago_liquidado_pct", True), ("total_restos_pagar_pct_empenhado", False)],
    }
    rows = []
    for year in sorted(indicators["ano"].dropna().unique()):
        tij_row = indicators[indicators["cd_ibge"].eq(TIJUCAS_IBGE) & indicators["ano"].eq(year)]
        peer_rows = indicators[indicators["cd_ibge"].isin(peer_ids) & indicators["ano"].eq(year)]
        if tij_row.empty:
            continue
        tij = tij_row.iloc[0]
        row = {"cd_ibge": TIJUCAS_IBGE, "ano": int(year)}
        for subindex, specs in score_specs.items():
            scores = []
            for indicator, higher_is_better in specs:
                pct = percentile_rank(peer_rows[indicator], tij[indicator])
                if pct is None:
                    continue
                scores.append(pct if higher_is_better else 100 - pct)
            row[subindex] = float(np.mean(scores)) if scores else np.nan
        weights = {
            "subindice_arrecadacao": 0.20,
            "subindice_equilibrio": 0.25,
            "subindice_rigidez": 0.20,
            "subindice_investimento": 0.20,
            "subindice_execucao": 0.15,
        }
        available = [(sub, weight) for sub, weight in weights.items() if not pd.isna(row.get(sub))]
        if available:
            total_weight = sum(weight for _, weight in available)
            row["indice_saude_fiscal_municipal"] = sum(row[sub] * weight for sub, weight in available) / total_weight
        else:
            row["indice_saude_fiscal_municipal"] = np.nan
        rows.append(row)
    return pd.DataFrame(rows)


def make_interpretation(label: str, value: float | None, classification: str) -> str:
    explanations = {
        "receita_total_realizada_per_capita": "Este indicador mostra quanto a prefeitura arrecada para cada morador.",
        "receita_propria_per_capita": "Receita propria per capita mostra a capacidade local de arrecadacao sem depender diretamente de transferencias.",
        "transferencias_correntes_pct_receita_corrente": "Quando a dependencia de transferencias e alta, o municipio fica mais vulneravel a decisoes do governo estadual e federal.",
        "investimentos_per_capita": "Investimento per capita mostra quanto do orcamento e direcionado para obras, equipamentos e melhorias permanentes.",
        "total_restos_pagar_pct_empenhado": "Restos a pagar elevados podem indicar pressao sobre o orcamento do ano seguinte.",
    }
    base = explanations.get(label, "Este indicador ajuda a comparar Tijucas com municipios catarinenses de porte semelhante.")
    if classification == "indisponivel":
        return f"{base} No momento, nao ha base comparavel suficiente para leitura conclusiva."
    return f"{base} Em relacao aos municipios similares, Tijucas esta classificada como: {classification}."


def build_frontend_json(indicators: pd.DataFrame, benchmark: pd.DataFrame, scores: pd.DataFrame, peers: pd.DataFrame) -> dict:
    tij = indicators[indicators["cd_ibge"].eq(TIJUCAS_IBGE)].sort_values("ano")
    latest = tij.iloc[-1]
    latest_scores = scores.sort_values("ano").iloc[-1] if not scores.empty else pd.Series(dtype="float64")
    latest_benchmark = benchmark[benchmark["ano"].eq(int(latest["ano"]))]

    def card(label: str, col: str, fmt: str = "money") -> dict:
        value = latest.get(col)
        return {
            "label": label,
            "indicador": col,
            "valor": None if pd.isna(value) else float(value),
            "formato": fmt,
            "status": "disponivel" if not pd.isna(value) else "indisponivel",
        }

    cards = [
        card("Quanto a prefeitura arrecadou", "receita_total_realizada"),
        card("Quanto a prefeitura gastou", "despesa_empenhada_total"),
        card("Saldo do ano", "resultado_orcamentario"),
        card("Por morador", "receita_total_realizada_per_capita", "money_per_capita"),
        card("Dependencia do FPM", "fpm_pct_receita_corrente", "percent"),
        card("Investimento por morador", "investimentos_per_capita", "money_per_capita"),
        {
            "label": "Indice de saude fiscal",
            "indicador": "indice_saude_fiscal_municipal",
            "valor": None if latest_scores.empty or pd.isna(latest_scores.get("indice_saude_fiscal_municipal")) else float(latest_scores["indice_saude_fiscal_municipal"]),
            "formato": "score",
            "status": "disponivel" if not latest_scores.empty and not pd.isna(latest_scores.get("indice_saude_fiscal_municipal")) else "indisponivel",
        },
    ]

    benchmark_items = []
    for _, row in latest_benchmark.iterrows():
        benchmark_items.append(
            {
                "indicador": row["indicador"],
                "valor_tijucas": row["valor_tijucas"],
                "media_similares": row["media_similares"],
                "mediana_similares": row["mediana_similares"],
                "diferenca_mediana": row.get("diferenca_mediana"),
                "diferenca_percentual_mediana": row.get("diferenca_pct_mediana"),
                "ranking_tijucas": row.get("ranking_tijucas"),
                "total_municipios_comparados": row.get("n_similares_validos"),
                "percentil_tijucas": row.get("percentil_tijucas"),
                "classificacao": row["classificacao"],
                "texto": make_interpretation(row["indicador"], row["valor_tijucas"], row["classificacao"]),
            }
        )

    indicator_status = []
    for col in [
        column
        for column in tij.columns
        if column not in {"cd_ibge", "ano", "municipio", "uf", "populacao"}
    ]:
        value = latest.get(col)
        numeric_value = pd.to_numeric(pd.Series([value]), errors="coerce").iloc[0]
        indicator_status.append(
            {
                "indicador": col,
                "valor": None if pd.isna(value) or pd.isna(numeric_value) else float(numeric_value),
                "status": "disponivel" if not pd.isna(value) else "indisponivel",
                "motivo_indisponibilidade": None
                if not pd.isna(value)
                else "Conta ausente, base zero, divisao invalida ou dado insuficiente no ano selecionado.",
            }
        )

    functions_latest = []
    for key, label in FUNCTIONS.items():
        value_col = f"despesa_funcao_{key}"
        pct_col = f"{value_col}_pct_despesa_total"
        functions_latest.append(
            {
                "funcao": label.split(" - ", 1)[1],
                "valor": None if pd.isna(latest.get(value_col)) else float(latest[value_col]),
                "participacao_pct": None if pd.isna(latest.get(pct_col)) else float(latest[pct_col]),
                "per_capita": None if pd.isna(latest.get(f"{value_col}_per_capita")) else float(latest[f"{value_col}_per_capita"]),
            }
        )
    functions_latest = sorted(functions_latest, key=lambda item: item["valor"] or 0, reverse=True)

    functions_series = []
    for _, year_row in tij.sort_values("ano").iterrows():
        for key, label in FUNCTIONS.items():
            value_col = f"despesa_funcao_{key}"
            pct_col = f"{value_col}_pct_despesa_total"
            per_capita_col = f"{value_col}_per_capita"
            functions_series.append(
                {
                    "ano": int(year_row["ano"]),
                    "funcao": label.split(" - ", 1)[1],
                    "valor": None if pd.isna(year_row.get(value_col)) else float(year_row[value_col]),
                    "participacao_pct": None if pd.isna(year_row.get(pct_col)) else float(year_row[pct_col]),
                    "per_capita": None if pd.isna(year_row.get(per_capita_col)) else float(year_row[per_capita_col]),
                }
            )

    series_cols = [
        "ano",
        "populacao",
        "receita_total_realizada",
        "receita_total",
        "receita_corrente",
        "despesa_empenhada_total",
        "despesa_total",
        "resultado_orcamentario",
        "receita_total_realizada_per_capita",
        "receita_per_capita",
        "despesa_empenhada_total_per_capita",
        "despesa_per_capita",
        "receita_propria",
        "investimentos_per_capita",
        "investimento_per_capita",
        "investimentos",
        "investimento_total",
        "investimentos_pct_despesa_total",
        "investimentos_pct_receita_corrente",
        "investimento_pct_despesa",
        "investimento_pct_receita",
        "receita_propria_per_capita",
        "receita_propria_pct_receita_corrente",
        "receita_tributaria",
        "receita_tributaria_per_capita",
        "transferencias_correntes",
        "transferencias_correntes_pct_receita_corrente",
        "participacao_transferencias",
        "fpm",
        "fpm_per_capita",
        "fpm_pct_receita_corrente",
        "fpm_pct_receita_total",
        "participacao_fpm_receita_corrente",
        "participacao_fpm_receita_total",
        "administracao_pct_despesa",
        "restos_a_pagar_total",
        "restos_a_pagar_pct_despesa",
    ]
    return {
        "metadata": {
            "municipio": "Tijucas",
            "uf": "SC",
            "cd_ibge": TIJUCAS_IBGE,
            "periodo": [int(tij["ano"].min()), int(tij["ano"].max())],
            "grupo_similar": {
                "criterio": f"Municipios de SC com populacao entre {PEER_POP_MIN} e {PEER_POP_MAX} habitantes em 2024, excluindo Tijucas.",
                "quantidade": int(len(peers)),
            },
            "siconfi_2025_tijucas": {
                "status": "indisponivel",
                "motivo": "Os parquets SICONFI 2025 fornecidos nao contem Tijucas/SC no codigo IBGE 4218004.",
            },
        },
        "cards": cards,
        "series": tij[series_cols].replace({np.nan: None}).to_dict("records"),
        "funcoes_ultimo_ano": functions_latest,
        "funcoes_series": functions_series,
        "benchmark_ultimo_ano": benchmark_items,
        "status_indicadores_ultimo_ano": indicator_status,
        "subindices": scores.replace({np.nan: None}).to_dict("records"),
        "municipios_similares": peers.replace({np.nan: None}).to_dict("records"),
    }


def write_methodology(indicator_columns: list[str], peers: pd.DataFrame) -> None:
    md = f"""# Metodologia dos Indicadores Fiscais de Tijucas

Data: 2026-06-05

## Fonte principal

A base historica principal e a DCA / Contas Anuais do SICONFI:

- `data/raw/siconfi/SICONFI_DCA_SC_municipios_2013_2024.csv`
- `data/raw/siconfi/SICONFI_DCA_Tijucas_serie_historica.csv`
- `data/processed/fiscal/fpm_municipios_sc_anual_1997_2025.parquet`

Para Tijucas/SC, o codigo IBGE validado e `{TIJUCAS_IBGE}`. Os arquivos SICONFI tratados de 2025 nao trazem esse codigo; por isso, 2025 e tratado como indisponivel para Tijucas ate nova validacao da fonte.

O FPM e incorporado pela API de Transferencias Constitucionais do Tesouro Transparente, com chave `codigo_ibge` e transferencia `FPM`. Quando a serie do Tesouro esta disponivel, ela tem prioridade sobre a leitura da conta contabil da DCA.

## Grupo de comparacao

O grupo similar foi definido por municipios de Santa Catarina com populacao entre {PEER_POP_MIN:,} e {PEER_POP_MAX:,} habitantes em 2024, excluindo Tijucas. Foram encontrados {len(peers)} municipios.

## Regras gerais

- Valores monetarios sao nominais.
- Nao ha deflator integrado ao projeto; crescimento real nao foi calculado.
- Valores por habitante usam a populacao informada na propria DCA para o municipio e ano.
- Indicadores com conta ausente, base zero ou divisao invalida ficam nulos.
- Rankings, percentis e subindices usam apenas municipios similares com valor numerico disponivel.

## Formulas principais

| Indicador | Formula |
|---|---|
| Receita total realizada | Total Receitas no Anexo I-C |
| Receita corrente | Receitas Correntes no Anexo I-C |
| Receita por habitante | receita total realizada / populacao |
| Receita propria | receita tributaria + contribuicoes + patrimonial + servicos + outras receitas correntes |
| Receita propria per capita | receita propria / populacao |
| Receita tributaria per capita | receita tributaria / populacao |
| Transferencias correntes / receita corrente | transferencias correntes / receita corrente * 100 |
| FPM | Soma anual dos repasses mensais de FPM do Tesouro Transparente |
| FPM per capita | FPM / populacao |
| Dependencia do FPM | FPM / receita corrente * 100 |
| FPM / receita total | FPM / receita total realizada * 100 |
| Despesa empenhada total | Total Despesa no Anexo I-D, coluna Despesas Empenhadas |
| Despesa liquidada total | Total Despesa no Anexo I-D, coluna Despesas Liquidadas |
| Despesa paga total | Total Despesa no Anexo I-D, coluna Despesas Pagas |
| Resultado orcamentario | receita total realizada - despesa empenhada total |
| Resultado / receita | resultado orcamentario / receita total realizada * 100 |
| Investimento per capita | investimentos / populacao |
| Investimentos / despesa total | investimentos / despesa empenhada total * 100 |
| Pessoal / receita corrente | pessoal e encargos / receita corrente * 100 |
| Servico da divida / receita corrente | (juros e encargos + amortizacao) / receita corrente * 100 |
| Restos a pagar / despesa empenhada | restos a pagar inscritos / despesa empenhada total * 100 |
| Despesa por funcao per capita | despesa empenhada da funcao / populacao |

## Indice de saude fiscal municipal

O indice varia de 0 a 100 e usa a posicao relativa de Tijucas frente aos municipios similares.

Pesos:

- Capacidade de arrecadacao: 20%.
- Equilibrio orcamentario: 25%.
- Rigidez da despesa: 20%.
- Capacidade de investimento: 20%.
- Execucao orcamentaria e restos a pagar: 15%.

Subindices:

- `subindice_arrecadacao`: receita propria como percentual da receita corrente e receita tributaria per capita.
- `subindice_equilibrio`: resultado orcamentario como percentual da receita.
- `subindice_rigidez`: pessoal/receita corrente e despesa corrente/despesa total, com menor valor recebendo melhor pontuacao.
- `subindice_investimento`: investimentos/despesa total e investimento per capita.
- `subindice_execucao`: despesa paga/despesa liquidada e restos a pagar/despesa empenhada, com menor resto a pagar recebendo melhor pontuacao.

Quando um bloco nao tem dados suficientes, o peso dos blocos disponiveis e reponderado.

## Indicadores implementados

{chr(10).join(f'- `{col}`' for col in indicator_columns)}

## Limitacoes

- A DCA e uma base contabil ampla; nem toda conta aparece em todos os anos.
- Os valores sao nominais, sem correcao inflacionaria.
- Receita Corrente Liquida nao foi calculada porque a conta especifica nao foi usada como base primaria nesta versao.
- A comparacao por populacao usa a populacao informada na DCA, que pode diferir de estimativas intercensitarias oficiais.
- A ausencia de Tijucas/SC no SICONFI 2025 tratado impede indicadores de 2025 para o municipio nesta camada.

## Reproducao

```powershell
python scripts\\data_processing\\build_fiscal_indicators.py
```
"""
    (DOCS_DIR / "metodologia_indicadores_fiscais_tijucas.md").write_text(md, encoding="utf-8")
    (DOCS_DIR / "metodologia_contas_publicas_tijucas.md").write_text(md, encoding="utf-8")


def validate_outputs(indicators: pd.DataFrame, peers: pd.DataFrame) -> list[str]:
    checks = []
    tij = indicators[indicators["cd_ibge"].eq(TIJUCAS_IBGE)]
    checks.append(f"Tijucas codigo {TIJUCAS_IBGE}: {'ok' if not tij.empty else 'falhou'}")
    years = sorted(tij["ano"].dropna().astype(int).unique().tolist())
    checks.append(f"Serie Tijucas 2013-2024: {'ok' if years == list(range(2013, 2025)) else 'verificar'} ({years[0] if years else '-'}-{years[-1] if years else '-'})")
    mixed = indicators[indicators["municipio"].str.contains("Tijucas do Sul", case=False, na=False) & indicators["cd_ibge"].eq(TIJUCAS_IBGE)]
    checks.append(f"Sem mistura com Tijucas do Sul/PR: {'ok' if mixed.empty else 'falhou'}")
    checks.append(f"Municipios similares apenas SC: {'ok' if peers['uf'].eq('SC').all() else 'falhou'}")
    checks.append(f"Municipios similares n={len(peers)}")
    siconfi_files = [
        FISCAL_DATA_DIR / "siconfi_receitas_orcamentarias_muni_2025.parquet",
        FISCAL_DATA_DIR / "siconfi_despesas_orcamentarias_muni_2025.parquet",
        FISCAL_DATA_DIR / "siconfi_despesas_por_funcao_muni_2025.parquet",
    ]
    siconfi_has_tijucas = False
    for path in siconfi_files:
        if path.exists():
            frame = pd.read_parquet(path, columns=["cd_ibge"])
            siconfi_has_tijucas = siconfi_has_tijucas or frame["cd_ibge"].astype(str).str.zfill(7).eq(TIJUCAS_IBGE).any()
    checks.append(f"SICONFI 2025 sem Tijucas/SC 4218004: {'ok' if not siconfi_has_tijucas else 'verificar'}")
    return checks


def main() -> None:
    FISCAL_DATA_DIR.mkdir(parents=True, exist_ok=True)
    CONTAS_PUBLICAS_JSON.parent.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    dca = load_dca()
    indicators = build_indicators(dca)
    indicators = merge_tesouro_fpm(indicators, load_tesouro_fpm())
    indicators = add_frontend_aliases(indicators)
    peers = identify_peers(indicators)
    benchmark = build_benchmark(indicators, peers)
    scores = score_from_peers(indicators, peers)
    indicators = indicators.merge(scores, on=["cd_ibge", "ano"], how="left")

    tijucas = indicators[indicators["cd_ibge"].eq(TIJUCAS_IBGE)].copy()

    indicators.to_parquet(FISCAL_DATA_DIR / "indicadores_fiscais_municipios_sc_2013_2024.parquet", index=False)
    tijucas.to_parquet(FISCAL_DATA_DIR / "indicadores_fiscais_tijucas_2013_2024.parquet", index=False)
    benchmark.to_parquet(FISCAL_DATA_DIR / "benchmark_fiscal_tijucas_municipios_similares.parquet", index=False)
    indicators.to_csv(FISCAL_DATA_DIR / "indicadores_fiscais_municipios_sc_2013_2024.csv", index=False, encoding="utf-8-sig")
    tijucas.to_csv(FISCAL_DATA_DIR / "indicadores_fiscais_tijucas_2013_2024.csv", index=False, encoding="utf-8-sig")
    benchmark.to_csv(FISCAL_DATA_DIR / "benchmark_fiscal_tijucas_municipios_similares.csv", index=False, encoding="utf-8-sig")

    frontend = build_frontend_json(indicators, benchmark, scores, peers)
    CONTAS_PUBLICAS_JSON.write_text(json.dumps(frontend, ensure_ascii=False, indent=2), encoding="utf-8")

    indicator_columns = [
        col
        for col in indicators.columns
        if col not in {"cd_ibge", "ano", "municipio", "uf", "populacao"}
    ]
    write_methodology(indicator_columns, peers)

    checks = validate_outputs(indicators, peers)
    print("Arquivos gerados:")
    print(" - data/processed/fiscal/indicadores_fiscais_municipios_sc_2013_2024.parquet")
    print(" - data/processed/fiscal/indicadores_fiscais_tijucas_2013_2024.parquet")
    print(" - data/processed/fiscal/benchmark_fiscal_tijucas_municipios_similares.parquet")
    print(" - src/features/contas-publicas/data/contas_publicas_tijucas.json")
    print(" - docs/metodologia_indicadores_fiscais_tijucas.md")
    print("Validacoes:")
    for check in checks:
        print(f" - {check}")


if __name__ == "__main__":
    main()
