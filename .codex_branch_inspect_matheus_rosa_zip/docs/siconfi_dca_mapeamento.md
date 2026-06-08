# Mapeamento dos dados Siconfi DCA / Contas Anuais

Data do mapeamento: 2026-06-03

## Fonte

- Sistema: Siconfi / Tesouro Nacional
- Conjunto: DCA - Declaracao de Contas Anuais, equivalente a "Contas Anuais" na consulta publica
- Endpoint usado: `https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca`
- Parametros principais:
  - `an_exercicio`: exercicio da DCA
  - `id_ente`: codigo IBGE de 7 digitos do ente
  - `no_anexo`: filtro opcional de anexo
  - `limit` e `offset`: paginacao

## Arquivos coletados

| Arquivo | Status | Escopo | Registros |
|---|---:|---|---:|
| `data/raw/SICONFI_DCA_Tijucas_serie_historica.csv` | base principal | Tijucas, 2013 a 2024 | 16.600 |
| `data/raw/SICONFI_DCA_SC_municipios_2013_2024.csv` | base principal | 295 municipios de SC, 2013 a 2024 | 3.245.648 |
| `data/raw/SICONFI_DCA_SC_municipios_2013_2024_controle.csv` | controle | 295 municipios x 12 anos | 3.540 |
| `data/raw/SICONFI_DCA_Tijucas_teste_2023.csv` | teste | Tijucas, 2023 | 1.637 |
| `data/raw/SICONFI_DCA_SC_teste_2024_primeira_rodada.csv` | teste parcial | Abdon Batista, 2024 | 1.246 |

Observacao: a coleta completa de todos os municipios de Santa Catarina, 2013 a 2024, foi executada com checkpoint. O arquivo `SICONFI_DCA_SC_teste_2024_primeira_rodada.csv` e apenas uma amostra de validacao do modo em lote.

## Granularidade

Cada linha representa um valor contábil de uma conta da DCA para:

- um ente federativo;
- um exercicio;
- um anexo;
- uma conta (`cod_conta` / `conta`);
- uma coluna de referencia do demonstrativo, por exemplo `31/12/2024` ou outra coluna textual do anexo.

Na pratica, a chave analitica recomendada e:

```text
id_ente_consulta + an_exercicio_consulta + anexo + coluna + cod_conta
```

## Dicionario de campos

| Campo | Tipo esperado | Descricao |
|---|---|---|
| `an_exercicio_consulta` | inteiro | Ano usado como parametro `an_exercicio` na API. |
| `id_ente_consulta` | inteiro | Codigo IBGE de 7 digitos usado como parametro `id_ente`. |
| `municipio_consulta` | texto | Nome do municipio adicionado pelo coletor em coletas de SC. Ausente/vazio na primeira coleta de Tijucas. |
| `exercicio` | inteiro | Exercicio retornado pelo Siconfi. Deve bater com `an_exercicio_consulta`. |
| `instituicao` | texto | Nome da instituicao declarante, por exemplo `Prefeitura Municipal de Tijucas - SC`. |
| `cod_ibge` | inteiro | Codigo IBGE do ente retornado pela API. |
| `uf` | texto | Unidade da Federacao. Para esta coleta, `SC`. |
| `populacao` | inteiro | Populacao informada no registro do Siconfi para o ano/ente. |
| `anexo` | texto | Anexo da DCA, por exemplo `DCA-Anexo I-AB`. |
| `rotulo` | texto | Rotulo auxiliar da tabela quando disponibilizado pela API. Pode vir vazio. |
| `coluna` | texto | Coluna do demonstrativo de origem. Em balanços costuma ser uma data-base, como `31/12/2024`. |
| `cod_conta` | texto | Codigo/identificador da conta no layout da DCA. |
| `conta` | texto | Descricao da conta, geralmente com numeracao e formula. |
| `valor` | decimal | Valor monetario ou quantitativo informado para aquela conta/coluna. |

## Cobertura de Tijucas

| Ano | Registros |
|---:|---:|
| 2013 | 901 |
| 2014 | 995 |
| 2015 | 1.041 |
| 2016 | 1.127 |
| 2017 | 1.420 |
| 2018 | 1.466 |
| 2019 | 1.574 |
| 2020 | 1.614 |
| 2021 | 1.520 |
| 2022 | 1.588 |
| 2023 | 1.637 |
| 2024 | 1.717 |

Total: 16.600 registros.

## Cobertura de Santa Catarina

| Ano | Registros |
|---:|---:|
| 2013 | 179.249 |
| 2014 | 173.922 |
| 2015 | 223.403 |
| 2016 | 230.065 |
| 2017 | 269.189 |
| 2018 | 281.619 |
| 2019 | 292.497 |
| 2020 | 299.252 |
| 2021 | 302.169 |
| 2022 | 322.894 |
| 2023 | 332.301 |
| 2024 | 339.088 |

Total: 3.245.648 registros.

A cobertura operacional da coleta tem 3.540 consultas concluidas no checkpoint, equivalentes a 295 municipios x 12 anos. O CSV principal tem linhas para 3.493 combinacoes municipio-ano; 47 combinacoes retornaram zero registros na API. Essas combinacoes estao preservadas no arquivo de controle `data/raw/SICONFI_DCA_SC_municipios_2013_2024_controle.csv`.

## Anexos encontrados em Tijucas

| Anexo | Registros |
|---|---:|
| `Anexo I-AB` | 66 |
| `Anexo I-C` | 97 |
| `Anexo I-D` | 257 |
| `Anexo I-E` | 234 |
| `Anexo I-F` | 83 |
| `Anexo I-G` | 106 |
| `Anexo I-HI` | 58 |
| `DCA-Anexo I-AB` | 1.240 |
| `DCA-Anexo I-C` | 1.638 |
| `DCA-Anexo I-D` | 2.900 |
| `DCA-Anexo I-E` | 2.673 |
| `DCA-Anexo I-F` | 2.558 |
| `DCA-Anexo I-G` | 2.849 |
| `DCA-Anexo I-HI` | 1.841 |

Os anexos sem prefixo `DCA-` aparecem nos anos iniciais da serie. Para analises historicas, e recomendavel normalizar o campo `anexo`, removendo o prefixo `DCA-` ou criando uma coluna padronizada.

## Observacoes de tratamento

- O arquivo CSV foi salvo em `utf-8-sig`, adequado para abertura no Excel.
- O campo `valor` veio preenchido em 100% das 16.600 linhas da serie de Tijucas.
- Para analises numericas, converter `valor` para decimal/float e `populacao`, `exercicio`, `cod_ibge` e `id_ente_consulta` para inteiros.
- Para a coleta completa de SC, usar checkpoint para retomar em caso de queda da API.
- O script de coleta esta em `scripts/data_collection/collect_siconfi_dca.py`.

## Comando para coleta completa de SC

```powershell
python scripts\data_collection\collect_siconfi_dca.py --sc-municipios --ano-inicio 2013 --ano-fim 2024 --output data\raw\SICONFI_DCA_SC_municipios_2013_2024.csv --checkpoint data\raw\SICONFI_DCA_SC_municipios_2013_2024.checkpoint.json
```
