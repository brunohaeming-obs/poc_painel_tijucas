// Monta a lista de cards de cada eixo renderizado pelo painel escuro (AxisPanel).
// Os eixos economiaEmpregos, educacao, contasPublicas e saude NÃO passam por aqui —
// eles têm páginas próprias em features/ e são roteados no ThematicDashboard.
import { barOption, lineOption, pieOption } from "../../shared/charts/echartsOptions.js";

function populacaoCards(theme) {
  return [
    {
      kind: "chart",
      title: "População estimada",
      subtitle: "Série mensal simulada",
      option: lineOption({
        labels: theme.population.map((row) => row.periodo),
        series: [{ name: "População", data: theme.population.map((row) => row.valor) }],
      }),
    },
    {
      kind: "chart",
      title: "Composição etária",
      subtitle: "Distribuição percentual simulada",
      option: pieOption(theme.ageGroups),
    },
    {
      kind: "chart",
      title: "Domicílios",
      subtitle: "Série mensal simulada",
      option: lineOption({
        labels: theme.households.map((row) => row.periodo),
        series: [{ name: "Domicílios", data: theme.households.map((row) => row.valor) }],
      }),
    },
    { kind: "table", title: "Resumo populacional", subtitle: "Indicadores selecionados", rows: theme.table },
  ];
}

function meioAmbienteCards(theme) {
  return [
    {
      kind: "chart",
      title: "Coleta seletiva",
      subtitle: "Toneladas mensais simuladas",
      option: lineOption({
        labels: theme.waste.map((row) => row.periodo),
        series: [{ name: "Toneladas", data: theme.waste.map((row) => row.valor) }],
      }),
    },
    {
      kind: "chart",
      title: "Licenciamento ambiental",
      subtitle: "Processos por tipo",
      option: pieOption(theme.licensing),
    },
    {
      kind: "chart",
      title: "Arborização urbana",
      subtitle: "Mudas plantadas no ano",
      option: barOption({
        labels: theme.treePlanting.map((row) => row.periodo),
        series: [{ name: "Mudas", data: theme.treePlanting.map((row) => row.valor) }],
      }),
    },
    { kind: "table", title: "Ocorrências ambientais", subtitle: "Resumo operacional", rows: theme.table },
  ];
}

function construcaoCivilCards() {
  return [
    {
      kind: "map",
      title: "Obras geolocalizadas em Tijucas",
      subtitle: "Setores censitários com obras ativas (CNO)",
    },
    { kind: "obrasSeries" },
  ];
}

const builders = {
  populacao: populacaoCards,
  meioAmbiente: meioAmbienteCards,
  construcaoCivil: construcaoCivilCards,
};

export function buildAxisCards(theme) {
  const builder = builders[theme.id];
  return builder ? builder(theme) : [];
}
