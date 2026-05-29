import pandas as pd
import numpy as np
from pathlib import Path


ROOT = Path(r'C:\Users\bruno.haeming\Desktop\poc_painel_tijucas')
RAW_DIR = ROOT / 'data' / 'raw'
PROCESSED_DIR = ROOT / 'data' / 'processed'


# Arquivo DataSUS - Procedimento Ambulatoriais SC Long
df= pd.read_csv(r'C:\Users\bruno.haeming\Desktop\poc_painel_tijucas\data\raw\datasus - procedimento ambulatoriais sc long.csv', sep=';')
df.head()

df.to_excel(r'C:\Users\bruno.haeming\Desktop\poc_painel_tijucas\data\processed\procedimento_ambulatoriais_sc_long.xlsx', index=False)


df2 = pd.read_csv(r'C:\Users\bruno.haeming\Desktop\poc_painel_tijucas\data\raw\MIN.CIDADANIA - BOLSA FAMILIA SC (mensal).csv', sep=',', encoding='latin-1')  
df2.head()


# Arquivo MTE - Saldo de empregos SC
mte_raw = RAW_DIR / 'MTE - Saldo de empregos SC.mar26(databricks).csv'
mte_processed = PROCESSED_DIR / 'mte_saldo_empregos_sc.parquet'

df_mte = pd.read_csv(
    mte_raw,
    sep=',',
    encoding='utf-8',
    dtype={
        'cd_uf': 'Int64',
        'cd_divisao': 'string',
        'saldo_total': 'float64',
    },
    parse_dates=['dt_data_competencia'],
)

df_mte.columns = df_mte.columns.str.strip().str.lower()

text_columns = ['nm_adm_desl', 'nm_uf', 'nm_grupo', 'nm_divisao']
for column in text_columns:
    df_mte[column] = df_mte[column].astype('string').str.strip()

df_mte['cd_divisao'] = df_mte['cd_divisao'].str.strip().str.zfill(2)
df_mte['saldo_total'] = df_mte['saldo_total'].round().astype('Int64')

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
df_mte.to_parquet(mte_processed, index=False, engine='pyarrow')


# Arquivo MTE - Saldo de empregos municipais SC
mte_municipal_raw = RAW_DIR / 'MTE - Saldo empregos municipais SC (databricks).csv'
mte_municipal_processed = PROCESSED_DIR / 'mte_saldo_empregos_municipais_sc.parquet'

df_mte_municipal = pd.read_csv(
    mte_municipal_raw,
    sep=',',
    encoding='utf-8',
    dtype={
        'cd_uf': 'Int64',
        'cd_divisao': 'string',
        'cd_municipio': 'string',
        'saldo_total': 'float64',
    },
    parse_dates=['dt_data_competencia'],
)

df_mte_municipal.columns = df_mte_municipal.columns.str.strip().str.lower()

text_columns = ['nm_adm_desl', 'nm_uf', 'nm_grupo', 'nm_divisao', 'nm_municipio']
for column in text_columns:
    df_mte_municipal[column] = df_mte_municipal[column].astype('string').str.strip()

df_mte_municipal['cd_divisao'] = df_mte_municipal['cd_divisao'].str.strip().str.zfill(2)
df_mte_municipal['cd_municipio'] = df_mte_municipal['cd_municipio'].str.strip().str.zfill(6)
df_mte_municipal['saldo_total'] = df_mte_municipal['saldo_total'].round().astype('Int64')

df_mte_municipal.to_parquet(mte_municipal_processed, index=False, engine='pyarrow')

