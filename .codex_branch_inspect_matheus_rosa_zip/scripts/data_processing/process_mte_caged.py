from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
MONTH_LABELS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]


def format_period(date: pd.Timestamp) -> str:
    return f"{MONTH_LABELS[date.month - 1]}/{str(date.year)[-2:]}"


def main() -> None:
    input_path = RAW_DATA_DIR / "mte - saldo sc.xlsx"
    output_path = PROCESSED_DATA_DIR / "mte_saldo_tijucas_sc_mensal.csv"

    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_excel(input_path, sheet_name="base")
    df["dt_data_competencia"] = pd.to_datetime(df["dt_data_competencia"])

    sc = df.groupby("dt_data_competencia", as_index=False)["saldo_total"].sum()
    tijucas = df[df["cd_municipio"] == 421800].groupby("dt_data_competencia", as_index=False)["saldo_total"].sum()

    monthly = sc.merge(tijucas, on="dt_data_competencia", how="left", suffixes=("Sc", "Tijucas"))
    monthly = monthly.sort_values("dt_data_competencia").tail(24)
    monthly = monthly.rename(
        columns={
            "dt_data_competencia": "data",
            "saldo_totalSc": "saldoSc",
            "saldo_totalTijucas": "saldoTijucas",
        }
    )
    monthly["periodo"] = monthly["data"].map(format_period)
    monthly = monthly[["data", "periodo", "saldoSc", "saldoTijucas"]]
    monthly.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"Arquivo gerado: {output_path.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
