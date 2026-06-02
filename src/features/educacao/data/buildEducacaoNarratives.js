const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});
const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

function formatValue(value, unit) {
  if (value === null || value === undefined) {
    return "sem dado";
  }

  if (unit === "%") {
    return `${decimalFormatter.format(value)}%`;
  }

  return `${integerFormatter.format(value)} ${unit}`;
}

function findKpi(kpis, key) {
  return kpis.find((item) => item.key === key) ?? null;
}

function describeVariation(kpi) {
  if (!kpi?.variation || kpi.variation.value === null) {
    return "sem comparação anual disponível";
  }

  if (kpi.variation.value === 0) {
    return `permaneceu estável em relação a ${kpi.variation.previousYear}`;
  }

  if (kpi.variation.direction === "up") {
    return `aumento de ${kpi.variation.deltaText} em relação a ${kpi.variation.previousYear}`;
  }

  return `redução de ${kpi.variation.deltaText.replace("-", "")} em relação a ${kpi.variation.previousYear}`;
}

function describeSeriesEvolution(chartData, key, selectedYear) {
  if (!chartData.length) {
    return null;
  }

  const firstPoint = chartData[0];
  const selectedPoint =
    chartData.find((row) => row.year === selectedYear) ?? chartData[chartData.length - 1];
  const firstValue = firstPoint[key];
  const lastValue = selectedPoint[key];

  if (
    firstValue === null ||
    firstValue === undefined ||
    lastValue === null ||
    lastValue === undefined
  ) {
    return null;
  }

  const delta = lastValue - firstValue;
  if (delta === 0) {
    return "permaneceu estável no intervalo observado";
  }

  const percent = firstValue === 0 ? null : (delta / firstValue) * 100;
  if (delta > 0) {
    return percent === null
      ? "cresceu ao longo da série"
      : `cresceu ${decimalFormatter.format(percent)}% desde ${firstPoint.year}`;
  }

  return percent === null
    ? "recuou ao longo da série"
    : `recuou ${decimalFormatter.format(Math.abs(percent))}% desde ${firstPoint.year}`;
}

function buildOverviewVariationSentence(kpi, label) {
  if (!kpi?.variation || kpi.variation.value === null) {
    return null;
  }

  if (kpi.variation.value === 0) {
    return `${label} permaneceu estável em relação a ${kpi.variation.previousYear}`;
  }

  if (kpi.variation.direction === "up") {
    return `${label} registrou aumento de ${kpi.variation.deltaText.replace("+", "")} em relação a ${kpi.variation.previousYear}`;
  }

  return `${label} registrou redução de ${kpi.variation.deltaText.replace("-", "")} em relação a ${kpi.variation.previousYear}`;
}

export function buildEducacaoNarratives({
  selectedYear,
  overviewKpis,
  schoolComposition,
  enrollmentHistory,
  enrollmentComposition,
  infrastructureKpis,
  infrastructureChart,
  territoryData,
}) {
  const schools = findKpi(overviewKpis, "schools");
  const enrollments = findKpi(overviewKpis, "enrollments");
  const internet = findKpi(overviewKpis, "internet");
  const accessibility = findKpi(overviewKpis, "accessibility");

  const overviewVariations = [
    buildOverviewVariationSentence(enrollments, "o município"),
    schools?.variation?.value === 0
      ? `o número de escolas permaneceu estável em relação a ${schools.variation.previousYear}`
      : buildOverviewVariationSentence(schools, "o município"),
  ].filter(Boolean);

  const overview = [
    `A rede escolar de Tijucas reuniu ${formatValue(schools?.value, schools?.unit)} e ${formatValue(enrollments?.value, enrollments?.unit)} em ${selectedYear}.`,
    `No mesmo recorte, ${formatValue(internet?.value, internet?.unit)} das escolas declararam acesso à internet e ${formatValue(accessibility?.value, accessibility?.unit)} informaram banheiro acessível.`,
    overviewVariations.length
      ? `${overviewVariations.join(", enquanto ")}.`
      : `O ano selecionado ajuda a ler o tamanho da rede, o alcance das matrículas e as condições básicas de atendimento.`,
  ].join(" ");

  const enrollmentTrend = [
    `A série histórica indica que a educação infantil ${describeSeriesEvolution(enrollmentHistory.chartData, "infantil", selectedYear) ?? "não teve leitura completa"} e o ensino fundamental ${describeSeriesEvolution(enrollmentHistory.chartData, "fundamental", selectedYear) ?? "não teve leitura completa"}.`,
    `Em ${selectedYear}, a rede registrou ${formatValue(enrollments?.value, enrollments?.unit)} e manteve a série completa visível, com destaque do ano filtrado em vez de reduzir o gráfico a um único ponto.`,
  ].join(" ");

  const compositionLeader = enrollmentComposition.largestItem;
  const compositionShare =
    compositionLeader && enrollmentComposition.total > 0
      ? (compositionLeader.value / enrollmentComposition.total) * 100
      : null;
  const enrollmentCompositionText = compositionLeader
    ? [
        `${compositionLeader.label} concentrou a maior parcela das matrículas de ${selectedYear}, com ${integerFormatter.format(compositionLeader.value)} registros.`,
        compositionShare !== null
          ? `Isso corresponde a ${decimalFormatter.format(compositionShare)}% da composição mostrada no painel e ajuda a entender o perfil de atendimento da rede.`
          : "A composição do ano selecionado ajuda a interpretar o perfil de atendimento da rede.",
      ].join(" ")
    : "A composição das matrículas ainda não tem dados suficientes para leitura automatizada.";

  const bestInfrastructure = [...infrastructureKpis]
    .filter((item) => item.value !== null)
    .sort((first, second) => (second.value ?? 0) - (first.value ?? 0))[0];
  const weakestInfrastructure = [...infrastructureKpis]
    .filter((item) => item.value !== null)
    .sort((first, second) => (first.value ?? 0) - (second.value ?? 0))[0];
  const infrastructure = [
    "Os indicadores de infraestrutura mostram a proporção de escolas com recursos físicos e tecnológicos disponíveis.",
    bestInfrastructure && weakestInfrastructure
      ? `No recorte de ${selectedYear}, ${bestInfrastructure.label.toLowerCase()} aparece como o indicador mais alto (${bestInfrastructure.valueText}), enquanto ${weakestInfrastructure.label.toLowerCase()} pede leitura mais atenta (${weakestInfrastructure.valueText}).`
      : "A base atual permite acompanhar a evolução anual da infraestrutura, mesmo sem comparativo com Santa Catarina nesta versão.",
    infrastructureChart.hasReference
      ? "Quando a referência estadual estiver incorporada, o mesmo bloco poderá contrastar Tijucas com Santa Catarina."
      : "Comparativo com Santa Catarina será incorporado após geração da base estadual.",
  ].join(" ");

  const territory = territoryData.available
    ? [
        `O recorte territorial de ${selectedYear} mostra ${integerFormatter.format(territoryData.summary.schools)} escolas filtradas, distribuídas por ${integerFormatter.format(territoryData.summary.neighborhoods)} bairros e com ${integerFormatter.format(territoryData.summary.withCoordinates)} pontos georreferenciados nesta versão.`,
        "A visualização territorial representa distribuição da rede, não desempenho escolar.",
        "A tabela por bairro foi mantida com coluna de matrículas preparada, mas sem preenchimento automático porque a base atual de matrículas não traz CO_ENTIDADE para vincular escola e bairro com segurança.",
      ].join(" ")
    : [
        `A base territorial com coordenadas está disponível apenas para ${territoryData.availableYears.join(", ") || "anos futuros"}.`,
        "Ao trocar o ano global, o painel preserva esse comportamento e informa quando o recorte territorial não está disponível.",
      ].join(" ");

  return {
    overview,
    schoolComposition:
      schoolComposition.total > 0
        ? "A composição da rede no ano selecionado mostra predomínio das escolas municipais, seguida pelos demais tipos de dependência administrativa."
        : "A composição da rede por dependência administrativa ainda não teve dados suficientes para exibição.",
    enrollmentTrend,
    enrollmentComposition: enrollmentCompositionText,
    infrastructure,
    territory,
  };
}
