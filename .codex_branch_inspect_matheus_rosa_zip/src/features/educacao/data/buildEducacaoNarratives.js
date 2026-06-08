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

function getAverageAnnualGrowth(chartData, key) {
  const validPoints = chartData.filter(
    (row) => Number.isFinite(row?.[key]) && Number(row[key]) > 0 && Number.isFinite(Number(row.year)),
  );

  if (validPoints.length < 2) {
    return null;
  }

  const firstPoint = validPoints[0];
  const lastPoint = validPoints[validPoints.length - 1];
  const years = Number(lastPoint.year) - Number(firstPoint.year);

  if (years <= 0) {
    return null;
  }

  const growth = ((lastPoint[key] / firstPoint[key]) ** (1 / years) - 1) * 100;

  if (!Number.isFinite(growth)) {
    return null;
  }

  return {
    startYear: Number(firstPoint.year),
    endYear: Number(lastPoint.year),
    value: growth,
  };
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
  const approval = findKpi(overviewKpis, "approval");
  const abandonment = findKpi(overviewKpis, "abandonment");
  const rendimentoYear =
    approval?.variation?.previousYear !== null &&
    approval?.variation?.previousYear !== undefined
      ? Number(approval.variation.previousYear) + 1
      : abandonment?.variation?.previousYear !== null &&
          abandonment?.variation?.previousYear !== undefined
        ? Number(abandonment.variation.previousYear) + 1
        : null;

  const overviewIntro =
    schools?.value !== null &&
    schools?.value !== undefined &&
    enrollments?.value !== null &&
    enrollments?.value !== undefined
      ? `A educação básica de Tijucas pode ser lida por dois ângulos: o tamanho da rede e o percurso dos estudantes. Em ${selectedYear}, o município registrou ${formatValue(schools.value, schools.unit)} e ${formatValue(enrollments.value, enrollments.unit)}, indicando o alcance do atendimento escolar no território.`
      : "A educação básica de Tijucas pode ser lida por dois ângulos: o tamanho da rede e o percurso dos estudantes. Escolas e matrículas ajudam a dimensionar o alcance do atendimento escolar no território.";

  const rendimentoSentence =
    approval?.value !== null &&
    approval?.value !== undefined &&
    abandonment?.value !== null &&
    abandonment?.value !== undefined
      ? `As taxas de rendimento ajudam a observar o que acontece depois que o aluno está na escola. Em ${rendimentoYear ?? "seu recorte mais recente disponível"}, último dado disponível para esse indicador, a aprovação no ensino fundamental foi de ${formatValue(approval.value, approval.unit)} e o abandono ficou em ${formatValue(abandonment.value, abandonment.unit)}. Isso sugere baixa perda de vínculo escolar nesse recorte, embora não permita avaliar, sozinho, a qualidade da aprendizagem.`
      : "As taxas de rendimento ajudam a observar o que acontece depois que o aluno está na escola. Aprovação e abandono ajudam a acompanhar permanência e progressão escolar, mas não permitem avaliar, sozinhos, a qualidade da aprendizagem.";

  const overview = [
    overviewIntro,
    rendimentoSentence,
    `Fonte: Censo Escolar/INEP e Taxas de Rendimento Escolar/INEP. Matrículas e escolas: ${selectedYear}; aprovação e abandono: ${rendimentoYear ?? "último dado disponível"}.`,
  ].join(" ");

  const compositionLeader = enrollmentComposition.largestItem;
  const totalGrowth = getAverageAnnualGrowth(enrollmentHistory.chartData, "total");
  const enrollmentTrendSentences = [
    "As matrículas mostram o tamanho da demanda atendida pela rede escolar. A leitura por etapa é importante porque educação infantil, ensino fundamental e ensino médio respondem a necessidades diferentes do percurso escolar.",
    compositionLeader
      ? `${compositionLeader.label} concentra a maior parte dos estudantes no recorte atual, enquanto o total ajuda a visualizar o movimento geral da rede. As etapas mostram onde a mudança se concentra ao longo do tempo.`
      : "O total mostra o movimento geral da rede, mas as etapas ajudam a localizar onde a mudança se concentra ao longo do tempo.",
  ];

  if (totalGrowth) {
    enrollmentTrendSentences.push(
      `Entre ${totalGrowth.startYear} e ${totalGrowth.endYear}, as matrículas totais cresceram em média ${decimalFormatter.format(totalGrowth.value)}% ao ano.`,
    );
  }

  const enrollmentTrend = enrollmentTrendSentences.join(" ");
  const enrollmentTrendNote = totalGrowth
    ? `Crescimento médio ao ano calculado pela taxa composta entre ${totalGrowth.startYear} e ${totalGrowth.endYear}.`
    : null;

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
    bestInfrastructure && weakestInfrastructure
      ? `Infraestrutura ajuda a entender as condições de funcionamento da rede. Em ${selectedYear}, ${bestInfrastructure.label.toLowerCase()} aparece universalizada ou próxima da universalização nas escolas de Tijucas, enquanto ${weakestInfrastructure.label.toLowerCase()} diferencia melhor as condições declaradas entre as unidades.`
      : `Infraestrutura ajuda a entender as condições de funcionamento da rede. Em ${selectedYear}, os indicadores disponíveis mostram recursos básicos declarados pelas escolas de Tijucas.`,
    "Esses indicadores não medem aprendizagem, mas mostram recursos básicos que influenciam a experiência escolar. A leitura mais útil é observar quais itens já estão próximos da universalização e quais ainda exigem acompanhamento.",
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
    enrollmentTrendNote,
    enrollmentComposition: enrollmentCompositionText,
    infrastructure,
    territory,
  };
}
