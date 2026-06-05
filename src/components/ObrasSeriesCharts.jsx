import { useEffect, useState } from "react";
import { EChartCard } from "./EChartCard.jsx";

const SERIES_PATH = "/data/construcao/obras_series_mensal.json";

// Zoom inicial: foca o período com atividade relevante (a partir deste mês).
const DEFAULT_START = "2020-01";

const palette = {
  blue: "#007FFE",
  orange: "#F2A116",
  border: "#DDE3EA",
};

const nf = new Intl.NumberFormat("pt-BR");

function compactM2(value) {
  return value >= 1000 ? `${nf.format(Math.round(value / 100) / 10)} mil` : nf.format(value);
}

function barOption({ labels, values, color, startValue, unit, yFormatter }) {
  return {
    color: [color],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => `${nf.format(value)} ${unit}`,
    },
    grid: { left: 56, right: 18, top: 18, bottom: 66 },
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
    dataZoom: [
      { type: "inside", startValue, endValue: labels[labels.length - 1] },
      { type: "slider", bottom: 14, height: 18, startValue, endValue: labels[labels.length - 1] },
    ],
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
        console.error("Falha ao carregar a série mensal de obras.", error);
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

  const labels = series.map((row) => row.periodo);
  const startValue = labels.includes(DEFAULT_START) ? DEFAULT_START : labels[0];

  const obrasOption = barOption({
    labels,
    values: series.map((row) => row.obras),
    color: palette.blue,
    startValue,
    unit: "obra(s)",
    yFormatter: (value) => nf.format(value),
  });

  const metragemOption = barOption({
    labels,
    values: series.map((row) => row.metragem),
    color: palette.orange,
    startValue,
    unit: "m²",
    yFormatter: compactM2,
  });

  return (
    <div className={`grid gap-6 lg:grid-cols-2 2xl:gap-8 ${className}`}>
      <EChartCard
        variant="dark"
        title="Obras iniciadas por mês"
        subtitle="Contagem mensal de obras (CNO)"
        height={300}
        option={obrasOption}
      />
      <EChartCard
        variant="dark"
        title="Metragem iniciada por mês"
        subtitle="m² iniciados por mês (CNO)"
        height={300}
        option={metragemOption}
      />
    </div>
  );
}
