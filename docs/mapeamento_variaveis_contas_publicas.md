# Mapeamento de Variaveis de Contas Publicas

Data do mapeamento: 2026-06-05

## Objetivo

Este documento lista as variaveis de contas publicas disponiveis no projeto para analise e para uso no painel. O mapeamento separa dois niveis:

- **campos da base**: colunas tecnicas dos arquivos, como municipio, ano, conta, coluna do demonstrativo e valor;
- **variaveis/indicadores contabeis**: medidas que podem virar visualizacoes, como receita realizada, despesa empenhada, despesa por funcao e contas dos anexos da DCA.

## Bases Disponiveis

| base | arquivo | linhas | colunas | municipios | ufs | exercicios |
| --- | --- | --- | --- | --- | --- | --- |
| receitas_2025 | data/processed/siconfi_receitas_orcamentarias_muni_2025.parquet | 685.065 | 14 | 5.272 | AC, AL, AM, AP, BA, CE, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO | 2025 |
| despesas_2025 | data/processed/siconfi_despesas_orcamentarias_muni_2025.parquet | 926.319 | 14 | 5.273 | AC, AL, AM, AP, BA, CE, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO | 2025 |
| despesas_por_funcao_2025 | data/processed/siconfi_despesas_por_funcao_muni_2025.parquet | 1.064.198 | 14 | 5.273 | AC, AL, AM, AP, BA, CE, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO | 2025 |
| dca_sc_2013_2024 | data/raw/SICONFI_DCA_SC_municipios_2013_2024.csv | 3.245.648 | 14 | 295 | SC | 2013-2024 |
| dca_tijucas_2013_2024 | data/raw/SICONFI_DCA_Tijucas_serie_historica.csv | 16.600 | 14 | 1 | SC | 2013-2024 |


## Campos dos Arquivos SICONFI 2025

Arquivos tratados em `data/processed`:

- `siconfi_receitas_orcamentarias_muni_2025.parquet`
- `siconfi_despesas_orcamentarias_muni_2025.parquet`
- `siconfi_despesas_por_funcao_muni_2025.parquet`

| campo | descricao |
| --- | --- |
| exercicio | Ano de referencia da consulta SICONFI. |
| escopo | Escopo informado no cabecalho do arquivo original. |
| tabela | Tabela/demonstrativo do SICONFI de origem. |
| instituicao | Instituicao declarante, normalmente Prefeitura Municipal. |
| nm_municipio | Nome do municipio extraido da instituicao. |
| cd_ibge | Codigo IBGE do municipio, com 7 digitos. |
| uf | Unidade da Federacao. |
| populacao | Populacao informada no arquivo SICONFI. |
| coluna | Medida contabil do demonstrativo, como receitas realizadas ou despesas pagas. |
| conta | Conta completa do demonstrativo, geralmente com codigo e descricao. |
| cd_conta | Codigo extraido da conta quando disponivel. |
| nm_conta | Descricao da conta sem o codigo inicial. |
| identificador_conta | Identificador tecnico da conta informado pelo SICONFI. |
| valor | Valor monetario da conta/medida. |


## Medidas Contabeis Disponiveis no SICONFI 2025

Cada medida abaixo aparece no campo `coluna`. Ela deve ser cruzada com `conta`, `cd_conta`, `nm_conta` e `valor`.

| base | medida | contas_distintas | identificadores_distintos | linhas |
| --- | --- | --- | --- | --- |
| despesas_2025 | Despesas Empenhadas | 276 | 276 | 244.764 |
| despesas_2025 | Despesas Liquidadas | 275 | 275 | 244.256 |
| despesas_2025 | Despesas Pagas | 275 | 275 | 243.814 |
| despesas_2025 | Inscrição de Restos a Pagar Não Processados | 340 | 340 | 83.603 |
| despesas_2025 | Inscrição de Restos a Pagar Processados | 343 | 343 | 109.882 |
| despesas_por_funcao_2025 | Despesas Empenhadas | 193 | 1 | 264.279 |
| despesas_por_funcao_2025 | Despesas Liquidadas | 193 | 1 | 263.604 |
| despesas_por_funcao_2025 | Despesas Pagas | 193 | 1 | 263.156 |
| despesas_por_funcao_2025 | Inscrição de Restos a Pagar Não Processados | 189 | 1 | 125.306 |
| despesas_por_funcao_2025 | Inscrição de Restos a Pagar Processados | 189 | 1 | 147.853 |
| receitas_2025 | Deduções - FUNDEB | 164 | 164 | 73.437 |
| receitas_2025 | Deduções - Transferências Constitucionais | 103 | 103 | 775 |
| receitas_2025 | Outras Deduções da Receita | 394 | 394 | 50.588 |
| receitas_2025 | Receitas Brutas Realizadas | 706 | 706 | 560.265 |


Catalogo completo de contas 2025: `docs/catalogo_contas_publicas_siconfi_2025_contas.csv`.

## Indicadores Ja Mapeados Para o Painel

Esses indicadores estao previstos no processamento de `scripts/data_processing/build_public_finance_dashboard.py`.

| indicador | origem | regra | uso |
| --- | --- | --- | --- |
| Receita realizada | siconfi_receitas_orcamentarias_muni_2025.parquet | coluna = 'Receitas Brutas Realizadas' e conta total de receitas | KPI e grafico Receita x Despesa |
| Despesa empenhada | siconfi_despesas_orcamentarias_muni_2025.parquet | coluna = 'Despesas Empenhadas' e conta 'Total Geral da Despesa' | KPI, resultado orcamentario e grafico |
| Despesa liquidada | siconfi_despesas_orcamentarias_muni_2025.parquet | coluna = 'Despesas Liquidadas' e conta 'Total Geral da Despesa' | Grafico Receita x Despesa |
| Despesa paga | siconfi_despesas_orcamentarias_muni_2025.parquet | coluna = 'Despesas Pagas' e conta 'Total Geral da Despesa' | Grafico Receita x Despesa |
| Resultado orcamentario | derivado | receita realizada - despesa empenhada | KPI |
| Valores por habitante | derivado + IBGE Censo 2022 | valor / populacao Censo 2022 | Alternancia per capita |
| Despesa por funcao | siconfi_despesas_por_funcao_muni_2025.parquet | coluna = 'Despesas Empenhadas' e cd_conta com 2 digitos | Ranking de funcoes |


Observacao importante: no arquivo SICONFI 2025 fornecido, o codigo IBGE de Tijucas/SC (`4218004`) nao foi encontrado. O painel registra essa ausencia e encontrou apenas nome semelhante, `Tijucas do Sul/PR`. Portanto, as variaveis existem na base, mas os indicadores de 2025 para Tijucas dependem de haver registros do municipio no arquivo de origem.

## Campos da Serie Historica DCA / Contas Anuais

Arquivo principal: `data/raw/SICONFI_DCA_SC_municipios_2013_2024.csv`.

| campo | descricao |
| --- | --- |
| an_exercicio_consulta | Ano enviado como parametro de consulta na API DCA. |
| id_ente_consulta | Codigo IBGE enviado como parametro de consulta. |
| municipio_consulta | Municipio adicionado pelo coletor nas coletas de SC; ausente na primeira serie isolada de Tijucas. |
| exercicio | Ano retornado pela API. |
| instituicao | Instituicao declarante retornada pelo SICONFI. |
| cod_ibge | Codigo IBGE retornado pela API. |
| uf | Unidade da Federacao. |
| populacao | Populacao informada no registro. |
| anexo | Anexo da DCA/Contas Anuais. |
| rotulo | Rotulo auxiliar do demonstrativo. |
| coluna | Coluna do demonstrativo, frequentemente a data-base ou variacao patrimonial. |
| cod_conta | Codigo da conta no layout DCA. |
| conta | Descricao da conta contabil. |
| valor | Valor monetario ou quantitativo da linha. |


## Anexos DCA Disponiveis

Os anexos foram padronizados removendo o prefixo `DCA-`, porque alguns anos antigos aparecem sem esse prefixo.

| anexo | linhas | contas_distintas | colunas_distintas | municipios | anos |
| --- | --- | --- | --- | --- | --- |
| Anexo I-AB | 307.154 | 832 | 12 | 295 | 12 |
| Anexo I-C | 458.493 | 1.962 | 6 | 295 | 12 |
| Anexo I-D | 628.979 | 434 | 7 | 295 | 12 |
| Anexo I-E | 638.075 | 223 | 7 | 295 | 12 |
| Anexo I-F | 320.348 | 361 | 9 | 295 | 12 |
| Anexo I-G | 422.422 | 219 | 9 | 295 | 12 |
| Anexo I-HI | 470.177 | 1.162 | 12 | 295 | 12 |


Catalogo completo das contas DCA 2013-2024: `docs/catalogo_contas_publicas_dca_sc_2013_2024_contas.csv`.

## Como Ler a Base DCA

A DCA e uma base longa. Cada linha representa o valor de uma conta contabil em um anexo, ano, municipio e coluna do demonstrativo. A chave analitica recomendada e:

```text
id_ente_consulta + an_exercicio_consulta + anexo + coluna + cod_conta + conta
```

Para analises historicas, a base DCA e a fonte mais completa, pois cobre Santa Catarina de 2013 a 2024. Para visualizacoes anuais mais simples, os parquets SICONFI 2025 ja trazem receitas, despesas e despesas por funcao em formato tratado.

## Arquivos Auxiliares Gerados

- `docs/catalogo_contas_publicas_siconfi_2025_medidas.csv`: resumo das medidas do campo `coluna` nos parquets 2025.
- `docs/catalogo_contas_publicas_siconfi_2025_contas.csv`: lista completa de contas disponiveis nos parquets 2025.
- `docs/catalogo_contas_publicas_dca_sc_2013_2024_contas.csv`: lista completa de contas disponiveis na DCA para municipios de SC, com anexo, coluna, conta, anos e cobertura municipal.

## Proximo Uso Recomendado

Para transformar este inventario em visualizacoes cidadas, os melhores pontos de partida sao:

1. Receita total realizada e receita por tipo.
2. Despesa empenhada, liquidada e paga.
3. Resultado orcamentario.
4. Despesa por funcao, como saude, educacao, urbanismo e administracao.
5. Evolucao historica DCA 2013-2024 para comparar Tijucas com municipios proximos ou de porte semelhante.
