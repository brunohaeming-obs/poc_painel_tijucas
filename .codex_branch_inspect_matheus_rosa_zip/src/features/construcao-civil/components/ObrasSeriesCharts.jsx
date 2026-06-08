import { useEffect, useState } from "react";
import { EChartCard } from "../../../shared/charts/EChartCard.jsx";

const SERIES_PATH = "/data/construcao/obras_series_mensal.json";

const palette = {
  blue: "#007FFE",
  orange: "#F2A116",
  border: "#DDE3EA",
};

const nf = new Intl.NumberFormat("pt-BR");

function compactM2(value) {
  return value >= 1000 ? `${nf.format(Math.round(value / 100) / 10)} mil` : nf.format(value);
}

// Agrega a série mensal ("YYYY-MM") em totais anuais, somando obras e metragem.
function aggregateByYear(series) {
  const byYear = new Map();
  for (const row of series) {
    const ano = String(row.periodo).slice(0, 4);
    const acc = byYear.get(ano) ?? { obras: 0, metragem: 0 };
    acc.obras += row.obras ?? 0;
    acc.metragem += row.metragem ?? 0;
    byYear.set(ano, acc);
  }
  return [...byYear.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([ano, totals]) => ({ ano, ...totals }));
}

function barOption({ labels, values, color, unit, yFormatter }) {
  return {
    color: [color],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => `${nf.format(value)} ${unit}`,
    },
    grid: { left: 56, right: 18, top: 18, bottom: 36 },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: "#6B7280" },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#6B7280", formatter: yFormatter },
      splitLine: { lineStyle: { color: palette.border, type: "dashed" } },
    },
    series: [
      {
        type: "bar",
        data: values,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  };
}

export function ObrasSeriesCharts({ className = "" }) {
  const [series, setSeries] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    fetch(SERIES_PATH)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setSeries(data.series);
        setStatus("ready");
      })
      .catch((error) => {
        console.error("Falha ao carregar a série de obras.", error);
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status !== "ready") {
    return (
      <div
        className={`grid min-h-[200px] place-items-center rounded-lg border border-white bg-white p-5 text-sm font-bold text-slate-600 ${className}`}
      >
        {status === "error"
          ? "Não foi possível carregar a série histórica de obras."
          : "Carregando séries…"}
      </div>
    );
  }

  const annual = aggregateByYear(series);
  const labels = annual.map((row) => row.ano);

  const obrasOption = barOption({
    labels,
    values: annual.map((row) => row.obras),
    color: palette.blue,
    unit: "obra(s)",
    yFormatter: (value) => nf.format(value),
  });

  const metragemOption = barOption({
    labels,
    values: annual.map((row) => row.metragem),
    color: palette.orange,
    unit: "m²",
    yFormatter: compactM2,
  });

  return (
    <div className={`grid gap-6 lg:grid-cols-2 2xl:gap-8 ${className}`}>
      <EChartCard
        variant="dark"
        title="Obras iniciadas por ano"
        subtitle="Contagem anual de obras (CNO)"
        height={300}
        option={obrasOption}
      />
      <EChartCard
        variant="dark"
        title="Metragem iniciada por ano"
        subtitle="m² iniciados por ano (CNO)"
        height={300}
        option={metragemOption}
      />
    </div>
  );
}