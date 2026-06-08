from pathlib import Path
import shutil


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PUBLISHED_DATA_DIR = PROJECT_ROOT / "data" / "published"
PUBLIC_DATA_DIR = PROJECT_ROOT / "public" / "data"


PUBLIC_JSON_FILES = [
    "kpis_home.json",
    "indicadores_mensais.json",
    "series_home.json",
    "scatter_municipios.json",
    "metadata_fontes.json",
]


def main() -> None:
    PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    for filename in PUBLIC_JSON_FILES:
        shutil.copy2(PUBLISHED_DATA_DIR / filename, PUBLIC_DATA_DIR / filename)
    print(f"JSONs publicados em {PUBLIC_DATA_DIR.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
