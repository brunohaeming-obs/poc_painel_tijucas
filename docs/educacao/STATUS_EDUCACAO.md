# Status da seção Educação

## Escopo da rodada atual

- Ajustes aplicados apenas no bloco `Visão geral`.
- Os blocos `Atendimento escolar`, `Infraestrutura`, `Território` e `Rodapé` não tiveram mudanças estruturais nesta etapa.

## Arquivos alterados

- `src/features/educacao/components/AnimatedCounter.jsx`
- `src/features/educacao/components/TypewriterText.jsx`
- `src/features/educacao/components/EducacaoNarrativeText.jsx`
- `src/features/educacao/components/EducacaoKpiGrid.jsx`
- `src/features/educacao/components/EducacaoKpiCard.jsx`
- `src/features/educacao/components/EducacaoOverviewSection.jsx`
- `src/features/educacao/data/transformEducacaoData.js`
- `src/features/educacao/data/buildEducacaoNarratives.js`
- `docs/educacao/STATUS_EDUCACAO.md`

## Melhorias concluídas na Visão geral

- Os quatro cards de KPI foram padronizados em grid `2x2`, com alturas mais consistentes.
- Os ícones dos KPIs foram ampliados.
- As variações ficaram mais explícitas no bloco `Visão geral`, com leitura em linguagem mais cidadã:
  - `Aumento de ... desde ...`
  - `Redução de ... desde ...`
  - `Sem mudança desde ...`
- Os números principais dos quatro KPIs agora usam contador animado local.
- O texto `Retrato síntese da rede` agora usa efeito local de digitação por palavras, com respeito a `prefers-reduced-motion`.
- A rosca `Escolas por dependência` foi ampliada para ocupar melhor o card.
- A legenda da rosca agora mostra:
  - dependência administrativa
  - número absoluto de escolas
  - percentual de participação no total do ano selecionado
- O espaço vazio abaixo da rosca foi reduzido com legenda expandida e linha de total.
- O texto narrativo da Visão geral foi reescrito para remover a linguagem `vs.` e adotar formulação mais clara para o cidadão.

## Comportamento mantido

- Os dados continuam vindo das bases reais já integradas.
- O filtro global segue sendo apenas `Ano de referência`.
- As séries históricas dos gráficos continuam completas.
- A página Educação continua aparecendo apenas dentro do eixo `Educação`.

## Pendências

- Comparação com Santa Catarina continua pendente porque a base estadual ainda não está publicada para estes indicadores.
- Matrículas por bairro continuam como `N/D`, porque a base atual não traz vínculo seguro por escola.
- O mapa territorial e os demais blocos não foram refinados nesta rodada.
- Ainda vale validar a leitura narrativa com a equipe técnica antes de publicação externa.

## Validação

- `npm run build`: passou.
- `npm run dev`: servidor local ativo em `http://127.0.0.1:5173/`.
