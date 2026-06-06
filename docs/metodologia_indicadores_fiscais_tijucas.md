# Metodologia dos Indicadores Fiscais de Tijucas

Data: 2026-06-05

## Fonte principal

A base historica principal e a DCA / Contas Anuais do SICONFI:

- `data/raw/SICONFI_DCA_SC_municipios_2013_2024.csv`
- `data/raw/SICONFI_DCA_Tijucas_serie_historica.csv`
- `data/processed/fpm_municipios_sc_anual_1997_2025.parquet`

Para Tijucas/SC, o codigo IBGE validado e `4218004`. Os arquivos SICONFI tratados de 2025 nao trazem esse codigo; por isso, 2025 e tratado como indisponivel para Tijucas ate nova validacao da fonte.

O FPM e incorporado pela API de Transferencias Constitucionais do Tesouro Transparente, com chave `codigo_ibge` e transferencia `FPM`. Quando a serie do Tesouro esta disponivel, ela tem prioridade sobre a leitura da conta contabil da DCA.

## Grupo de comparacao

O grupo similar foi definido por municipios de Santa Catarina com populacao entre 40,000 e 80,000 habitantes em 2024, excluindo Tijucas. Foram encontrados 20 municipios.

## Regras gerais

- Valores monetarios sao nominais.
- Nao ha deflator integrado ao projeto; crescimento real nao foi calculado.
- Valores por habitante usam a populacao informada na propria DCA para o municipio e ano.
- Indicadores com conta ausente, base zero ou divisao invalida ficam nulos.
- Rankings, percentis e subindices usam apenas municipios similares com valor numerico disponivel.

## Formulas principais

| Indicador | Formula |
|---|---|
| Receita total realizada | Total Receitas no Anexo I-C |
| Receita corrente | Receitas Correntes no Anexo I-C |
| Receita por habitante | receita total realizada / populacao |
| Receita propria | receita tributaria + contribuicoes + patrimonial + servicos + outras receitas correntes |
| Receita propria per capita | receita propria / populacao |
| Receita tributaria per capita | receita tributaria / populacao |
| Transferencias correntes / receita corrente | transferencias correntes / receita corrente * 100 |
| FPM | Soma anual dos repasses mensais de FPM do Tesouro Transparente |
| FPM per capita | FPM / populacao |
| Dependencia do FPM | FPM / receita corrente * 100 |
| FPM / receita total | FPM / receita total realizada * 100 |
| Despesa empenhada total | Total Despesa no Anexo I-D, coluna Despesas Empenhadas |
| Despesa liquidada total | Total Despesa no Anexo I-D, coluna Despesas Liquidadas |
| Despesa paga total | Total Despesa no Anexo I-D, coluna Despesas Pagas |
| Resultado orcamentario | receita total realizada - despesa empenhada total |
| Resultado / receita | resultado orcamentario / receita total realizada * 100 |
| Investimento per capita | investimentos / populacao |
| Investimentos / despesa total | investimentos / despesa empenhada total * 100 |
| Pessoal / receita corrente | pessoal e encargos / receita corrente * 100 |
| Servico da divida / receita corrente | (juros e encargos + amortizacao) / receita corrente * 100 |
| Restos a pagar / despesa empenhada | restos a pagar inscritos / despesa empenhada total * 100 |
| Despesa por funcao per capita | despesa empenhada da funcao / populacao |

## Indice de saude fiscal municipal

O indice varia de 0 a 100 e usa a posicao relativa de Tijucas frente aos municipios similares.

Pesos:

- Capacidade de arrecadacao: 20%.
- Equilibrio orcamentario: 25%.
- Rigidez da despesa: 20%.
- Capacidade de investimento: 20%.
- Execucao orcamentaria e restos a pagar: 15%.

Subindices:

- `subindice_arrecadacao`: receita propria como percentual da receita corrente e receita tributaria per capita.
- `subindice_equilibrio`: resultado orcamentario como percentual da receita.
- `subindice_rigidez`: pessoal/receita corrente e despesa corrente/despesa total, com menor valor recebendo melhor pontuacao.
- `subindice_investimento`: investimentos/despesa total e investimento per capita.
- `subindice_execucao`: despesa paga/despesa liquidada e restos a pagar/despesa empenhada, com menor resto a pagar recebendo melhor pontuacao.

Quando um bloco nao tem dados suficientes, o peso dos blocos disponiveis e reponderado.

## Indicadores implementados

- `receita_total_realizada`
- `receita_corrente`
- `receita_tributaria`
- `transferencias_correntes`
- `cota_parte_icms`
- `fpm`
- `despesa_empenhada_total`
- `despesa_liquidada_total`
- `despesa_paga_total`
- `despesa_corrente`
- `despesa_capital`
- `investimentos`
- `pessoal_encargos`
- `juros_encargos_divida`
- `amortizacao_divida`
- `rp_nao_processados_inscritos`
- `rp_processados_inscritos`
- `receita_propria`
- `despesa_funcao_saude`
- `despesa_funcao_educacao`
- `despesa_funcao_urbanismo`
- `despesa_funcao_administracao`
- `despesa_funcao_assistencia_social`
- `despesa_funcao_saneamento`
- `despesa_funcao_transporte`
- `despesa_funcao_seguranca_publica`
- `despesa_funcao_previdencia`
- `resultado_orcamentario`
- `servico_divida`
- `total_restos_pagar_inscritos`
- `diferenca_empenhado_pago`
- `diferenca_liquidado_pago`
- `receita_total_realizada_per_capita`
- `receita_propria_per_capita`
- `receita_tributaria_per_capita`
- `despesa_empenhada_total_per_capita`
- `investimentos_per_capita`
- `fpm_per_capita`
- `resultado_orcamentario_pct_receita`
- `receita_propria_pct_receita_corrente`
- `receita_tributaria_pct_receita_corrente`
- `transferencias_correntes_pct_receita_corrente`
- `dependencia_transferencias_intergovernamentais_pct`
- `cota_parte_icms_pct_receita_corrente`
- `fpm_pct_receita_corrente`
- `fpm_pct_receita_total`
- `despesa_corrente_pct_despesa_total`
- `despesa_capital_pct_despesa_total`
- `investimentos_pct_despesa_total`
- `investimentos_pct_despesa_corrente`
- `investimentos_pct_receita_corrente`
- `pessoal_encargos_pct_receita_corrente`
- `juros_encargos_pct_receita_corrente`
- `amortizacao_divida_pct_receita_corrente`
- `servico_divida_pct_receita_corrente`
- `liquidado_empenhado_pct`
- `pago_empenhado_pct`
- `pago_liquidado_pct`
- `rp_nao_processados_pct_empenhado`
- `rp_processados_pct_empenhado`
- `total_restos_pagar_pct_empenhado`
- `despesa_funcao_saude_pct_despesa_total`
- `despesa_funcao_saude_per_capita`
- `despesa_funcao_saude_crescimento_nominal_pct`
- `despesa_funcao_educacao_pct_despesa_total`
- `despesa_funcao_educacao_per_capita`
- `despesa_funcao_educacao_crescimento_nominal_pct`
- `despesa_funcao_urbanismo_pct_despesa_total`
- `despesa_funcao_urbanismo_per_capita`
- `despesa_funcao_urbanismo_crescimento_nominal_pct`
- `despesa_funcao_administracao_pct_despesa_total`
- `despesa_funcao_administracao_per_capita`
- `despesa_funcao_administracao_crescimento_nominal_pct`
- `despesa_funcao_assistencia_social_pct_despesa_total`
- `despesa_funcao_assistencia_social_per_capita`
- `despesa_funcao_assistencia_social_crescimento_nominal_pct`
- `despesa_funcao_saneamento_pct_despesa_total`
- `despesa_funcao_saneamento_per_capita`
- `despesa_funcao_saneamento_crescimento_nominal_pct`
- `despesa_funcao_transporte_pct_despesa_total`
- `despesa_funcao_transporte_per_capita`
- `despesa_funcao_transporte_crescimento_nominal_pct`
- `despesa_funcao_seguranca_publica_pct_despesa_total`
- `despesa_funcao_seguranca_publica_per_capita`
- `despesa_funcao_seguranca_publica_crescimento_nominal_pct`
- `despesa_funcao_previdencia_pct_despesa_total`
- `despesa_funcao_previdencia_per_capita`
- `despesa_funcao_previdencia_crescimento_nominal_pct`
- `saude_educacao_pct_despesa_total`
- `urbanismo_saneamento_pct_despesa_total`
- `administracao_pct_despesa_total`
- `despesa_finalistica`
- `despesa_meio`
- `despesa_finalistica_pct_despesa_total`
- `despesa_meio_pct_despesa_total`
- `razao_gasto_administrativo_finalistico`
- `receita_total_realizada_crescimento_nominal_pct`
- `receita_corrente_crescimento_nominal_pct`
- `despesa_empenhada_total_crescimento_nominal_pct`
- `fonte_fpm`
- `participacao_fpm_receita_corrente`
- `participacao_fpm_receita_total`
- `receita_total`
- `receita_per_capita`
- `despesa_total`
- `despesa_per_capita`
- `participacao_transferencias`
- `investimento_total`
- `investimento_per_capita`
- `investimento_pct_despesa`
- `investimento_pct_receita`
- `administracao_pct_despesa`
- `restos_a_pagar_total`
- `restos_a_pagar_pct_despesa`
- `subindice_arrecadacao`
- `subindice_equilibrio`
- `subindice_rigidez`
- `subindice_investimento`
- `subindice_execucao`
- `indice_saude_fiscal_municipal`

## Limitacoes

- A DCA e uma base contabil ampla; nem toda conta aparece em todos os anos.
- Os valores sao nominais, sem correcao inflacionaria.
- Receita Corrente Liquida nao foi calculada porque a conta especifica nao foi usada como base primaria nesta versao.
- A comparacao por populacao usa a populacao informada na DCA, que pode diferir de estimativas intercensitarias oficiais.
- A ausencia de Tijucas/SC no SICONFI 2025 tratado impede indicadores de 2025 para o municipio nesta camada.

## Reproducao

```powershell
python scripts\data_processing\build_fiscal_indicators.py
```
