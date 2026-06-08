from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"


def main() -> None:
    input_path = RAW_DATA_DIR / "MIN.CIDADANIA - BOLSA FAMILIA SC (mensal).csv"
    output_path = PROCESSED_DATA_DIR / "bolsa_familia_sc_mensal_colunas_separadas.csv"
    total_output_path = PROCESSED_DATA_DIR / "bolsa_familia_sc_total_mensal.csv"

    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(input_path, encoding="latin-1")
    cols = list(df.columns)

    out = pd.DataFrame(
        {
            "codigo_municipio": df[cols[0]].astype(str).str.zfill(6),
            "municipio": df[cols[1]].str.title(),
            "uf": df[cols[2]],
            "data_referencia": pd.to_datetime(df[cols[3]], format="%m/%Y").dt.strftime("%Y-%m-01"),
        }
    )
    out["ano"] = pd.to_datetime(out["data_referencia"]).dt.year
    out["mes"] = pd.to_datetime(out["data_referencia"]).dt.month
    out["familias_beneficiarias"] = df[cols[4]].fillna(df[cols[5]])
    out["valor_total_repassado"] = df[cols[6]].fillna(df[cols[7]])
    out["valor_medio_beneficio"] = df[cols[8]].fillna(df[cols[9]])
    out["fase_programa"] = df[cols[5]].notna().map({True: "a_partir_mar_2023", False: "ate_out_2021"})

    for column in ["familias_beneficiarias", "valor_total_repassado", "valor_medio_beneficio"]:
        out[column] = (
            out[column]
            .astype(str)
            .str.replace(".", "", regex=False)
            .str.replace(",", ".", regex=False)
            .replace({"": None, "nan": None})
        )
        out[column] = pd.to_numeric(out[column], errors="coerce")

    out = out.sort_values(["codigo_municipio", "data_referencia"])
    out.to_csv(output_path, index=False, encoding="utf-8-sig")

    total = (
        out.groupby(["data_referencia", "ano", "mes"], as_index=False)
        .agg(
            familias_beneficiarias=("familias_beneficiarias", "sum"),
            valor_total_repassado=("valor_total_repassado", "sum"),
        )
        .sort_values("data_referencia")
    )
    total["valor_medio_beneficio"] = total["valor_total_repassado"] / total["familias_beneficiarias"]
    total.to_csv(total_output_path, index=False, encoding="utf-8-sig")

    print(f"Arquivo gerado: {output_path.relative_to(PROJECT_ROOT)}")
    print(f"Arquivo gerado: {total_output_path.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
