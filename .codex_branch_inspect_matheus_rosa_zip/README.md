# Tijucas em Dados

Projeto de ciência de dados e painel web para indicadores do município de Tijucas/SC.

A aplicação web é construída em **React + Vite**, com **Tailwind CSS** para estilos e
**ECharts**, **Recharts** e **Leaflet** para gráficos e mapas. O pipeline de dados
(coleta, processamento e publicação) é feito em **Python**, na pasta `scripts/`.

## Estrutura de pastas

```text
.
├── assets/source/              # imagens e arquivos visuais originais
├── data/
│   ├── raw/                    # dados brutos, sem edição manual
│   ├── interim/                # dados intermediários de tratamento
│   ├── processed/              # bases tratadas para análise
│   └── published/              # artefatos prontos para publicação
├── docs/                       # documentação metodológica e inventários
├── notebooks/                  # análises exploratórias
├── public/
│   ├── assets/                 # assets servidos pelo painel
│   ├── data/                   # JSONs consumidos pelo app (fetch em runtime)
│   └── downloads/              # arquivos disponíveis para download no app
├── references/                 # catálogos de fontes e indicadores (YAML)
├── reports/figures/            # gráficos, tabelas e saídas analíticas
├── scripts/
│   ├── data_collection/        # scripts de coleta
│   ├── data_processing/        # scripts de limpeza e transformação
│   └── data_publish/           # scripts de publicação para public/
└── src/                        # código-fonte do painel React (ver abaixo)
```

## Arquitetura do front-end (`src/`)

O front-end segue uma organização **feature-based**: cada eixo temático é uma "feature"
autocontida, com seus próprios componentes, configuração e dados. Código reutilizável
entre features fica em `shared/`.

```text
src/
├── main.jsx                    # ponto de entrada React
├── App.jsx                     # composição raiz (Header + ThematicDashboard)
├── styles/index.css            # estilos globais (Tailwind + CSS custom)
│
├── shared/                     # reuso entre TODAS as features
│   ├── lib/formatters.js       #   formatadores numéricos pt-BR
│   ├── charts/
│   │   ├── EChartCard.jsx       #   wrapper de gráfico ECharts
│   │   ├── palette.js           #   paleta institucional
│   │   └── echartsOptions.js    #   construtores lineOption/barOption/pieOption
│   ├── components/TypewriterText.jsx
│   └── layout/Header.jsx
│
├── features/                   # uma pasta por eixo, autocontida
│   ├── dashboard/              #   orquestrador dos painéis temáticos
│   │   ├── ThematicDashboard.jsx
│   │   ├── components/         #     AxisSelector, AxisPanel
│   │   ├── axisCardBuilders.js #     monta os cards dos eixos sem página própria
│   │   ├── config/axes.js      #     cores, ícones e narrativas dos eixos
│   │   └── data/thematicDashboardData.js
│   ├── economia/              #   EconomiaPage.jsx
│   ├── educacao/              #   Page + components/ + config/ + data/ (padrão de referência)
│   ├── contas-publicas/       #   Page + data/
│   └── construcao-civil/      #   components/ (ObrasMapCard, ObrasSeriesCharts)
│
├── data/                       # datasets compartilhados entre features
│   ├── geo/                    #   GeoJSONs do IBGE
│   └── *.js                    #   realIndicators, pib*, employment, publicFinance
│
└── _legacy/                    # componentes/dados sem uso, fora do build (scaffolding)
```

### Onde mexer

| Objetivo | Local |
| --- | --- |
| Criar um eixo novo | `src/features/<eixo>/` (espelhe `educacao/`) + registrar em `dashboard/data/thematicDashboardData.js` e `dashboard/config/axes.js` |
| Ajustar roteamento dos eixos | `src/features/dashboard/ThematicDashboard.jsx` |
| Cards de saúde/população/meio ambiente/obras | `src/features/dashboard/axisCardBuilders.js` |
| Cores, ícones e narrativas dos eixos | `src/features/dashboard/config/axes.js` + `src/shared/charts/palette.js` |
| Estilo dos gráficos ECharts | `src/shared/charts/echartsOptions.js` |
| Formatação de números | `src/shared/lib/formatters.js` |

> **Nota:** o projeto é Vite, não Next.js. A pasta `.next/` (build antigo) foi removida
> do versionamento e está no `.gitignore`.

## Comandos

```bash
npm install
npm run dev      # ambiente de desenvolvimento (http://127.0.0.1:5173)
npm run build    # build de produção em dist/
npm run preview  # serve o build de produção localmente
```

Para reprocessar a conversão do DataSUS:

```bash
python scripts/data_processing/process_datasus_ambulatorial.py
```

Para republicar downloads e JSONs estáticos:

```bash
python scripts/data_publish/publish_downloads.py
python scripts/data_publish/publish_public_json.py
```

## Convenções

- `data/raw` preserva os arquivos de origem.
- `data/interim` guarda saídas temporárias de tratamento.
- `data/processed` guarda bases tratadas para análise.
- `data/published` guarda artefatos prontos para serem copiados para `public/`.
- Arquivos expostos no app ficam em `public/assets`, `public/data` ou `public/downloads`.
- Scripts Python devem usar caminhos relativos ao projeto.
- No front-end, dados de uso exclusivo de uma feature ficam dentro da própria feature;
  dados compartilhados entre features ficam em `src/data/`.
