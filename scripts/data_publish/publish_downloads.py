from pathlib import Path
import shutil


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
PUBLISHED_DOWNLOADS_DIR = PROJECT_ROOT / "data" / "published" / "downloads"
PUBLIC_DOWNLOADS_DIR = PROJECT_ROOT / "public" / "downloads"


DOWNLOAD_FILES = [
    "bolsa_familia_sc_mensal_colunas_separadas.csv",
    "bolsa_familia_sc_total_mensal.csv",
    "datasus_procedimentos_tijucas_sc_mensal.csv",
    "mte_saldo_tijucas_sc_mensal.csv",
    "painel_scatter_municipios_sc.csv",
    "procedimento_ambulatoriais_sc_long.xlsx",
]


def main() -> None:
    PUBLISHED_DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
    for filename in DOWNLOAD_FILES:
        source = PROCESSED_DATA_DIR / filename
        for target_dir in (PUBLISHED_DOWNLOADS_DIR, PUBLIC_DOWNLOADS_DIR):
            shutil.copy2(source, target_dir / filename)
    print("Downloads publicados em data/published/downloads e public/downloads")


if __name__ == "__main__":
    main()
