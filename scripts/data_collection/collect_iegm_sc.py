"""Coleta dados do IEGM (Índice de Efetividade da Gestão Municipal) para todos os
municípios de Santa Catarina, exercícios 2017–2024.

Fonte: Portal IEGM Brasil (IRB Contas) — iegm.irbcontas.org.br
Estratégia: baixa os ZIPs de dados abertos por tribunal (TCESC) e exercício,
extrai os CSVs e consolida a série histórica.

Arquivos-chave baixados por ano:
  geral_iegm_{ano}_TCESC_municipio.zip  — notas consolidadas por município (IEGM + subíndices)

Salva em:
  data/raw/iegm/zips/          — ZIPs brutos
  data/raw/iegm/iegm_sc_{ano}.csv  — CSV extraído por exercício
  data/processed/iegm/iegm_sc.parquet
  data/processed/iegm/iegm_sc.csv
"""

import io
import time
import zipfile
from pathlib import Path

import pandas as pd
import requests

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw" / "iegm"
ZIP_DIR = RAW_DIR / "zips"
PROCESSED_DIR = ROOT / "data" / "processed" / "iegm"
RAW_DIR.mkdir(parents=True, exist_ok=True)
ZIP_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

BASE = "https://iegm.irbcontas.org.br"
TRIBUNAL = "TCESC"
ANOS = [2023, 2024]  # TCESC participa do IEGM a partir de 2023

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": BASE,
}

# Padrões de URL para o arquivo de notas por município
# O portal usa padrões ligeiramente diferentes por ano
def zip_urls(ano: int) -> list[str]:
    return [
        f"{BASE}/dados_abertos/{ano}/geral/geral_iegm_{ano}_{TRIBUNAL}_municipio.zip",
        f"{BASE}/dados_abertos/{ano}/geral/geral_iegm_{ano}_{TRIBUNAL}.zip",
    ]


def download_zip(ano: int) -> bytes | None:
    for url in zip_urls(ano):
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            if r.status_code == 200 and r.content[:2] == b"PK":
                print(f"  [{ano}] OK — {url} ({len(r.content)//1024} KB)")
                return r.content
            print(f"  [{ano}] {r.status_code} — {url}")
        except Exception as e:
            print(f"  [{ano}] Erro — {url}: {e}")
    return None


def extract_csv_from_zip(content: bytes) -> pd.DataFrame | None:
    with zipfile.ZipFile(io.BytesIO(content)) as zf:
        csv_files = [n for n in zf.namelist() if n.lower().endswith(".csv")]
        if not csv_files:
            print("    [AVISO] Nenhum CSV no ZIP")
            return None
        # Preferir arquivo com "municipio" no nome
        target = next((f for f in csv_files if "municipio" in f.lower()), csv_files[0])
        print(f"    Extraindo: {target}")
        raw = zf.read(target)
        # Detectar UTF-16 pelo BOM (FF FE ou FE FF)
        if raw[:2] in (b"\xff\xfe", b"\xfe\xff"):
            for enc in ("utf-16", "utf-16-le", "utf-16-be"):
                try:
                    df = pd.read_csv(io.BytesIO(raw), encoding=enc, sep=None, engine="python")
                    return df
                except Exception:
                    continue
        # Tentar encodings 8-bit comuns
        for enc in ("utf-8-sig", "utf-8", "latin-1", "cp1252"):
            try:
                df = pd.read_csv(io.BytesIO(raw), encoding=enc, sep=None, engine="python")
                return df
            except Exception:
                continue
        return None


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    clean = {}
    for col in df.columns:
        c = (col.strip()
             .lower()
             .replace(" ", "_")
             .replace("-", "_")
             .replace("(", "")
             .replace(")", "")
             .replace("/", "_")
             .replace(".", "_"))
        # Remover acentos simples
        for src, dst in [("á","a"),("à","a"),("ã","a"),("â","a"),
                         ("é","e"),("ê","e"),("í","i"),("ó","o"),
                         ("ô","o"),("õ","o"),("ú","u"),("ü","u"),
                         ("ç","c"),("ñ","n")]:
            c = c.replace(src, dst)
        clean[col] = c
    return df.rename(columns=clean)


def main():
    frames = []

    for ano in ANOS:
        print(f"\n--- {ano} ---")
        content = download_zip(ano)
        if content is None:
            continue

        zip_path = ZIP_DIR / f"geral_iegm_{ano}_TCESC_municipio.zip"
        zip_path.write_bytes(content)

        df = extract_csv_from_zip(content)
        if df is None:
            continue

        df = normalize_columns(df)
        df["exercicio"] = ano

        out = RAW_DIR / f"iegm_sc_{ano}.csv"
        df.to_csv(out, index=False, encoding="utf-8-sig")
        print(f"    {len(df)} municípios | colunas: {list(df.columns)}")
        print(f"    Salvo: {out.relative_to(ROOT)}")
        frames.append(df)
        time.sleep(0.5)

    if not frames:
        print("\nNenhum dado coletado.")
        return

    df_all = pd.concat(frames, ignore_index=True)

    out_raw = RAW_DIR / "iegm_sc_completo.csv"
    df_all.to_csv(out_raw, index=False, encoding="utf-8-sig")

    out_parquet = PROCESSED_DIR / "iegm_sc.parquet"
    df_all.to_parquet(out_parquet, index=False)

    out_csv = PROCESSED_DIR / "iegm_sc.csv"
    df_all.to_csv(out_csv, index=False, encoding="utf-8-sig")

    print(f"\n=== Concluído ===")
    print(f"Anos coletados: {sorted(df_all['exercicio'].unique())}")
    print(f"Total linhas: {len(df_all)}")
    print(f"Colunas: {list(df_all.columns)}")
    print(f"Raw consolidado: {out_raw.relative_to(ROOT)}")
    print(f"Processado: {out_parquet.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
