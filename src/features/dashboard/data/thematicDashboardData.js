import { publicFinanceDashboardData } from "../../../data/publicFinanceDashboardData.js";

const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const monthSeries = (values, year = 2026) =>
  values.map((value, index) => ({
    periodo: `${meses[index]}/${String(year).slice(2)}`,
    valor: value,
  }));

export const thematicDashboardData = {
  economiaEmpregos: {
    id: "economiaEmpregos",
    label: "Economia",
    shortLabel: "Economia",
  },
  populacao: {
    id: "populacao",
    label: "População",
    shortLabel: "População",
    source: "Dados simulados para prototipação visual",
    summary: "Acompanha dinâmica populacional, domicílios e composição etária do município.",
    kpis: [
      { label: "População estimada", value: "48.735", note: "+0,7% no ano" },
      { label: "Domicílios", value: "18.920", note: "+2,3% no período" },
      { label: "Densidade", value: "169 hab/km²", note: "estimado" },
    ],
    population: monthSeries([46210, 46480, 46720, 46910, 47160, 47420, 47690, 47940, 48110, 48300, 48510, 48735]),
    ageGroups: [
      { name: "0 a 14", value: 21 },
      { name: "15 a 29", value: 23 },
      { name: "30 a 44", value: 25 },
      { name: "45 a 59", value: 18 },
      { name: "60+", value: 13 },
    ],
    households: monthSeries([18120, 18190, 18260, 18320, 18410, 18490, 18580, 18630, 18710, 18790, 18860, 18920]),
    table: [
      ["População urbana", "42.180", "86,5%"],
      ["População rural", "6.555", "13,5%"],
      ["Crescimento anual", "+0,7%", "estimado"],
      ["Domicílios ocupados", "18.920", "+2,3%"],
    ],
  },
  educacao: {
    id: "educacao",
    label: "Educação",
    shortLabel: "Educação",
    source: "Dados simulados para prototipação visual",
    summary: "Organiza matrícula, frequência, aprendizagem e capacidade da rede municipal.",
    kpis: [
      { label: "Matrículas", value: "6.842", note: "+2,1% no ano" },
      { label: "Frequência média", value: "91,8%", note: "+1,2 p.p." },
      { label: "Vagas em creche", value: "438", note: "demanda estimada" },
    ],
    enrollment: monthSeries([6420, 6510, 6608, 6662, 6710, 6768, 6794, 6810, 6825, 6838, 6841, 6842]),
    learning: [
      { etapa: "2º ano", portugues: 74, matematica: 69 },
      { etapa: "5º ano", portugues: 68, matematica: 63 },
      { etapa: "9º ano", portugues: 61, matematica: 57 },
    ],
    attendance: monthSeries([89.1, 90.2, 91.4, 92.1, 91.6, 90.8, 89.9, 91.1, 92.6, 92.0, 91.7, 91.8]),
    table: [
      ["Educação infantil", "1.940", "28,4%"],
      ["Anos iniciais", "2.820", "41,2%"],
      ["Anos finais", "1.580", "23,1%"],
      ["EJA", "502", "7,3%"],
    ],
  },
  saude: {
    id: "saude",
    label: "Saúde",
    shortLabel: "Saúde",
    source: "DataSUS/SIA, Relatórios Públicos da APS e DataSUS/TabNet",
    summary: "Mostra atendimento ambulatorial, capacidade da atenção básica e cobertura vacinal com dados reais.",
    kpis: [
      { label: "Procedimentos", value: "DataSUS/SIA", note: "base real" },
      { label: "Cobertura APS", value: "Relatórios APS", note: "base real" },
      { label: "Vacinação", value: "DataSUS/TabNet", note: "base real" },
    ],
  },
  contasPublicas: {
    id: "contasPublicas",
    label: "Contas públicas",
    shortLabel: "Contas",
    source: "SICONFI 2025 e IBGE Censo 2022",
    summary: publicFinanceDashboardData.summary,
    kpis: [
      ...publicFinanceDashboardData.kpis,
    ],
    finance: publicFinanceDashboardData,
    revenueExpense: {
      receita: monthSeries([13.2, 14.8, 15.4, 16.1, 16.7, 17.6, 17.2, 18.4, 18.9, 18.1, 19.3, 18.6]),
      despesa: monthSeries([11.9, 12.7, 13.8, 14.3, 15.1, 16.2, 15.8, 16.9, 17.4, 16.2, 17.1, 16.9]),
    },
    budgetExecution: [
      { area: "Saúde", previsto: 42, executado: 38 },
      { area: "Educação", previsto: 36, executado: 33 },
      { area: "Obras", previsto: 22, executado: 16 },
      { area: "Assistência", previsto: 9, executado: 8 },
      { area: "Gestão", previsto: 14, executado: 11 },
    ],
    expenseComposition: [
      { name: "Pessoal", value: 48 },
      { name: "Custeio", value: 29 },
      { name: "Investimentos", value: 13 },
      { name: "Serviço da dívida", value: 4 },
      { name: "Outras", value: 6 },
    ],
    table: [
      ["FPM", "R$ 5,8 mi", "+4,2%"],
      ["ICMS", "R$ 4,1 mi", "+2,7%"],
      ["IPTU", "R$ 2,6 mi", "+8,9%"],
      ["ISS", "R$ 1,9 mi", "+6,1%"],
    ],
  },
  construcaoCivil: {
    id: "construcaoCivil",
    label: "Construção civil",
    shortLabel: "Construção",
    source: "Dados reais de obras (CNO) — dados_obras_tijucas.csv",
    summary: "Monitora obras, alvarás, área licenciada e dinâmica da construção no município.",
    // KPIs reais derivados de public/data/dados_obras_tijucas.csv (obras únicas por CNO):
    // 166 construções; soma de area_total = 234.266,32 m²; média = 1.411,24 m².
    kpis: [
      { label: "Construções em Tijucas", value: "166", note: "obras cadastradas (CNO)" },
      { label: "Metragem total", value: "234,3 mil m²", note: "área construída somada" },
      { label: "Metragem média", value: "1.411 m²", note: "por construção" },
    ],
    permits: monthSeries([8, 10, 9, 11, 13, 12, 14, 15, 13, 16, 15, 16]),
    areaLicensed: monthSeries([3.8, 4.1, 4.6, 5.2, 5.5, 5.9, 6.2, 6.5, 6.1, 6.9, 7.2, 7.5]),
    types: [
      { name: "Residencial", value: 54 },
      { name: "Comercial", value: 22 },
      { name: "Industrial", value: 10 },
      { name: "Mista", value: 9 },
      { name: "Outras", value: 5 },
    ],
    table: [
      ["Residencial", "77", "54%"],
      ["Comercial", "31", "22%"],
      ["Industrial", "14", "10%"],
      ["Uso misto", "13", "9%"],
    ],
  },
};
