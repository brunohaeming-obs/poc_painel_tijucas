import {
  Activity,
  BriefcaseBusiness,
  Building2,
  HeartPulse,
  Landmark,
  UsersRound,
} from "lucide-react";

// Integre dados reais aqui futuramente via API, CSV ou banco de dados.
// A tela consome apenas estes objetos/arrays, mantendo a troca da origem de dados simples.
export const kpiCards = [
  {
    label: "População",
    value: "48.735",
    variation: "+0,7% vs. mês anterior",
    icon: UsersRound,
  },
  {
    label: "Empresas Ativas",
    value: "6.842",
    variation: "+1,8% vs. mês anterior",
    icon: Building2,
  },
  {
    label: "Empregos Formais",
    value: "20.418",
    variation: "+2,1% vs. mês anterior",
    icon: BriefcaseBusiness,
  },
  {
    label: "Cobertura Vacinal",
    value: "93,2%",
    variation: "+0,9% vs. mês anterior",
    icon: HeartPulse,
  },
  {
    label: "Repasse FPM",
    value: "R$ 5,48 mi",
    variation: "+3,4% vs. mês anterior",
    icon: Landmark,
  },
  {
    label: "Atendimentos APS",
    value: "7.562",
    variation: "+1,2% vs. mês anterior",
    icon: Activity,
  },
];

export const themePanels = [
  "Contas Públicas",
  "Educação",
  "Saúde",
  "Economia",
  "Empresas e Empregos",
  "Meio Ambiente",
];

export const chartData = {
  employmentEvolution: [
    { month: "nov/24", saldo: 92, admissoes: 612, demissoes: 520 },
    { month: "dez/24", saldo: 68, admissoes: 548, demissoes: 480 },
    { month: "jan/25", saldo: 115, admissoes: 690, demissoes: 575 },
    { month: "fev/25", saldo: 147, admissoes: 734, demissoes: 587 },
    { month: "mar/25", saldo: 126, admissoes: 708, demissoes: 582 },
    { month: "abr/25", saldo: 171, admissoes: 762, demissoes: 591 },
  ],
  themeIndicators: [
    { theme: "Economia e Empresas", value: 86 },
    { theme: "Saúde", value: 78 },
    { theme: "Educação", value: 73 },
    { theme: "Finanças Públicas", value: 69 },
    { theme: "Meio Ambiente", value: 62 },
  ],
};

export const monthlyIndicators = [
  {
    indicator: "Registro de Empresas",
    description: "Empresas e estabelecimentos registrados",
    frequency: "Mensal",
    updatedAt: "04/2026",
  },
  {
    indicator: "Tempo de Abertura de Empresas",
    description: "Tempo médio de viabilidade, abertura e registro",
    frequency: "Mensal",
    updatedAt: "11/2025",
  },
  {
    indicator: "Atenção Primária à Saúde",
    description: "Cobertura potencial da APS",
    frequency: "Mensal",
    updatedAt: "02/2026",
  },
  {
    indicator: "Cobertura Vacinal — Residência",
    description: "Cobertura vacinal estimada por residência",
    frequency: "Mensal",
    updatedAt: "03/2026",
  },
  {
    indicator: "Fundo de Participação dos Municípios",
    description: "Repasses do FPM acumulados no mês",
    frequency: "Mensal",
    updatedAt: "01/2026",
  },
];

export const bulletins = [
  {
    title: "Boletim Econômico",
    text: "Análise mensal da economia de Tijucas com dados de empresas, empregos, PIB e arrecadação.",
  },
  {
    title: "Obras e Entregas",
    text: "Acompanhe as principais obras, investimentos e entregas para a cidade.",
  },
  {
    title: "Panorama Social",
    text: "Síntese de indicadores sociais, saúde, educação e serviços públicos para acompanhamento cidadão.",
  },
];
