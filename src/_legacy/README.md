# _legacy

Componentes e dados que **não eram importados por nenhuma parte da aplicação** no
momento da reestruturação (2026-06). Foram movidos para cá em vez de deletados para
servir como _scaffolding_ reaproveitável conforme a plataforma cresce.

Nada nesta pasta entra no bundle (o Vite só empacota o que é alcançável a partir de
`src/main.jsx`). Para reativar um item, mova-o de volta para `src/shared/` ou para a
feature correspondente e ajuste os imports.

## Componentes
`BarChartCard`, `LineChartCard`, `KpiCard`, `MapCard`, `MonthlyIndicatorsTable`,
`RealIndicatorsSection`, `BulletinsSection`, `HeroSection`, `Footer`,
`ThemeSelector`, `BolsaFamiliaScChartCard`.

## Dados
`bolsaFamiliaScTotal.js`, `portalData.js`, `ibgeScMunicipioNames.json`.
