# Nota metodologica da educacao de Tijucas

## Escopo

Esta exportacao foi preparada a partir de bases filtradas e agregadas do Censo Escolar/INEP para o municipio de Tijucas/SC.

## Fonte principal

- Os indicadores foram construidos a partir dos microdados do Censo Escolar/INEP.
- O pacote exportado nao contem microdados brutos nem bases intermediarias.
- As bases foram consolidadas para consumo em painel publico e download controlado.

## Indicadores nao incluidos

- IDEB, Saeb, aprovacao, reprovacao, abandono e distorcao idade-serie exigem bases complementares do INEP.
- Esses indicadores nao devem ser inferidos diretamente deste pacote, salvo nova validacao metodologica com outras fontes.

## Comparabilidade de 2025

- Em 2025, a estrutura do Censo Escolar mudou de um arquivo consolidado para um conjunto de tabelas tematicas.
- Para manter comparabilidade, os indicadores de 2025 foram agregados ao nivel escola/ano e depois consolidados para municipio/ano.
- A leitura recomendada para a maior parte dos indicadores e `comparavel com adaptacao`.

## Mapa das escolas

- O mapa de escolas deve ser tratado como localizacao de equipamentos educacionais.
- O mapa nao deve ser usado como ranking de desempenho escolar.
- Coordenadas geograficas apareceram explicitamente apenas em 2025, por isso a base de mapa foi restrita a esse ano.

## Privacidade

- Nao ha dados individualizados de alunos neste pacote.
- Nao devem ser publicados microdados de estudantes, docentes ou gestores.
