import {
  enrollmentCompositionDefinitions,
  enrollmentSeriesDefinitions,
  infrastructureChartDefinitions,
  infrastructureKpiDefinitions,
  overviewKpiDefinitions,
  schoolCompositionIndicators,
} from "../config/educacaoIndicators.js";

const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});
const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatTitleCase(value = "") {
  return normalizeText(value)
    .split(" ")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function formatIndicatorValue(value, unit) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Sem dado";
  }

  if (unit === "%") {
    return `${decimalFormatter.format(value)}%`;
  }

  return `${integerFormatter.format(value)} ${unit}`;
}

function buildVariation(currentValue, previousValue, unit, previousYear) {
  if (
    currentValue === null ||
    currentValue === undefined ||
    previousValue === null ||
    previousValue === undefined
  ) {
    return {
      direction: "neutral",
      label: "Sem base anterior",
      value: null,
      previousYear,
      deltaText: null,
    };
  }

  const delta = currentValue - previousValue;
  if (delta === 0) {
    return {
      direction: "neutral",
      label: `Estavel vs. ${previousYear}`,
      value: 0,
      previousYear,
      deltaText: unit === "%" ? "0,0 p.p." : "0",
    };
  }

  const sign = delta > 0 ? "+" : "";
  const deltaText =
    unit === "%"
      ? `${sign}${decimalFormatter.format(delta)} p.p.`
      : `${sign}${integerFormatter.format(delta)}`;

  return {
    direction: delta > 0 ? "up" : "down",
    label: `${deltaText} vs. ${previousYear}`,
    value: delta,
    previousYear,
    deltaText,
  };
}

function getIndicatorRow(rows, indicatorName) {
  return rows.find((row) => row.indicador === indicatorName) ?? null;
}

function getSeriesByIndicator(series, indicatorName) {
  return series.find((item) => item.indicador === indicatorName) ?? null;
}

function getSeriesValue(seriesItem, year) {
  return seriesItem?.serie.find((point) => point.ano === year)?.valor ?? null;
}

function getYearRows(indicadoresLong, year) {
  return indicadoresLong.filter((row) => row.ano === year);
}

function getPreviousYear(availableYears, selectedYear) {
  const currentIndex = availableYears.indexOf(selectedYear);
  if (currentIndex <= 0) {
    return null;
  }
  return availableYears[currentIndex - 1];
}

function getSortedRendimentoRows(rendimento = []) {
  return [...rendimento]
    .filter((row) => Number.isFinite(Number(row?.ano)))
    .sort((first, second) => Number(first.ano) - Number(second.ano));
}

function getMapAvailableYears(mapaEscolas) {
  return mapaEscolas?.anos_disponiveis ?? [];
}

function buildOverviewKpis(indicadoresLong, availableYears, selectedYear, rendimento = []) {
  const currentRows = getYearRows(indicadoresLong, selectedYear);
  const previousYear = getPreviousYear(availableYears, selectedYear);
  const previousRows = previousYear ? getYearRows(indicadoresLong, previousYear) : [];
  const rendimentoRows = getSortedRendimentoRows(rendimento);
  const currentRendimento = rendimentoRows[rendimentoRows.length - 1] ?? null;
  const previousRendimento =
    rendimentoRows.length > 1 ? rendimentoRows[rendimentoRows.length - 2] : null;

  return overviewKpiDefinitions.map((definition) => {
    const useApprovalKpi =
      definition.key === "approval" ||
      definition.key === "internet" ||
      normalizeText(definition.label).includes("internet");
    const useAbandonmentKpi =
      definition.key === "abandonment" ||
      definition.key === "accessibility" ||
      normalizeText(definition.label).includes("acessibilidade");

    if (useApprovalKpi) {
      const currentValue = currentRendimento?.taxa_aprovacao_fundamental ?? null;
      const previousValue = previousRendimento?.taxa_aprovacao_fundamental ?? null;

      return {
        key: "approval",
        label: "Taxa de aprovação",
        note: "Percentual de estudantes do ensino fundamental que avançaram no percurso escolar.",
        unit: "%",
        value: currentValue,
        valueText: formatIndicatorValue(currentValue, "%"),
        comparisonText: null,
        variation: buildVariation(currentValue, previousValue, "%", previousRendimento?.ano ?? null),
      };
    }

    if (useAbandonmentKpi) {
      const currentValue = currentRendimento?.taxa_abandono_fundamental ?? null;
      const previousValue = previousRendimento?.taxa_abandono_fundamental ?? null;

      return {
        key: "abandonment",
        label: "Taxa de abandono",
        note: "Percentual de estudantes do ensino fundamental que perderam vínculo com a escola no ano.",
        unit: "%",
        value: currentValue,
        valueText: formatIndicatorValue(currentValue, "%"),
        comparisonText: null,
        lowerIsBetter: true,
        variation: buildVariation(currentValue, previousValue, "%", previousRendimento?.ano ?? null),
      };
    }

    const current = getIndicatorRow(currentRows, definition.indicator);
    const previous = getIndicatorRow(previousRows, definition.indicator);

    return {
      key: definition.key,
      label: definition.label,
      note: definition.note,
      unit: current?.unidade ?? "",
      value: current?.valor ?? null,
      valueText: formatIndicatorValue(current?.valor ?? null, current?.unidade ?? ""),
      comparisonText: null,
      variation: buildVariation(
        current?.valor ?? null,
        previous?.valor ?? null,
        current?.unidade ?? "",
        previousYear,
      ),
    };
  });
}

function buildSchoolComposition(indicadoresLong, selectedYear) {
  const currentRows = getYearRows(indicadoresLong, selectedYear);

  const items = schoolCompositionIndicators
    .map((definition) => {
      const row = getIndicatorRow(currentRows, definition.indicator);
      return {
        label: definition.label,
        value: row?.valor ?? 0,
        color: definition.color,
      };
    })
    .filter((item) => item.value > 0);

  return {
    items,
    total: items.reduce((sum, item) => sum + item.value, 0),
  };
}

function buildEnrollmentHistory(seriesTemporais, availableYears) {
  const series = enrollmentSeriesDefinitions.map((definition) => ({
    ...definition,
    data: getSeriesByIndicator(seriesTemporais.series, definition.indicator),
  }));

  const chartData = availableYears.map((year) => {
    const row = { year };
    for (const seriesItem of series) {
      row[seriesItem.key] = getSeriesValue(seriesItem.data, year);
    }
    return row;
  });

  return {
    series,
    chartData,
  };
}

function buildEnrollmentComposition(indicadoresLong, selectedYear) {
  const currentRows = getYearRows(indicadoresLong, selectedYear);
  const items = enrollmentCompositionDefinitions
    .map((definition) => {
      const row = getIndicatorRow(currentRows, definition.indicator);
      return {
        label: definition.label,
        value: row?.valor ?? 0,
        color: definition.color,
      };
    })
    .filter((item) => item.value > 0);

  const total = items.reduce((sum, item) => sum + item.value, 0);
  const largestItem = [...items].sort((first, second) => second.value - first.value)[0] ?? null;

  return {
    items,
    total,
    largestItem,
  };
}

function buildInfrastructureKpis(indicadoresLong, availableYears, selectedYear) {
  const currentRows = getYearRows(indicadoresLong, selectedYear);
  const previousYear = getPreviousYear(availableYears, selectedYear);
  const previousRows = previousYear ? getYearRows(indicadoresLong, previousYear) : [];

  return infrastructureKpiDefinitions.map((definition) => {
    const current = getIndicatorRow(currentRows, definition.indicator);
    const previous = getIndicatorRow(previousRows, definition.indicator);

    return {
      key: definition.key,
      label: definition.label,
      note: definition.note,
      unit: current?.unidade ?? "%",
      value: current?.valor ?? null,
      valueText: formatIndicatorValue(current?.valor ?? null, current?.unidade ?? "%"),
      comparisonText: null,
      variation: buildVariation(
        current?.valor ?? null,
        previous?.valor ?? null,
        current?.unidade ?? "%",
        previousYear,
      ),
    };
  });
}

function buildFallbackInfrastructureChart(indicadoresLong, selectedYear) {
  const currentRows = getYearRows(indicadoresLong, selectedYear);
  const items = infrastructureChartDefinitions.map((definition) => {
    const row = getIndicatorRow(currentRows, definition.indicator);
    return {
      key: definition.indicator,
      label: definition.label,
      tijucas: row?.valor ?? null,
      reference: null,
      note: "",
      unit: "%",
    };
  });

  return {
    year: selectedYear,
    items,
    hasReference: false,
    comparisonAvailable: false,
    note: "Comparativo estadual indisponível nos arquivos atuais.",
  };
}

function buildInfrastructureChart(indicadoresLong, selectedYear, comparativoSc2024) {
  const rows = Array.isArray(comparativoSc2024)
    ? comparativoSc2024.filter((row) => Number(row.ano) === 2024)
    : [];

  if (!rows.length) {
    return buildFallbackInfrastructureChart(indicadoresLong, selectedYear);
  }

  return {
    year: 2024,
    items: rows.map((row) => ({
      key: row.indicador_codigo,
      label: row.indicador_nome,
      tijucas: row.tijucas ?? null,
      reference: row.santa_catarina ?? null,
      note: row.observacao_metodologica ?? "",
      unit: row.unidade ?? "%",
    })),
    hasReference: true,
    comparisonAvailable: true,
    note: "A comparação utiliza 2024 como fotografia principal. O ano de 2025 não foi incluído no comparativo estadual por mudança na estrutura dos microdados do Censo Escolar.",
  };
}

const infraHistoryDefinitions = [
  { key: "internet",      label: "Internet",       longIndicator: "Percentual de escolas com internet",           scCode: "perc_escolas_internet" },
  { key: "refectory",     label: "Refeitório",     longIndicator: "refeitorio",                                   scCode: "perc_escolas_refeitorio" },
  { key: "accessibility", label: "Acessibilidade", longIndicator: "Percentual de escolas com banheiro acessível", scCode: "perc_escolas_banheiro_acessivel" },
  { key: "water",         label: "Água potável",   longIndicator: "agua potavel",                                 scCode: null },
];

function buildInfrastructureHistory(comparativoSc, indicadoresLong) {
  const scData = Array.isArray(comparativoSc) ? comparativoSc : [];

  return infraHistoryDefinitions.map((def) => {
    const scRows = def.scCode
      ? scData.filter((row) => row.indicador_codigo === def.scCode)
      : [];

    const allYears = def.scCode
      ? [...new Set(scRows.map((row) => Number(row.ano)))].sort((a, b) => a - b)
      : indicadoresLong
          .filter((row) => row.indicador === def.longIndicator)
          .map((row) => row.ano)
          .sort((a, b) => a - b);

    const chartData = allYears.map((year) => {
      const tijucasRow = indicadoresLong.find(
        (row) => row.indicador === def.longIndicator && (row.ano === year || Number(row.ano) === year),
      );
      const scRow = scRows.find((row) => Number(row.ano) === year);
      return {
        year,
        tijucas: tijucasRow?.valor ?? scRow?.tijucas ?? null,
        sc: scRow?.santa_catarina ?? null,
      };
    });

    return { key: def.key, label: def.label, hasSc: scRows.length > 0, chartData };
  });
}

function buildTerritoryData(
  mapaEscolas,
  filters,
  territorioMatriculasBairro2025 = null,
  mapaEscolasComMatriculas2025 = null,
) {
  const selectedYear = filters.selectedYear;
  const selectedYearNumber = Number(selectedYear);
  const availableYears = [...getMapAvailableYears(mapaEscolas)];
  const has2025SchoolsWithEnrollments =
    selectedYearNumber === 2025 &&
    Array.isArray(mapaEscolasComMatriculas2025) &&
    mapaEscolasComMatriculas2025.length > 0;

  if (
    Array.isArray(mapaEscolasComMatriculas2025) &&
    mapaEscolasComMatriculas2025.length > 0 &&
    !availableYears.includes(2025)
  ) {
    availableYears.push(2025);
    availableYears.sort((first, second) => first - second);
  }

  const yearRows = has2025SchoolsWithEnrollments
    ? mapaEscolasComMatriculas2025.filter((row) => Number(row.ano) === selectedYearNumber)
    : (mapaEscolas?.registros ?? []).filter((row) => Number(row.ano) === selectedYearNumber);

  if (!availableYears.map(Number).includes(selectedYearNumber)) {
    return {
      available: false,
      referenceYear: selectedYearNumber,
      availableYears,
      filteredSchools: [],
      points: [],
      neighborhoodRows: [],
      summary: {
        schools: 0,
        neighborhoods: 0,
        withCoordinates: 0,
        urban: 0,
        rural: 0,
        enrollments: 0,
        hasEnrollmentsByNeighborhood: false,
      },
    };
  }

  const filteredSchools = yearRows;
  const hasNeighborhoodEnrollments =
    selectedYearNumber === 2025 && Array.isArray(territorioMatriculasBairro2025?.bairros);

  const neighborhoodRows = hasNeighborhoodEnrollments
    ? [...territorioMatriculasBairro2025.bairros]
        .map((row) => ({
          bairro: formatTitleCase(row.bairro || "Sem bairro"),
          escolas: row.escolas ?? 0,
          matriculas: row.matriculas_total_educacao_basica ?? null,
          matriculasEducacaoInfantil: row.matriculas_educacao_infantil ?? null,
          matriculasEnsinoFundamental: row.matriculas_ensino_fundamental ?? null,
          matriculasEnsinoMedio: row.matriculas_ensino_medio ?? null,
        }))
        .sort((first, second) => {
          const secondValue = second.matriculas ?? -1;
          const firstValue = first.matriculas ?? -1;
          if (secondValue !== firstValue) {
            return secondValue - firstValue;
          }
          return first.bairro.localeCompare(second.bairro, "pt-BR");
        })
    : (() => {
        const groupedByNeighborhood = new Map();
        for (const row of filteredSchools) {
          const key = normalizeText(row.bairro || "Sem bairro");
          if (!groupedByNeighborhood.has(key)) {
            groupedByNeighborhood.set(key, {
              bairro: formatTitleCase(row.bairro || "Sem bairro"),
              escolas: 0,
              matriculas: null,
            });
          }
          groupedByNeighborhood.get(key).escolas += 1;
        }

        return [...groupedByNeighborhood.values()].sort((first, second) => {
          if (first.escolas !== second.escolas) {
            return second.escolas - first.escolas;
          }
          return first.bairro.localeCompare(second.bairro, "pt-BR");
        });
      })();

  const points = filteredSchools
    .filter((row) => row.latitude && row.longitude)
    .map((row) => ({
      ...row,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    }))
    .filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude));

  return {
    available: true,
    referenceYear: selectedYearNumber,
    availableYears,
    filteredSchools,
    points,
    neighborhoodRows,
    summary: {
      schools: filteredSchools.length,
      neighborhoods: neighborhoodRows.length,
      withCoordinates: points.length,
      urban: filteredSchools.filter((row) => normalizeText(row.localizacao) === "urbana").length,
      rural: filteredSchools.filter((row) => normalizeText(row.localizacao) === "rural").length,
      enrollments: filteredSchools.reduce((sum, row) => {
        const value = Number(row.matriculas_total_educacao_basica);
        return Number.isFinite(value) ? sum + value : sum;
      }, 0),
      hasEnrollmentsByNeighborhood: hasNeighborhoodEnrollments,
    },
  };
}

export function getAvailableYears(allData) {
  return allData?.metadata?.anos_disponiveis ?? [];
}

export function buildEducacaoViewModel(allData, filters) {
  const availableYears = getAvailableYears(allData);
  const selectedYear = availableYears.includes(filters.selectedYear)
    ? filters.selectedYear
    : availableYears[availableYears.length - 1] ?? "";
  const territoryReferenceYear = 2025;

  return {
    selectedYear,
    availableYears,
    overviewKpis: buildOverviewKpis(
      allData.indicadoresLong,
      availableYears,
      selectedYear,
      allData.rendimento ?? [],
    ),
    schoolComposition: buildSchoolComposition(allData.indicadoresLong, selectedYear),
    enrollmentHistory: buildEnrollmentHistory(allData.seriesTemporais, availableYears),
    enrollmentComposition: buildEnrollmentComposition(allData.indicadoresLong, selectedYear),
    infrastructureKpis: buildInfrastructureKpis(
      allData.indicadoresLong,
      availableYears,
      selectedYear,
    ),
    infrastructureChart: buildInfrastructureChart(
      allData.indicadoresLong,
      selectedYear,
      allData.comparativoSc2024,
    ),
    infrastructureHistory: buildInfrastructureHistory(
      allData.comparativoSc,
      allData.indicadoresLong,
    ),
    territoryData: buildTerritoryData(
      allData.mapaEscolas,
      {
        ...filters,
        selectedYear: territoryReferenceYear,
      },
      allData.territorioMatriculasBairro2025,
      allData.mapaEscolasComMatriculas2025,
    ),
  };
}

export function formatEducacaoValue(value, unit) {
  return formatIndicatorValue(value, unit);
}
