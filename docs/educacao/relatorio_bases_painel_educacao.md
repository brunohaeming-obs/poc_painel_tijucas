# Relatório das bases finais do painel de educação de Tijucas/SC

## Arquivos finais gerados

| arquivo | linhas | colunas | anos cobertos | tamanho (bytes) |
| --- | --- | --- | --- | --- |
| painel_educacao_tijucas_rede_escolar.csv | 12 | 16 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 905 |
| painel_educacao_tijucas_matriculas.csv | 12 | 12 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 968 |
| painel_educacao_tijucas_docentes_turmas.csv | 12 | 15 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 1198 |
| painel_educacao_tijucas_infraestrutura.csv | 12 | 16 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 1590 |
| painel_educacao_tijucas_tecnologia_acessibilidade.csv | 12 | 11 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 999 |
| painel_educacao_tijucas_mapa_escolas.csv | 43 | 11 | 2025 | 7710 |
| painel_educacao_tijucas_indicadores_long.csv | 753 | 12 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 206691 |

## Indicadores calculados

- Docentes em anos finais
- Docentes em anos iniciais
- Docentes em educação infantil
- Docentes em ensino fundamental
- Docentes em ensino médio
- Docentes totais
- Escolas com EJA
- Escolas com creche
- Escolas com educação especial
- Escolas com educação infantil
- Escolas com ensino fundamental
- Escolas com fundamental anos finais
- Escolas com fundamental anos iniciais
- Escolas com pré-escola
- Escolas em funcionamento
- Escolas estaduais
- Escolas federais
- Escolas municipais
- Escolas privadas
- Escolas rurais
- Escolas urbanas
- Matrículas em EJA
- Matrículas em anos finais
- Matrículas em anos iniciais
- Matrículas em creche
- Matrículas em educação especial
- Matrículas em educação infantil
- Matrículas em ensino fundamental
- Matrículas em ensino médio
- Matrículas em pré-escola
- Matrículas em tempo integral
- Matrículas por docente aproximado
- Matrículas por turma aproximado
- Matrículas totais da educação básica
- Percentual de escolas com banda larga
- Percentual de escolas com banheiro acessível
- Percentual de escolas com internet
- Percentual de escolas com internet para alunos
- Percentual de escolas com internet para aprendizagem
- Percentual de escolas com rampas
- Percentual de escolas com salas acessíveis
- Percentual de escolas sem recurso de acessibilidade
- Total de computadores
- Total de computadores para alunos
- Turmas em anos finais
- Turmas em anos iniciais
- Turmas em educação infantil
- Turmas em ensino fundamental
- Turmas em ensino médio
- Turmas totais
- agua potavel
- agua rede publica
- banheiro
- biblioteca ou sala leitura
- cozinha
- energia rede publica
- esgoto rede publica
- laboratorio ciencias
- laboratorio informatica
- parque infantil
- patio coberto
- patio descoberto
- quadra esportes
- refeitorio

## Indicadores não calculados e motivo

- IDEB, Saeb, aprovação, reprovação, abandono e distorção idade-série não foram incluídos porque exigem bases complementares do INEP.
- Indicadores dependentes de variáveis ausentes em algum ano foram deixados em branco na base final correspondente e registrados nas observações abaixo.

## Variáveis ausentes relevantes

### painel_educacao_tijucas_matriculas.csv

- 2014: QT_MAT_BAS_INT (variável ausente)
- 2015: QT_MAT_BAS_INT (variável ausente)
- 2016: QT_MAT_BAS_INT (variável ausente)
- 2017: QT_MAT_BAS_INT (variável ausente)
- 2018: QT_MAT_BAS_INT (variável ausente)
- 2019: QT_MAT_BAS_INT (variável ausente)
- 2020: QT_MAT_BAS_INT (variável ausente)
- 2021: QT_MAT_BAS_INT (variável ausente)
- 2022: QT_MAT_BAS_INT (variável ausente)
- 2023: QT_MAT_BAS_INT (variável ausente)
- 2024: QT_MAT_BAS_INT (variável ausente)

### painel_educacao_tijucas_tecnologia_acessibilidade.csv

- 2022: QT_COMPUTADOR (variável ausente)
- 2022: QT_COMP_ALUNO (usado somatório alternativo de equipamentos de alunos)
- 2023: QT_COMPUTADOR (variável ausente)
- 2023: QT_COMP_ALUNO (usado somatório alternativo de equipamentos de alunos)
- 2024: QT_COMPUTADOR (variável ausente)
- 2024: QT_COMP_ALUNO (usado somatório alternativo de equipamentos de alunos)
- 2025: QT_COMPUTADOR (variável ausente)
- 2025: QT_COMP_ALUNO (usado somatório alternativo de equipamentos de alunos)

## Limitações

- As bases finais são derivadas do Censo Escolar/INEP filtrado para Tijucas/SC.
- Razões como matrículas por turma e matrículas por docente são aproximações locais e não indicadores oficiais do INEP.
- Indicadores com variáveis ausentes em algum ano permanecem vazios naquele recorte temporal.

## Cuidados sobre 2025

- Em 2025, a estrutura deixou de ser um arquivo consolidado e passou a ser multi-tabela.
- Para preservar comparabilidade, a geração das bases agregou as tabelas temáticas de 2025 ao nível escola/ano antes de produzir os indicadores municipais.
- A maior parte dos indicadores deve ser interpretada como `comparável com adaptação` ao longo de 2014-2025.
- O arquivo de mapa foi gerado apenas para 2025 porque latitude e longitude só apareceram de forma explícita nesse ano.

## Orientação para uso no projeto principal do painel

- Copiar apenas os arquivos finais da pasta `exports/painel_educacao_tijucas/`.
- Não levar microdados brutos nem bases intermediárias para o projeto principal.
- Tratar `painel_educacao_tijucas_indicadores_long.csv` como base principal para cartões, séries e comparações anuais.
- Usar `painel_educacao_tijucas_mapa_escolas.csv` apenas como mapa de equipamentos educacionais.
