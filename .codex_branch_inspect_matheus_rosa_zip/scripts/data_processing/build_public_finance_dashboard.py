from pathlib import Path
import json

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
SRC_DATA_DIR = PROJECT_ROOT / "src" / "data"
TIJUCAS_IBGE = "4218004"


def format_money(value: float) -> str:
    if abs(value) >= 1_000_000_000:
        return f"R$ {value / 1_000_000_000:.1f} bi".replace(".", ",")
    return f"R$ {value / 1_000_000:.1f} mi".replace(".", ",")


def total_value(frame: pd.DataFrame, coluna: str, total_patterns: list[str]) -> float:
    rows = frame.loc[frame["coluna"].eq(coluna)].copy()
    for pattern in total_patterns:
        match = rows.loc[rows["conta"].str.contains(pattern, case=False, na=False, regex=True)]
        if not match.empty:
            return float(match.iloc[0]["valor"])
    return 0.0


def main() -> None:
    receitas = pd.read_parquet(PROCESSED_DATA_DIR / "siconfi_receitas_orcamentarias_muni_2025.parquet")
    despesas = pd.read_parquet(PROCESSED_DATA_DIR / "siconfi_despesas_orcamentarias_muni_2025.parquet")
    funcoes = pd.read_parquet(PROCESSED_DATA_DIR / "siconfi_despesas_por_funcao_muni_2025.parquet")
    pop = pd.read_excel(RAW_DATA_DIR / "IBGE - POP CENSO.xlsx", sheet_name="Tabela")
    pop_row = pop.loc[pop["cod_mun"].astype(str).eq(TIJUCAS_IBGE)].iloc[0]
    populacao = int(pop_row["populacao"])

    receitas_tijucas = receitas.loc[receitas["cd_ibge"].eq(TIJUCAS_IBGE)]
    despesas_tijucas = despesas.loc[despesas["cd_ibge"].eq(TIJUCAS_IBGE)]
    funcoes_tijucas = funcoes.loc[funcoes["cd_ibge"].eq(TIJUCAS_IBGE)]

    data = {
        "municipio": "Tijucas",
        "uf": "SC",
        "cdIbge": TIJUCAS_IBGE,
        "exercicio": 2025,
        "populacaoCenso": populacao,
        "available": bool(len(receitas_tijucas) and len(despesas_tijucas) and len(funcoes_tijucas)),
    }

    if not data["available"]:
        aliases = (
            receitas.loc[receitas["nm_municipio"].str.contains("Tijucas", case=False, na=False), ["cd_ibge", "uf", "nm_municipio"]]
            .drop_duplicates()
            .to_dict("records")
        )
        data.update(
            {
                "summary": (
                    "Os arquivos SICONFI 2025 fornecidos não trazem registros para Tijucas/SC "
                    "(código IBGE 4218004). A população do Censo 2022 foi localizada, mas as "
                    "visualizações fiscais dependem da presença das receitas e despesas no SICONFI."
                ),
                "kpis": [
                    {"label": "População Censo", "value": f"{populacao:,}".replace(",", "."), "note": "IBGE 2022"},
                    {"label": "SICONFI 2025", "value": "Sem registro", "note": "código 4218004 não encontrado"},
                    {"label": "Achado similar", "value": aliases[0]["nm_municipio"] if aliases else "Nenhum", "note": aliases[0]["uf"] if aliases else ""},
                ],
                "revenueExpense": [],
                "revenueExpensePerCapita": [],
                "expenseFunctions": [],
                "foundSimilarNames": aliases,
            }
        )
    else:
        receita_bruta = total_value(
            receitas_tijucas,
            "Receitas Brutas Realizadas",
            [r"RECEITAS \(EXCETO INTRA", r"Receitas Correntes"],
        )
        despesa_empenhada = total_value(
            despesas_tijucas,
            "Despesas Empenhadas",
            [r"Total Geral da Despesa"],
        )
        despesa_liquidada = total_value(
            despesas_tijucas,
            "Despesas Liquidadas",
            [r"Total Geral da Despesa"],
        )
        despesa_paga = total_value(
            despesas_tijucas,
            "Despesas Pagas",
            [r"Total Geral da Despesa"],
        )

        function_rows = funcoes_tijucas.loc[
            funcoes_tijucas["coluna"].eq("Despesas Empenhadas")
            & funcoes_tijucas["cd_conta"].str.match(r"^\d{2}$", na=False)
        ].sort_values("valor", ascending=False)

        data.update(
            {
                "summary": (
                    f"Em 2025, Tijucas registra {format_money(receita_bruta)} em receitas "
                    f"realizadas e {format_money(despesa_empenhada)} em despesas empenhadas "
                    "no SICONFI."
                ),
                "kpis": [
                    {"label": "Receita realizada", "value": format_money(receita_bruta), "note": f"R$ {receita_bruta / populacao:,.0f}/hab".replace(",", ".")},
                    {"label": "Despesa empenhada", "value": format_money(despesa_empenhada), "note": f"R$ {despesa_empenhada / populacao:,.0f}/hab".replace(",", ".")},
                    {"label": "Resultado orçamentário", "value": format_money(receita_bruta - despesa_empenhada), "note": "receita - despesa empenhada"},
                ],
                "revenueExpense": [
                    {"name": "Receita realizada", "receita": receita_bruta, "despesa": None},
                    {"name": "Despesa empenhada", "receita": None, "despesa": despesa_empenhada},
                    {"name": "Despesa liquidada", "receita": None, "despesa": despesa_liquidada},
                    {"name": "Despesa paga", "receita": None, "despesa": despesa_paga},
                ],
                "revenueExpensePerCapita": [
                    {"name": "Receita realizada", "receita": receita_bruta / populacao, "despesa": None},
                    {"name": "Despesa empenhada", "receita": None, "despesa": despesa_empenhada / populacao},
                    {"name": "Despesa liquidada", "receita": None, "despesa": despesa_liquidada / populacao},
                    {"name": "Despesa paga", "receita": None, "despesa": despesa_paga / populacao},
                ],
                "expenseFunctions": [
                    {"funcao": row["nm_conta"], "valor": float(row["valor"])}
                    for _, row in function_rows.head(12).iterrows()
                ],
            }
        )

    output_path = SRC_DATA_DIR / "publicFinanceDashboardData.js"
    output_path.write_text(
        "export const publicFinanceDashboardData = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Arquivo gerado: {output_path.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
