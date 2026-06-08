# Descrição da estrutura do projeto

Atualizado em 2026-06-08.

Este projeto organiza um painel web de indicadores para Tijucas/SC, combinando bases locais, scripts de tratamento, artefatos publicados e uma aplicação React/Vite.

## Visão geral

O projeto está dividido em quatro blocos principais:

| Bloco | Papel |
| --- | --- |
| Dados | Armazena bases brutas, intermediárias, tratadas e publicadas. |
| Scripts | Automatiza coleta, processamento e publicação dos dados. |
| Aplicação web | Implementa o painel em React, organizado por features (eixos temáticos). |
| Documentação e referências | Descreve metodologia, inventário, catálogo de fontes e indicadores. |

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
    |-- shared/
    |-- features/
    |-- data/
    `-- _legacy/
```

## Dados

### `data/raw/`

Guarda os arquivos de origem, sem edição manual. Hoje contém:

- Bolsa Família mensal por município de Santa Catarina.
- Procedimentos ambulatoriais do DataSUS para Santa Catarina.
- Versão longa/normalizada dos procedimentos ambulatoriais.
- Base MTE/CAGED com saldo de empregos formais por município e setor.

### `data/interim/`

Reservado para dados intermediários de tratamento. No estado atual, está praticamente vazio.

### `data/processed/`

Guarda bases tratadas e prontas para análise. Os principais conteúdos são:

- Bolsa Família tratado por município.
- Bolsa Família total mensal em Santa Catarina.
- Procedimentos ambulatoriais mensais para Tijucas e Santa Catarina.
- Saldo mensal de empregos para Tijucas e Santa Catarina.
- Matriz municipal de Santa Catarina para gráficos comparativos.
- Exportação XLSX da base longa do DataSUS.

### `data/published/`

Guarda artefatos prontos para publicação, antes de serem copiados para `public/`. Contém:

- JSONs para consumo estático pelo painel.
- Cópias dos arquivos de download em `data/published/downloads/`.

## Publicação estática

### `public/assets/`

Contém imagens servidas diretamente pelo app:

- Brasão de Tijucas.
- Fotos e logos de turismo.
- Imagem do dinossauro usada no painel.

### `public/data/`

Contém JSONs publicados para consumo estático (carregados via fetch em runtime):

- `kpis_home.json`: KPIs principais.
- `indicadores_mensais.json`: séries mensais de emprego, saúde e Bolsa Família.
- `series_home.json`: séries usadas na página inicial.
- `scatter_municipios.json`: matriz municipal para visualizações comparativas.
- `metadata_fontes.json`: metadados de fontes e datas de atualização.
- `educacao/`: bases do eixo de educação consumidas pela feature `educacao`.
- `construcao/`: GeoJSON e séries de obras consumidos pela feature `construcao-civil`.

### `public/downloads/`

Contém arquivos CSV/XLSX expostos para download no painel. São cópias públicas de arquivos tratados.

## Scripts

### `scripts/data_collection/`

Agrupa pontos de entrada para coleta de dados. A estrutura já existe para:

- Bolsa Família.
- DataSUS ambulatorial.
- MTE/CAGED.
- Tesouro/FPM.
- Comex Stat.
- PNCP.
- ANEEL/GD.
- RFB/empresas.

Parte desses scripts ainda está como esqueleto, aguardando definição das consultas ou fontes exatas.

### `scripts/data_processing/`

Agrupa rotinas de tratamento e construção de bases analíticas:

- `process_bolsa_familia.py`
- `process_datasus_ambulatorial.py`
- `process_mte_caged.py`
- `build_indicadores_mensais.py`
- `build_scatter_municipios.py`

Esses scripts leem arquivos em `data/raw/` ou `data/processed/` e geram saídas em `data/processed/` ou `data/published/`.

### `scripts/data_publish/`

Agrupa rotinas de publicação:

- `publish_public_json.py`: copia JSONs de `data/published/` para `public/data/`.
- `publish_downloads.py`: copia arquivos tratados para `data/published/downloads/` e `public/downloads/`.
- `publish_educacao.py`: publica as bases do eixo de educação.
- `build_obras_geojson.py`: gera o GeoJSON de obras da construção civil.

## Aplicação web

A aplicação React/Vite segue uma organização **feature-based**: cada eixo temático é uma
feature autocontida, e o código reutilizável entre features fica em `shared/`.

### Arquivos raiz de `src/`

- `src/main.jsx`: ponto de entrada React.
- `src/App.jsx`: composição principal (Header + ThematicDashboard).
- `src/styles/index.css`: estilos globais (Tailwind + CSS custom).

### `src/shared/`

Código reutilizável entre todas as features:

- `lib/formatters.js`: formatadores numéricos pt-BR (inteiro, moeda, compacto, decimal).
- `charts/EChartCard.jsx`: wrapper de gráfico ECharts.
- `charts/palette.js`: paleta de cores institucional.
- `charts/echartsOptions.js`: construtores de opções de gráfico (linha, barra, pizza).
- `components/TypewriterText.jsx`: efeito de digitação usado em narrativas.
- `layout/Header.jsx`: cabeçalho do portal.

### `src/features/`

Uma pasta por eixo temático:

- `dashboard/`: orquestrador dos painéis. Contém `ThematicDashboard.jsx` (seletor de eixos
  e roteamento), `components/` (`AxisSelector`, `AxisPanel`), `axisCardBuilders.js` (cards
  dos eixos sem página dedicada), `config/axes.js` (cores, ícones e narrativas) e
  `data/thematicDashboardData.js`.
- `economia/`: página do eixo de economia (PIB e emprego formal).
- `educacao/`: feature mais completa, usada como padrão de referência — `EducacaoPage.jsx`
  com `components/`, `config/` e `data/` próprios.
- `contas-publicas/`: página de contas públicas, com `data/` própria.
- `construcao-civil/`: componentes de obras (`ObrasMapCard`, `ObrasSeriesCharts`).

Os eixos economia, educação e contas públicas têm páginas dedicadas; saúde, população,
meio ambiente e construção civil são renderizados pelo painel padrão (`AxisPanel`).

### `src/data/`

Datasets compartilhados entre features, ainda importados diretamente pelo frontend:

- Indicadores reais derivados das bases locais (`realIndicators.js`).
- Dados de PIB, emprego e finanças públicas para os painéis.
- `geo/`: GeoJSONs do IBGE para mapas.

Dados de uso exclusivo de uma feature ficam dentro da própria feature.

### `src/_legacy/`

Componentes e dados que não eram importados por nenhuma parte da aplicação no momento da
reestruturação. Foram preservados aqui (fora do build) como scaffolding reaproveitável.
O Vite só empacota o que é alcançável a partir de `src/main.jsx`, então nada em `_legacy/`
entra no bundle.

## Referências e documentação

### `references/`

Contém catálogos estruturados:

- `fontes_indicadores.yml`: fontes, órgãos, granularidade e caminhos locais.
- `indicadores_catalogo.yml`: indicadores, unidades, periodicidade e status.

### `docs/`

Contém documentação do projeto:

- `inventario_dados.md`: inventário técnico das bases e artefatos.
- `descricao_estrutura_projeto.md`: esta descrição geral da estrutura.
- `metodologia_indicadores_prefeito_tijucas.docx`: documento metodológico existente.

### `notebooks/`, `reports/` e `references/`

`notebooks/` e `reports/figures/` estão preparados para análises exploratórias e saídas
analíticas, mas ainda não possuem conteúdo relevante além dos marcadores de pasta.

## Principais pontos de atenção

- As bases reais consolidadas hoje cobrem Bolsa Família, DataSUS ambulatorial e MTE/CAGED.
- Parte dos indicadores exibidos no frontend ainda é simulada ou configurada manualmente
  (eixos de população, meio ambiente e partes de saúde).
- `src/data/realIndicators.js` ainda é uma fonte importante para o app, embora parte do
  conteúdo já exista em `public/data/`.
- A raiz ainda possui `tratamento.py` com caminhos absolutos; a rotina reprodutível
  equivalente está em `scripts/data_processing/process_datasus_ambulatorial.py`.
- A estrutura atual já separa bem origem, tratamento e publicação, mas ainda falta
  automatizar de ponta a ponta algumas coletas.

## Fluxo recomendado

```text
coleta -> data/raw
tratamento -> data/processed
construção/publicação -> data/published
exposição estática -> public/data e public/downloads
consumo -> src/ (app React)
```

Essa separação evita misturar fonte original, dado tratado e arquivo servido ao usuário final.
