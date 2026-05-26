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
    indicator: "Bolsa Família por município",
    description: "Famílias beneficiárias, valor total repassado e benefício médio por município de SC.",
    period: "01/2004 a 05/2026",
    format: "CSV",
    size: "6,5 MB",
    href: "/downloads/bolsa_familia_sc_mensal_colunas_separadas.csv",
  },
  {
    indicator: "Bolsa Família SC total",
    description: "Série mensal agregada para Santa Catarina com famílias, repasse e benefício médio.",
    period: "01/2004 a 05/2026",
    format: "CSV",
    size: "11 KB",
    href: "/downloads/bolsa_familia_sc_total_mensal.csv",
  },
  {
    indicator: "Procedimentos ambulatoriais",
    description: "Série mensal DataSUS com quantidade aprovada em Tijucas e SC.",
    period: "Últimos 36 meses disponíveis",
    format: "CSV",
    size: "1 KB",
    href: "/downloads/datasus_procedimentos_tijucas_sc_mensal.csv",
  },
  {
    indicator: "Saldo de empregos formais",
    description: "Série mensal MTE/CAGED com saldo de empregos em Tijucas e SC.",
    period: "04/2024 a 03/2026",
    format: "CSV",
    size: "720 B",
    href: "/downloads/mte_saldo_tijucas_sc_mensal.csv",
  },
  {
    indicator: "Matriz municipal SC",
    description: "Base para scatter municipal com Bolsa Família, emprego formal e procedimentos ambulatoriais.",
    period: "Recortes mais recentes disponíveis",
    format: "CSV",
    size: "14 KB",
    href: "/downloads/painel_scatter_municipios_sc.csv",
  },
  {
    indicator: "DataSUS ambulatorial completo",
    description: "Planilha longa de produção ambulatorial por município gestor de Santa Catarina.",
    period: "01/2008 a 03/2026",
    format: "XLSX",
    size: "1,9 MB",
    href: "/downloads/procedimento_ambulatoriais_sc_long.xlsx",
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
