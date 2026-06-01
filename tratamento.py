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


def tratar_siconfi_csv(nome_arquivo, nome_saida):
    caminho_raw = RAW_DIR / nome_arquivo
    caminho_processed = PROCESSED_DIR / nome_saida

    metadata = {}
    with caminho_raw.open('r', encoding='latin-1') as file:
        for _ in range(3):
            chave, valor = file.readline().strip().split(': ', 1)
            metadata[chave.lower()] = valor

    df_siconfi = pd.read_csv(
        caminho_raw,
        sep=';',
        skiprows=3,
        decimal=',',
        encoding='latin-1',
        dtype={
            'Cod.IBGE': 'string',
            'UF': 'string',
            'Coluna': 'string',
            'Conta': 'string',
            'Identificador da Conta': 'string',
        },
    )

    df_siconfi = df_siconfi.rename(
        columns={
            'Instituição': 'instituicao',
            'Cod.IBGE': 'cd_ibge',
            'UF': 'uf',
            'População': 'populacao',
            'Coluna': 'coluna',
            'Conta': 'conta',
            'Identificador da Conta': 'identificador_conta',
            'Valor': 'valor',
        }
    )

    text_columns = ['instituicao', 'cd_ibge', 'uf', 'coluna', 'conta', 'identificador_conta']
    for column in text_columns:
        df_siconfi[column] = df_siconfi[column].astype('string').str.strip()

    df_siconfi['cd_ibge'] = df_siconfi['cd_ibge'].str.zfill(7)
    df_siconfi['populacao'] = df_siconfi['populacao'].astype('Int64')
    df_siconfi['valor'] = df_siconfi['valor'].astype('float64')
    df_siconfi['exercicio'] = int(metadata['exercício'])
    df_siconfi['escopo'] = metadata['escopo']
    df_siconfi['tabela'] = metadata['tabela']
    df_siconfi['nm_municipio'] = df_siconfi['instituicao'].str.replace(
        r'^Prefeitura Municipal de\s+|\s+-\s+[A-Z]{2}$',
        '',
        regex=True,
    )

    conta_parts = df_siconfi['conta'].str.extract(r'^(?:(?P<cd_conta>[\d.]+)\s+-\s+)?(?P<nm_conta>.+)$')
    df_siconfi['cd_conta'] = conta_parts['cd_conta'].astype('string')
    df_siconfi['nm_conta'] = conta_parts['nm_conta'].astype('string').str.strip()

    ordered_columns = [
        'exercicio',
        'escopo',
        'tabela',
        'instituicao',
        'nm_municipio',
        'cd_ibge',
        'uf',
        'populacao',
        'coluna',
        'conta',
        'cd_conta',
        'nm_conta',
        'identificador_conta',
        'valor',
    ]
    df_siconfi = df_siconfi[ordered_columns]
    df_siconfi.to_parquet(caminho_processed, index=False, engine='pyarrow')
    return df_siconfi


# Arquivos SICONFI - execução orçamentária municipal 2025
tratar_siconfi_csv(
    'SICONFI - Despesas orcamentaria muni 2025.csv',
    'siconfi_despesas_orcamentarias_muni_2025.parquet',
)
tratar_siconfi_csv(
    'SICONFI - despesas por funcao muni 2025.csv',
    'siconfi_despesas_por_funcao_muni_2025.parquet',
)
tratar_siconfi_csv(
    'SICONFI - Receitas orcamentaria muni 2025.csv',
    'siconfi_receitas_orcamentarias_muni_2025.parquet',
)

