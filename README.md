# Tijucas em Dados

Projeto de ciencia de dados e painel web para indicadores do municipio de Tijucas/SC.

## Estrutura

```text
.
├── assets/source/              # imagens e arquivos visuais originais
├── data/
│   ├── raw/                    # dados brutos, sem edicao manual
│   ├── interim/                # dados intermediarios de tratamento
│   ├── processed/              # bases tratadas para analise
│   └── published/              # artefatos prontos para publicacao
├── docs/                       # documentacao metodologica e inventarios
├── notebooks/                  # analises exploratorias
├── public/
│   ├── assets/                 # assets servidos pelo painel
│   ├── data/                   # JSONs consumiveis pelo app/API estatica
│   └── downloads/              # arquivos disponiveis para download no app
├── references/
│   ├── fontes_indicadores.yml
│   └── indicadores_catalogo.yml
├── reports/figures/            # graficos, tabelas e saidas analiticas
├── scripts/
│   ├── data_collection/        # scripts de coleta
│   ├── data_processing/        # scripts de limpeza e transformacao
│   └── data_publish/           # scripts de publicacao para public/
└── src/                        # codigo-fonte do painel React
```

## Comandos

```bash
npm install
npm run dev
npm run build
```

Para reprocessar a conversao do DataSUS:

```bash
python scripts/data_processing/process_datasus_ambulatorial.py
```

Para republicar downloads e JSONs estaticos:

```bash
python scripts/data_publish/publish_downloads.py
python scripts/data_publish/publish_public_json.py
```

## Convencoes

- `data/raw` preserva os arquivos de origem.
- `data/interim` guarda saidas temporarias de tratamento.
- `data/processed` guarda bases tratadas para analise.
- `data/published` guarda artefatos prontos para serem copiados para `public/`.
- Arquivos expostos no app ficam em `public/assets`, `public/data` ou `public/downloads`.
- Scripts Python devem usar caminhos relativos ao projeto.
