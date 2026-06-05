export const educacaoFilterOptions = {
  dependencia: [
    { value: "all", label: "Toda a rede" },
    { value: "Municipal", label: "Municipal" },
    { value: "Estadual", label: "Estadual" },
    { value: "Privada", label: "Privada" },
    { value: "Federal", label: "Federal" },
  ],
  localizacao: [
    { value: "all", label: "Todo o território" },
    { value: "Urbana", label: "Urbana" },
    { value: "Rural", label: "Rural" },
  ],
  etapa: [
    { value: "all", label: "Todas as etapas" },
    { value: "educacao_infantil", label: "Educação infantil" },
    { value: "ensino_fundamental", label: "Ensino fundamental" },
    { value: "fundamental_anos_iniciais", label: "Fundamental anos iniciais" },
    { value: "fundamental_anos_finais", label: "Fundamental anos finais" },
    { value: "ensino_medio", label: "Ensino médio" },
    { value: "eja", label: "EJA" },
    { value: "educacao_especial", label: "Educação especial" },
  ],
};

export const stageFilterMatcher = {
  educacao_infantil: "educacao infantil",
  ensino_fundamental: "ensino fundamental",
  fundamental_anos_iniciais: "fundamental anos iniciais",
  fundamental_anos_finais: "fundamental anos finais",
  ensino_medio: "ensino medio",
  eja: "eja",
  educacao_especial: "educacao especial",
};

export const overviewKpiDefinitions = [
  {
    key: "schools",
    label: "Escolas em funcionamento",
    indicator: "Escolas em funcionamento",
    note: "Tamanho da rede ativa no ano selecionado.",
  },
  {
    key: "enrollments",
    label: "Matrículas na educação básica",
    indicator: "Matrículas totais da educação básica",
    note: "Alcance do atendimento escolar no município.",
  },
  {
    key: "approval",
    label: "Taxa de aprovação",
    indicator: "Taxa de aprovação no ensino fundamental",
    note: "Percentual de estudantes aprovados no ensino fundamental.",
  },
  {
    key: "abandonment",
    label: "Taxa de abandono",
    indicator: "Taxa de abandono no ensino fundamental",
    note: "Percentual de estudantes que deixaram a escola no ensino fundamental.",
  },
];

export const schoolCompositionIndicators = [
  { indicator: "Escolas municipais", label: "Municipal", color: "#4EA5FF" },
  { indicator: "Escolas estaduais", label: "Estadual", color: "#77C56B" },
  { indicator: "Escolas privadas", label: "Privada", color: "#F2C14E" },
  { indicator: "Escolas federais", label: "Federal", color: "#F2994A" },
];

export const enrollmentSeriesDefinitions = [
  {
    key: "infantil",
    label: "Educação infantil",
    indicator: "Matrículas em educação infantil",
    color: "#4EA5FF",
  },
  {
    key: "fundamental",
    label: "Ensino fundamental",
    indicator: "Matrículas em ensino fundamental",
    color: "#77C56B",
  },
  {
    key: "medio",
    label: "Ensino médio",
    indicator: "Matrículas em ensino médio",
    color: "#F2C14E",
  },
  {
    key: "total",
    label: "Total",
    indicator: "Matrículas totais da educação básica",
    color: "#F2994A",
  },
];

export const enrollmentCompositionDefinitions = [
  {
    indicator: "Matrículas em educação infantil",
    label: "Educação infantil",
    color: "#4EA5FF",
  },
  {
    indicator: "Matrículas em ensino fundamental",
    label: "Ensino fundamental",
    color: "#77C56B",
  },
  {
    indicator: "Matrículas em ensino médio",
    label: "Ensino médio",
    color: "#F2C14E",
  },
  {
    indicator: "Matrículas em EJA",
    label: "EJA",
    color: "#F2994A",
  },
  {
    indicator: "Matrículas em educação especial",
    label: "Educação especial",
    color: "#73D2DE",
  },
];

export const infrastructureKpiDefinitions = [
  {
    key: "water",
    label: "Água potável",
    indicator: "agua potavel",
    note: "Escolas com disponibilidade declarada de água potável.",
  },
  {
    key: "internet",
    label: "Internet",
    indicator: "Percentual de escolas com internet",
    note: "Escolas com internet declarada.",
  },
  {
    key: "refectory",
    label: "Refeitório",
    indicator: "refeitorio",
    note: "Rede com espaço para refeição.",
  },
  {
    key: "accessibility",
    label: "Acessibilidade",
    indicator: "Percentual de escolas com banheiro acessível",
    note: "Proxy de acessibilidade baseada em banheiro acessível.",
  },
];

export const infrastructureChartDefinitions = [
  {
    indicator: "biblioteca ou sala leitura",
    label: "Biblioteca ou sala de leitura",
  },
  {
    indicator: "laboratorio informatica",
    label: "Laboratório de informática",
  },
  {
    indicator: "quadra esportes",
    label: "Quadra de esportes",
  },
  {
    indicator: "Percentual de escolas com internet",
    label: "Internet",
  },
  {
    indicator: "Percentual de escolas com banheiro acessível",
    label: "Acessibilidade",
  },
];

export const territoryModes = [
  { value: "schools", label: "Escolas" },
  { value: "enrollments", label: "Matrículas" },
];
