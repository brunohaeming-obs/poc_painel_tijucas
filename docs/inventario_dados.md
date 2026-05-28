# Inventario dos dados disponiveis

Atualizado em 2026-05-28.

Este inventario cobre os arquivos de dados encontrados em `data/`, `public/data`, `public/downloads` e `src/data`.

## Resumo executivo

| Grupo | Local | Situacao |
| --- | --- | --- |
| Dados brutos | `data/raw/` | Fontes originais de DataSUS, Bolsa Familia e MTE/CAGED. |
| Dados intermediarios | `data/interim/` | Reservado para transformacoes temporarias. |
| Dados tratados | `data/processed/` | Bases prontas para analise. |
| Dados publicados | `data/published/` | JSONs e downloads prontos para publicacao. |
| Saida estatica do app | `public/data/`, `public/downloads/` | Arquivos servidos pelo Vite. |
| Catalogos | `references/` | YAMLs de fontes e indicadores. |
| Dados embarcados no frontend | `src/data/` | GeoJSON/JSON do IBGE e modulos JS ainda consumidos diretamente pelo app. |

## Bases brutas

| Arquivo | Fonte/tema | Formato | Linhas | Colunas | Periodo/cobertura | Observacoes |
| --- | --- | ---: | ---: | ---: | --- | --- |
| `data/raw/MIN.CIDADANIA - BOLSA FAMILIA SC (mensal).csv` | Bolsa Familia por municipio de SC | CSV, `latin-1`, `,` | 74.395 | 10 | Referencias mensais de 2004 a 2026 | Base original com colunas separadas para fases ate out/2021 e a partir de mar/2023. |
| `data/raw/datasus - procedimento ambulatoriais sc.csv` | Procedimentos ambulatoriais SUS por municipio gestor | CSV exportado do TabNet/DataSUS | 308 linhas textuais | Layout largo | Jan/2008 a Mar/2026 | Arquivo possui cabecalho textual e uma tabela larga com uma coluna por mes. |
| `data/raw/datasus - procedimento ambulatoriais sc long.csv` | Procedimentos ambulatoriais SUS por municipio gestor | CSV, `;` | 64.824 | 6 | 2008-01-01 a 2026-03-01 | Versao normalizada/longa com `codigo_municipio`, `municipio_gestor`, `ano_mes_atendimento`, `ano`, `mes`, `qtd_aprovada`. |
| `data/raw/mte - saldo sc.xlsx` | Saldo de empregos formais em SC | XLSX | 442.738 | 10 | Competencia em `dt_data_competencia` | Planilha `base` com UF, divisao/grupo economico, municipio e `saldo_total`. |

## Bases tratadas

| Arquivo | Tema | Formato | Linhas | Colunas | Periodo/cobertura | Campos principais |
| --- | --- | ---: | ---: | ---: | --- | --- |
| `data/processed/bolsa_familia_sc_mensal_colunas_separadas.csv` | Bolsa Familia por municipio de SC | CSV, `,` | 74.395 | 10 | 2004-01-01 a 2026-05-01 | `codigo_municipio`, `municipio`, `uf`, `data_referencia`, `familias_beneficiarias`, `valor_total_repassado`, `valor_medio_beneficio`, `fase_programa`. |
| `data/processed/bolsa_familia_sc_mensal_tratado.csv` | Bolsa Familia por municipio de SC | CSV, `;` | 74.395 | 10 | 2004-01-01 a 2026-05-01 | Mesma estrutura logica do arquivo anterior, com separador `;`. |
| `data/processed/bolsa_familia_sc_total_mensal.csv` | Total mensal Bolsa Familia em SC | CSV, `,` | 253 | 6 | 2004-01-01 a 2026-05-01 | `data_referencia`, `familias_beneficiarias`, `valor_total_repassado`, `valor_medio_beneficio`. |
| `data/processed/datasus_procedimentos_tijucas_sc_mensal.csv` | Procedimentos ambulatoriais em SC e Tijucas | CSV, `,` | 36 | 4 | 2023-04-01 a 2026-03-01 | `data`, `periodo`, `procedimentosSc`, `procedimentosTijucas`. |
| `data/processed/mte_saldo_tijucas_sc_mensal.csv` | Saldo de empregos em SC e Tijucas | CSV, `,` | 24 | 4 | 2024-04-01 a 2026-03-01 | `data`, `periodo`, `saldoSc`, `saldoTijucas`. |
| `data/processed/painel_scatter_municipios_sc.csv` | Painel comparativo municipal | CSV, `,` | 295 | 7 | 295 municipios de SC | `municipio`, `codigoMunicipio`, `familiasBeneficiarias`, `saldoEmpregos`, `procedimentosAmbulatoriais`, `valorMedioBeneficio`, `isTijucas`. |
| `data/processed/procedimento_ambulatoriais_sc_long.xlsx` | Procedimentos ambulatoriais SUS por municipio gestor | XLSX | 64.824 | 6 | 2008-01-01 a 2026-03-01 | Exportacao XLSX da base longa do DataSUS. |

## Artefatos publicados

| Arquivo | Destino publico | Conteudo |
| --- | --- | --- |
| `data/published/kpis_home.json` | `public/data/kpis_home.json` | KPIs principais do painel. |
| `data/published/indicadores_mensais.json` | `public/data/indicadores_mensais.json` | Series mensais de emprego, saude e Bolsa Familia. |
| `data/published/series_home.json` | `public/data/series_home.json` | Series usadas na home. |
| `data/published/scatter_municipios.json` | `public/data/scatter_municipios.json` | Matriz municipal para scatter. |
| `data/published/metadata_fontes.json` | `public/data/metadata_fontes.json` | Datas e caminhos das fontes locais. |
| `data/published/downloads/*` | `public/downloads/*` | CSV/XLSX para download no painel. |

## Dados embarcados no frontend

| Arquivo | Conteudo | Volume/cobertura | Observacoes |
| --- | --- | --- | --- |
| `src/data/realIndicators.js` | Indicadores reais derivados das bases locais | Metadados: Bolsa Familia ate 2026-05-01, DataSUS ate 2026-03-01, MTE de 2023-07-01 a 2026-03-01 | Ainda usado pelo app como modulo JS e tambem como origem dos JSONs publicados. |
| `src/data/bolsaFamiliaScTotal.js` | Serie total mensal do Bolsa Familia SC | Exporta `bolsaFamiliaScTotal` | Redundante em relacao a `data/processed/bolsa_familia_sc_total_mensal.csv`. |
| `src/data/ibgeBrasilEstados.geojson` | Geometrias dos estados do Brasil | 27 features | Propriedade principal: `codarea`. |
| `src/data/ibgeSantaCatarinaMunicipios.geojson` | Geometrias dos municipios de SC | 295 features | Propriedade principal: `codarea`. |
| `src/data/ibgeScMunicipioNames.json` | Dicionario codigo IBGE -> nome do municipio | 295 codigos | Arquivo auxiliar para rotular municipios no mapa. |
| `src/data/ibgeTijucasRegion.geojson` | Regiao de Tijucas e municipios proximos | 10 features | Propriedades: `codarea`, `id`, `name`. |
| `src/data/thematicDashboardData.js` | Conteudo dos paineis tematicos | Dados reais + simulados | O proprio arquivo indica simulacao em temas como contas publicas, educacao e parte de saude. |
| `src/data/portalData.js` | Conteudo inicial do portal/prototipo | Dados configurados/simulados | Ainda referencia links em `/downloads`. |

## Scripts reorganizados

| Grupo | Arquivos |
| --- | --- |
| Coleta | `collect_bolsa_familia.py`, `collect_datasus_ambulatorial.py`, `collect_mte_caged.py`, `collect_tesouro_fpm.py`, `collect_comexstat.py`, `collect_pncp.py`, `collect_aneel_gd.py`, `rfb_empresas.py` |
| Processamento | `process_bolsa_familia.py`, `process_datasus_ambulatorial.py`, `process_mte_caged.py`, `build_indicadores_mensais.py`, `build_scatter_municipios.py` |
| Publicacao | `publish_public_json.py`, `publish_downloads.py` |

## Lacunas e pontos de atencao

- Ha bases reais para Bolsa Familia, DataSUS/procedimentos ambulatoriais e MTE/saldo de empregos.
- Indicadores de populacao, empresas ativas, cobertura vacinal, FPM e varias partes dos paineis tematicos ainda parecem simulados/configurados no frontend.
- `data/interim/`, `notebooks/`, `references/` complementares e `reports/figures/` estao vazios ou quase vazios.
- `tratamento.py` na raiz ainda usa caminhos absolutos e deve ser tratado como legado; a rotina reprodutivel agora esta em `scripts/data_processing/process_datasus_ambulatorial.py`.
- `data/raw/datasus - procedimento ambulatoriais sc.csv` nao e um CSV tabular limpo; para analise, usar preferencialmente a versao longa em `data/raw/datasus - procedimento ambulatoriais sc long.csv`.
