# Descricao da estrutura do projeto

Atualizado em 2026-05-28.

Este projeto organiza um painel web de indicadores para Tijucas/SC, combinando bases locais, scripts de tratamento, artefatos publicados e uma aplicacao React/Vite.

## Visao geral

O projeto esta dividido em quatro blocos principais:

| Bloco | Papel |
| --- | --- |
| Dados | Armazena bases brutas, intermediarias, tratadas e publicadas. |
| Scripts | Automatiza coleta, processamento e publicacao dos dados. |
| Aplicacao web | Implementa o painel em React, com componentes, estilos e dados embarcados. |
| Documentacao e referencias | Descreve metodologia, inventario, catalogo de fontes e indicadores. |

## Estrutura principal

```text
.
|-- assets/
|   `-- source/
|-- data/
|   |-- raw/
|   |-- interim/
|   |-- processed/
|   `-- published/
|-- docs/
|-- notebooks/
|-- public/
|   |-- assets/
|   |-- data/
|   `-- downloads/
|-- references/
|-- reports/
|   `-- figures/
|-- scripts/
|   |-- data_collection/
|   |-- data_processing/
|   `-- data_publish/
`-- src/
    |-- components/
    `-- data/
```

## Dados

### `data/raw/`

Guarda os arquivos de origem, sem edicao manual. Hoje contem:

- Bolsa Familia mensal por municipio de Santa Catarina.
- Procedimentos ambulatoriais do DataSUS para Santa Catarina.
- Versao longa/normalizada dos procedimentos ambulatoriais.
- Base MTE/CAGED com saldo de empregos formais por municipio e setor.

### `data/interim/`

Reservado para dados intermediarios de tratamento. No estado atual, esta praticamente vazio.

### `data/processed/`

Guarda bases tratadas e prontas para analise. Os principais conteudos sao:

- Bolsa Familia tratado por municipio.
- Bolsa Familia total mensal em Santa Catarina.
- Procedimentos ambulatoriais mensais para Tijucas e Santa Catarina.
- Saldo mensal de empregos para Tijucas e Santa Catarina.
- Matriz municipal de Santa Catarina para graficos comparativos.
- Exportacao XLSX da base longa do DataSUS.

### `data/published/`

Guarda artefatos prontos para publicacao, antes de serem copiados para `public/`. Contem:

- JSONs para consumo estatico pelo painel.
- Copias dos arquivos de download em `data/published/downloads/`.

## Publicacao estatica

### `public/assets/`

Contem imagens servidas diretamente pelo app:

- Brasao de Tijucas.
- Fotos e logos de turismo.
- Imagem do dinossauro usada no painel.

### `public/data/`

Contem JSONs publicados para consumo estatico:

- `kpis_home.json`: KPIs principais.
- `indicadores_mensais.json`: series mensais de emprego, saude e Bolsa Familia.
- `series_home.json`: series usadas na pagina inicial.
- `scatter_municipios.json`: matriz municipal para visualizacoes comparativas.
- `metadata_fontes.json`: metadados de fontes e datas de atualizacao.

### `public/downloads/`

Contem arquivos CSV/XLSX expostos para download no painel. Sao copias publicas de arquivos tratados.

## Scripts

### `scripts/data_collection/`

Agrupa pontos de entrada para coleta de dados. A estrutura ja existe para:

- Bolsa Familia.
- DataSUS ambulatorial.
- MTE/CAGED.
- Tesouro/FPM.
- Comex Stat.
- PNCP.
- ANEEL/GD.
- RFB/empresas.

Parte desses scripts ainda esta como esqueleto, aguardando definicao das consultas ou fontes exatas.

### `scripts/data_processing/`

Agrupa rotinas de tratamento e construcao de bases analiticas:

- `process_bolsa_familia.py`
- `process_datasus_ambulatorial.py`
- `process_mte_caged.py`
- `build_indicadores_mensais.py`
- `build_scatter_municipios.py`

Esses scripts leem arquivos em `data/raw/` ou `data/processed/` e geram saidas em `data/processed/` ou `data/published/`.

### `scripts/data_publish/`

Agrupa rotinas de publicacao:

- `publish_public_json.py`: copia JSONs de `data/published/` para `public/data/`.
- `publish_downloads.py`: copia arquivos tratados para `data/published/downloads/` e `public/downloads/`.

## Aplicacao web

### `src/`

Contem a aplicacao React/Vite.

Arquivos principais:

- `src/App.jsx`: composicao principal da aplicacao.
- `src/main.jsx`: ponto de entrada React.
- `src/styles.css`: estilos globais.

### `src/components/`

Contem os componentes visuais do painel:

- Cards de KPI.
- Graficos de linha e barra.
- Secoes tematicas.
- Mapa.
- Header, hero e footer.
- Tabela de indicadores mensais.
- Componentes especificos para Bolsa Familia e boletins.

### `src/data/`

Contem dados ainda importados diretamente pelo frontend:

- Indicadores reais derivados das bases locais.
- Dados simulados/configurados para paineis tematicos.
- GeoJSONs do IBGE para mapas.
- Dicionario de nomes de municipios de SC.

Uma parte desses dados ja foi tambem publicada em JSON dentro de `public/data/`.

## Referencias e documentacao

### `references/`

Contem catalogos estruturados:

- `fontes_indicadores.yml`: fontes, orgaos, granularidade e caminhos locais.
- `indicadores_catalogo.yml`: indicadores, unidades, periodicidade e status.

### `docs/`

Contem documentacao do projeto:

- `inventario_dados.md`: inventario tecnico das bases e artefatos.
- `descricao_estrutura_projeto.md`: esta descricao geral da estrutura.
- `metodologia_indicadores_prefeito_tijucas.docx`: documento metodologico existente.

### `notebooks/`, `reports/` e `references/`

`notebooks/` e `reports/figures/` estao preparados para analises exploratorias e saidas analiticas, mas ainda nao possuem conteudo relevante alem dos marcadores de pasta.

## Principais pontos de atencao

- As bases reais consolidadas hoje cobrem Bolsa Familia, DataSUS ambulatorial e MTE/CAGED.
- Parte dos indicadores exibidos no frontend ainda e simulada ou configurada manualmente.
- `src/data/realIndicators.js` ainda e uma fonte importante para o app, embora parte do conteudo ja exista em `public/data/`.
- A raiz ainda possui `tratamento.py` com caminhos absolutos; a rotina reprodutivel equivalente esta em `scripts/data_processing/process_datasus_ambulatorial.py`.
- A estrutura atual ja separa bem origem, tratamento e publicacao, mas ainda falta automatizar de ponta a ponta algumas coletas.

## Fluxo recomendado

```text
coleta -> data/raw
tratamento -> data/processed
construcao/publicacao -> data/published
exposicao estatica -> public/data e public/downloads
consumo -> src/app React
```

Essa separacao evita misturar fonte original, dado tratado e arquivo servido ao usuario final.
