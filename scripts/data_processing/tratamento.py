from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"


def export_datasus_long_to_excel() -> None:
    """Converte a base longa do DataSUS de CSV para XLSX."""
    input_path = RAW_DATA_DIR / "datasus - procedimento ambulatoriais sc long.csv"
    output_path = PROCESSED_DATA_DIR / "procedimento_ambulatoriais_sc_long.xlsx"

    df = pd.read_csv(input_path, sep=";")
    df.to_excel(output_path, index=False)


def load_bolsa_familia_sc() -> pd.DataFrame:
    """Carrega a base mensal bruta do Bolsa Familia em Santa Catarina."""
    input_path = RAW_DATA_DIR / "MIN.CIDADANIA - BOLSA FAMILIA SC (mensal).csv"
    return pd.read_csv(input_path, sep=",", encoding="latin-1")


if __name__ == "__main__":
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    export_datasus_long_to_excel()
    bolsa_familia = load_bolsa_familia_sc()
    print(f"Bolsa Familia SC: {bolsa_familia.shape[0]} linhas, {bolsa_familia.shape[1]} colunas")


