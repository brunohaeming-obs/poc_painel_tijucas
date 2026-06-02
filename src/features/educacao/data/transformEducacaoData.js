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

function getMapAvailableYears(mapaEscolas) {
  return mapaEscolas?.anos_disponiveis ?? [];
}

function buildOverviewKpis(indicadoresLong, availableYears, selectedYear) {
  const currentRows = getYearRows(indicadoresLong, selectedYear);
  const previousYear = getPreviousYear(availableYears, selectedYear);
  const previousRows = previousYear ? getYearRows(indicadoresLong, previousYear) : [];

  return overviewKpiDefinitions.map((definition) => {
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

function buildInfrastructureChart(indicadoresLong, selectedYear) {
  const currentRows = getYearRows(indicadoresLong, selectedYear);
  const items = infrastructureChartDefinitions.map((definition) => {
    const row = getIndicatorRow(currentRows, definition.indicator);
    return {
      label: definition.label,
      tijucas: row?.valor ?? null,
      reference: null,
    };
  });

  return {
    items,
    hasReference: false,
  };
}

function buildTerritoryData(mapaEscolas, filters) {
  const availableYears = getMapAvailableYears(mapaEscolas);
  const selectedYear = filters.selectedYear;
  const yearRows = (mapaEscolas?.registros ?? []).filter((row) => row.ano === selectedYear);

  if (!availableYears.includes(selectedYear)) {
    return {
      available: false,
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
      },
    };
  }

  const filteredSchools = yearRows;

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

  const neighborhoodRows = [...groupedByNeighborhood.values()].sort((first, second) => {
    if (first.escolas !== second.escolas) {
      return second.escolas - first.escolas;
    }
    return first.bairro.localeCompare(second.bairro, "pt-BR");
  });

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

  return {
    selectedYear,
    availableYears,
    overviewKpis: buildOverviewKpis(allData.indicadoresLong, availableYears, selectedYear),
    schoolComposition: buildSchoolComposition(allData.indicadoresLong, selectedYear),
    enrollmentHistory: buildEnrollmentHistory(allData.seriesTemporais, availableYears),
    enrollmentComposition: buildEnrollmentComposition(allData.indicadoresLong, selectedYear),
    infrastructureKpis: buildInfrastructureKpis(
      allData.indicadoresLong,
      availableYears,
      selectedYear,
    ),
    infrastructureChart: buildInfrastructureChart(allData.indicadoresLong, selectedYear),
    territoryData: buildTerritoryData(allData.mapaEscolas, {
      ...filters,
      selectedYear,
    }),
  };
}

export function formatEducacaoValue(value, unit) {
  return formatIndicatorValue(value, unit);
}
