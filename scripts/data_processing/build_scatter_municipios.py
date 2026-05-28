from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
PUBLISHED_DATA_DIR = PROJECT_ROOT / "data" / "published"


def main() -> None:
    input_path = PROCESSED_DATA_DIR / "painel_scatter_municipios_sc.csv"
    output_path = PUBLISHED_DATA_DIR / "scatter_municipios.json"

    PUBLISHED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(input_path)
    df.to_json(output_path, orient="records", force_ascii=False, indent=2)
    print(f"Arquivo gerado: {output_path.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
