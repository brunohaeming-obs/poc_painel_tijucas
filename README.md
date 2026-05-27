# Tijucas em Dados

Projeto de ciência de dados e painel web para indicadores do município de Tijucas/SC.

## Estrutura

```text
.
├── assets/source/          # imagens e arquivos visuais originais
├── data/
│   ├── raw/                # dados brutos, sem edição manual
│   ├── interim/            # dados intermediários de tratamento
│   ├── processed/          # bases tratadas para análise/app
│   └── external/           # dados externos auxiliares
├── docs/                   # documentação metodológica
├── notebooks/              # análises exploratórias
├── public/
│   ├── assets/             # assets servidos pelo painel
│   └── downloads/          # arquivos disponíveis para download no app
├── reports/figures/        # gráficos, tabelas e saídas analíticas
├── scripts/
│   ├── data_collection/    # scripts de coleta
│   └── data_processing/    # scripts de limpeza e transformação
└── src/                    # código-fonte do painel React
```

## Comandos

```bash
npm install
npm run dev
npm run build
```

Para reprocessar a conversão do DataSUS:

```bash
python scripts/data_processing/tratamento.py
```

## Convenções

- `data/raw` deve preservar os arquivos de origem.
- `data/processed` guarda bases prontas para consumo no painel e análises.
- Arquivos expostos no app devem ficar em `public/assets` ou `public/downloads`.
- Scripts Python devem usar caminhos relativos ao projeto, não caminhos absolutos locais.
