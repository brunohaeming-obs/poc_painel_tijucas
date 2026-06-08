// Construtores de `option` para o ECharts compartilhados entre os painéis temáticos.
// Cada função recebe dados já normalizados e devolve a configuração do gráfico.
import { compactNumber } from "../lib/formatters.js";
import { palette } from "./palette.js";

export function baseGrid(extra = {}) {
  return {
    left: 58,
    right: 36,
    top: 46,
    bottom: 42,
    ...extra,
  };
}

export function lineOption({ labels, series, yFormatter = compactNumber.format }) {
  return {
    color: [palette.blue, palette.green, palette.orange, palette.yellow],
    tooltip: { trigger: "axis" },
    legend: { top: 0, right: 0 },
    grid: baseGrid(),
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
    series: series.map((item) => ({
      ...item,
      type: item.type || "line",
      smooth: true,
      symbolSize: 6,
      lineStyle: { width: 3 },
    })),
  };
}

export function barOption({ labels, series, horizontal = false, yFormatter = compactNumber.format }) {
  return {
    color: [palette.blue, palette.yellow, palette.green, palette.orange],
    tooltip: { trigger: "axis" },
    legend: { top: 0, right: 0 },
    grid: baseGrid(horizontal ? { left: 220, right: 36, bottom: 32 } : {}),
    xAxis: horizontal
      ? {
          type: "value",
          axisLabel: { color: "#6B7280", formatter: yFormatter },
          splitLine: { lineStyle: { color: palette.border, type: "dashed" } },
        }
      : {
          type: "category",
          data: labels,
          axisLabel: { color: "#6B7280" },
        },
    yAxis: horizontal
      ? {
          type: "category",
          data: labels,
          axisLabel: {
            color: "#374151",
            fontSize: 11,
            lineHeight: 14,
            overflow: "truncate",
            width: 190,
          },
        }
      : {
          type: "value",
          axisLabel: { color: "#6B7280", formatter: yFormatter },
          splitLine: { lineStyle: { color: palette.border, type: "dashed" } },
        },
    series: series.map((item) => ({
      ...item,
      type: "bar",
      itemStyle: {
        ...(item.itemStyle || {}),
        borderRadius: item.itemStyle?.borderRadius ?? (horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]),
      },
    })),
  };
}

export function pieOption(data) {
  return {
    color: [palette.navy, palette.blue, palette.yellow, palette.orange, palette.green],
    tooltip: { trigger: "item", formatter: "{b}: {c}% ({d}%)" },
    legend: { bottom: 0, left: "center" },
    series: [
      {
        type: "pie",
        radius: ["42%", "68%"],
        center: ["50%", "43%"],
        data,
        label: { formatter: "{b}\n{d}%" },
      },
    ],
  };
}
