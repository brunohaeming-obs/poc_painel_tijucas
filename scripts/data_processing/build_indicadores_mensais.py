from pathlib import Path
import json

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
PUBLISHED_DATA_DIR = PROJECT_ROOT / "data" / "published"


def main() -> None:
    PUBLISHED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    indicadores = {
        "emprego": pd.read_csv(PROCESSED_DATA_DIR / "mte_saldo_tijucas_sc_mensal.csv").to_dict("records"),
        "saude": pd.read_csv(PROCESSED_DATA_DIR / "datasus_procedimentos_tijucas_sc_mensal.csv").to_dict("records"),
        "bolsaFamilia": pd.read_csv(PROCESSED_DATA_DIR / "bolsa_familia_sc_total_mensal.csv").tail(36).to_dict("records"),
    }
    output_path = PUBLISHED_DATA_DIR / "indicadores_mensais.json"
    output_path.write_text(json.dumps(indicadores, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Arquivo gerado: data/published/indicadores_mensais.json")


if __name__ == "__main__":
    main()
