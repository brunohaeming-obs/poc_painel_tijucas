from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"


def main() -> None:
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    raise NotImplementedError("Defina os filtros do PNCP antes de automatizar a coleta.")


if __name__ == "__main__":
    main()
