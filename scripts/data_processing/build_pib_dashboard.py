from pathlib import Path
import json

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
SRC_DATA_DIR = PROJECT_ROOT / "src" / "data"


def format_money(value: float) -> str:
    if abs(value) >= 1_000_000_000:
        return f"R$ {value / 1_000_000_000:.1f} bi".replace(".", ",")
    return f"R$ {value / 1_000_000:.0f} mi".replace(".", ",")


def series_rows(frame: pd.DataFrame, name_column: str, name: str) -> list[dict]:
    rows = frame.loc[frame[name_column] == name].sort_values("Data de Referência")
    return [
        {
            "ano": int(row["Data de Referência"].year),
            "tipo": row["Tipo PIB"],
            "pib": int(round(row["PIB"])),
        }
        for _, row in rows.iterrows()
    ]


def main() -> None:
    municipios = pd.read_excel(RAW_DATA_DIR / "PIB municipios long.xlsx")
    mesos = pd.read_excel(RAW_DATA_DIR / "PIB mesos long.xlsx")

    municipio_rows = municipios.loc[municipios["Município"] != "-"].copy()
    observed_year = int(municipio_rows.loc[municipio_rows["Tipo PIB"] == "Observado", "Data de Referência"].dt.year.max())
    projection_year = int(municipio_rows.loc[municipio_rows["Tipo PIB"] == "Projeção", "Data de Referência"].dt.year.max())

    table_wide = (
        municipio_rows.loc[municipio_rows["Data de Referência"].dt.year.isin([observed_year, 2024, 2025, projection_year])]
        .assign(ano=lambda df: df["Data de Referência"].dt.year)
        .pivot_table(
            index=["Cód. Munic", "Município", "Mesorregião"],
            columns="ano",
            values="PIB",
            aggfunc="first",
        )
        .reset_index()
    )

    table = []
    for _, row in table_wide.iterrows():
        table.append(
            {
                "codigo": str(row["Cód. Munic"]),
                "municipio": row["Município"],
                "mesorregiao": row["Mesorregião"],
                "pibObservado": int(round(row[observed_year])),
                "pib2024": int(round(row[2024])),
                "pib2025": int(round(row[2025])),
                "pibProjetado": int(round(row[projection_year])),
            }
        )
    table.sort(key=lambda row: row["pibProjetado"], reverse=True)

    chart_series = [
        {"name": "Santa Catarina", "scope": "SC", "data": series_rows(mesos, "Mesos", "Santa Catarina")},
        {"name": "Tijucas", "scope": "Municipio", "data": series_rows(municipio_rows, "Município", "Tijucas")},
    ]
    for meso_name in sorted(name for name in mesos["Mesos"].dropna().unique() if name != "Santa Catarina"):
        chart_series.append(
            {
                "name": meso_name,
                "scope": "Mesorregiao",
                "data": series_rows(mesos, "Mesos", meso_name),
            }
        )

    sc_latest = chart_series[0]["data"][-1]["pib"]
    tijucas_latest = chart_series[1]["data"][-1]["pib"]
    tijucas_observed = next(row["pib"] for row in chart_series[1]["data"] if row["ano"] == observed_year)
    tijucas_growth = ((tijucas_latest / tijucas_observed) - 1) * 100

    data = {
        "metadata": {
            "observedYear": observed_year,
            "projectionYear": projection_year,
            "tableProjectionColumns": [2024, 2025, projection_year],
        },
        "summary": (
            f"O PIB combina a serie observada ate {observed_year} com projecoes ate {projection_year}. "
            f"Em {projection_year}, Santa Catarina alcanca {format_money(sc_latest)} e Tijucas "
            f"chega a {format_money(tijucas_latest)}, alta projetada de "
            f"{str(round(tijucas_growth, 1)).replace('.', ',')}% frente ao PIB observado de {observed_year}."
        ),
        "kpis": [
            {"label": "PIB SC projetado", "value": format_money(sc_latest), "note": f"projeção {projection_year}"},
            {"label": "PIB Tijucas projetado", "value": format_money(tijucas_latest), "note": f"projeção {projection_year}"},
            {"label": "Crescimento Tijucas", "value": f"+{tijucas_growth:.1f}%".replace(".", ","), "note": f"{observed_year} a {projection_year}"},
        ],
        "chartSeries": chart_series,
        "municipalTable": table,
    }

    output_path = SRC_DATA_DIR / "pibDashboardData.js"
    output_path.write_text(
        "export const pibDashboardData = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Arquivo gerado: {output_path.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
