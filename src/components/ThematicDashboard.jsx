import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  HardHat,
  HeartPulse,
  Leaf,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EChartCard } from "./EChartCard.jsx";
import { ObrasMapCard } from "./ObrasMapCard.jsx";
import { ObrasSeriesCharts } from "./ObrasSeriesCharts.jsx";
import { EducacaoPage } from "../features/educacao/EducacaoPage.jsx";
import { EconomiaPage } from "../features/economia/EconomiaPage.jsx";
import { ContasPublicasPage } from "../features/contas-publicas/ContasPublicasPage.jsx";

const palette = {
  navy: "#000086",
  blue: "#007FFE",
  yellow: "#FCD418",
  orange: "#F2A116",
  green: "#71B434",
  border: "#DDE3EA",
  text: "#1F2937",
};

const axisTheme = {
  economiaEmpregos: { primary: "#007FFE", secondary: "#EFF6FF" },
  populacao: { primary: "#8D2A8A", secondary: "#FFEFFE" },
  educacao: { primary: "#F2A116", secondary: "#FDE7C2" },
  saude: { primary: "#EC4137", secondary: "#FFEAE9" },
  meioAmbiente: { primary: "#71B434", secondary: "#E7F7DA" },
  contasPublicas: { primary: "#FCD418", secondary: "#FDF5C7" },
  construcaoCivil: { primary: "#000086", secondary: "#EBF4FF" },
};

const brInteger = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const brCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const compactNumber = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const decimalNumber = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

const themeIcons = {
  contasPublicas: Banknote,
  saude: HeartPulse,
  educacao: GraduationCap,
  economiaEmpregos: BriefcaseBusiness,
  meioAmbiente: Leaf,
  populacao: UsersRound,
  construcaoCivil: HardHat || Building2,
};

const axisNarratives = {
  economiaEmpregos:
    "A economia mostra a capacidade do municipio de gerar renda, manter empregos e sustentar a atividade produtiva. Este eixo ajuda a identificar setores em expansao, pressoes sociais e oportunidades para politicas de desenvolvimento local.",
  populacao:
    "A populacao orienta a escala dos servicos publicos e a demanda por equipamentos urbanos. Entender crescimento, domicilios e perfil etario apoia o planejamento de saude, educacao, mobilidade e habitacao.",
  educacao:
    "A educacao acompanha acesso, permanencia e aprendizagem na rede. O eixo e central para avaliar capacidade escolar, pressao por vagas e resultados que afetam o desenvolvimento de longo prazo.",
  saude:
    "A saude revela o uso da rede assistencial e os principais pontos de pressao operacional. Monitorar procedimentos, cobertura e linhas de cuidado apoia decisoes sobre oferta, equipes e prioridades de atendimento.",
  meioAmbiente:
    "O meio ambiente acompanha residuos, licenciamento, arborizacao e riscos urbanos. O eixo permite observar sustentabilidade, qualidade de vida e impactos do crescimento sobre o territorio.",
  contasPublicas:
    "Contas publicas mostram a capacidade de arrecadar, executar o orcamento e financiar entregas. Este eixo e essencial para avaliar sustentabilidade fiscal, investimentos e prioridades de gasto.",
  construcaoCivil:
    "A construcao civil indica dinamica urbana, investimento privado e pressao sobre infraestrutura. Alvaras, area licenciada e tipos de obra ajudam a antecipar demandas por servicos e ordenamento territorial.",
};
const THEME_SELECT_EVENT = "tijucas:select-theme";

function baseGrid(extra = {}) {
  return {
    left: 58,
    right: 36,
    top: 46,
    bottom: 42,
    ...extra,
  };
}

function lineOption({ labels, series, yFormatter = compactNumber.format }) {
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

function barOption({ labels, series, horizontal = false, yFormatter = compactNumber.format }) {
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

function pieOption(data) {
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

function treemapOption(data) {
  return {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const saldo = params.data?.saldo ?? params.value;
        return [
          `<strong>${params.name}</strong>`,
          `Saldo: ${saldo > 0 ? "+" : ""}${brInteger.format(saldo)}`,
        ].join("<br/>");
      },
    },
    series: [
      {
        type: "treemap",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        left: 0,
        right: 0,
        top: 8,
        bottom: 0,
        label: {
          show: true,
          formatter: (params) => {
            const saldo = params.data?.saldo ?? 0;
            return `${params.name}\n${saldo > 0 ? "+" : ""}${brInteger.format(saldo)}`;
          },
          color: "#FFFFFF",
          fontSize: 12,
          fontWeight: 700,
          overflow: "truncate",
        },
        itemStyle: {
          borderColor: "#FFFFFF",
          borderWidth: 3,
          gapWidth: 3,
        },
        data: data.map((row) => ({
          ...row,
          itemStyle: {
            color: row.saldo >= 0 ? palette.blue : palette.orange,
          },
        })),
      },
    ],
  };
}

function pibLineOption({ series, highlightedName = "Tijucas" }) {
  const labels = series[0]?.data.map((row) => String(row.ano)) ?? [];

  return {
    color: [
      palette.navy,
      palette.orange,
      palette.blue,
      palette.green,
      palette.yellow,
      "#8B5CF6",
      "#14B8A6",
      "#EF4444",
      "#64748B",
    ],
    tooltip: {
      trigger: "axis",
      formatter: (params) =>
        params
          .map((item) => {
            const value = item.value;
            return `${item.marker}${item.seriesName}: R$ ${decimalNumber.format(value)} bi`;
          })
          .join("<br/>"),
    },
    legend: {
      top: 0,
      left: 0,
      type: "scroll",
    },
    grid: baseGrid({ top: 72, left: 72, right: 30, bottom: 54 }),
    dataZoom: [{ type: "inside" }, { type: "slider", bottom: 12, height: 18 }],
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: "#6B7280" },
    },
    yAxis: {
      type: "log",
      name: "R$ bi",
      axisLabel: { color: "#6B7280", formatter: (value) => decimalNumber.format(value) },
      splitLine: { lineStyle: { color: palette.border, type: "dashed" } },
    },
    series: series.map((item) => ({
      name: item.name,
      type: "line",
      smooth: true,
      symbolSize: item.name === highlightedName ? 9 : item.scope === "Municipio" ? 7 : 4,
      lineStyle: {
        width: item.name === highlightedName ? 5 : item.scope === "SC" || item.scope === "Municipio" ? 4 : 2,
        opacity: item.name === highlightedName ? 1 : 0.62,
      },
      emphasis: { focus: "series" },
      data: item.data.map((row) => Math.round(row.pib / 100_000_000) / 10),
      markArea:
        item.name === series[0]?.name
          ? {
              silent: true,
              itemStyle: { color: "rgba(252, 212, 24, 0.12)" },
              label: { color: "#475569", fontWeight: 700 },
              data: [[{ name: "Projeção", xAxis: "2024" }, { xAxis: "2030" }]],
            }
          : undefined,
    })),
  };
}

function scatterOption(data) {
  const others = data.filter((row) => !row.isTijucas);
  const tijucas = data.filter((row) => row.isTijucas);
  const mapRows = (rows) =>
    rows.map((row) => ({
      name: row.municipio,
      value: [
        row.familiasBeneficiarias,
        row.saldoEmpregos,
        row.procedimentosAmbulatoriais,
        row.valorMedioBeneficio,
      ],
    }));

  return {
    color: ["#7C8DA1", palette.orange],
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const [familias, saldo, procedimentos, valorMedio] = params.value;
        return [
          `<strong>${params.name}</strong>`,
          `Famílias BF: ${brInteger.format(familias)}`,
          `Saldo empregos: ${brInteger.format(saldo)}`,
          `Procedimentos: ${brInteger.format(procedimentos)}`,
          `Benefício médio: ${brCurrency.format(valorMedio)}`,
        ].join("<br/>");
      },
    },
    legend: { top: 0, right: 0 },
    grid: baseGrid({ left: 78, bottom: 68 }),
    dataZoom: [{ type: "inside" }, { type: "slider", bottom: 18, height: 18 }],
    xAxis: {
      type: "value",
      name: "Famílias no BF",
      nameLocation: "middle",
      nameGap: 40,
      axisLabel: { color: "#6B7280", formatter: compactNumber.format },
      splitLine: { lineStyle: { color: palette.border, type: "dashed" } },
    },
    yAxis: {
      type: "value",
      name: "Saldo de empregos",
      axisLabel: { color: "#6B7280", formatter: compactNumber.format },
      splitLine: { lineStyle: { color: palette.border, type: "dashed" } },
    },
    series: [
      {
        name: "Municípios SC",
        type: "scatter",
        data: mapRows(others),
        symbolSize: (value) => Math.max(7, Math.sqrt(value[2]) / 8),
        itemStyle: { opacity: 0.58 },
      },
      {
        name: "Tijucas",
        type: "scatter",
        data: mapRows(tijucas),
        symbolSize: (value) => Math.max(18, Math.sqrt(value[2]) / 5),
        label: { show: true, formatter: "{b}", position: "right", fontWeight: 700 },
        itemStyle: { borderColor: palette.navy, borderWidth: 2 },
      },
    ],
  };
}

function axisWithDarkStyle(axis) {
  return {
    ...axis,
    axisLabel: { ...(axis.axisLabel || {}), color: "#DDE3EA" },
    axisLine: { ...(axis.axisLine || {}), lineStyle: { color: "rgba(255,255,255,0.24)" } },
    axisTick: { ...(axis.axisTick || {}), lineStyle: { color: "rgba(255,255,255,0.24)" } },
    nameTextStyle: { ...(axis.nameTextStyle || {}), color: "#DDE3EA", fontWeight: 700 },
    splitLine: {
      ...(axis.splitLine || {}),
      lineStyle: { color: "rgba(255,255,255,0.12)", type: "dashed" },
    },
  };
}

function withDarkChartTheme(option) {
  const mapAxis = (axis) =>
    Array.isArray(axis) ? axis.map(axisWithDarkStyle) : axisWithDarkStyle(axis || {});

  return {
    ...option,
    backgroundColor: "transparent",
    textStyle: { ...(option.textStyle || {}), color: "#FFFFFF" },
    tooltip: {
      ...(option.tooltip || {}),
      backgroundColor: "rgba(0,0,54,0.94)",
      borderColor: "rgba(255,255,255,0.18)",
      textStyle: { color: "#FFFFFF" },
    },
    legend: {
      ...(option.legend || {}),
      textStyle: { color: "#DDE3EA", fontWeight: 700 },
    },
    xAxis: option.xAxis ? mapAxis(option.xAxis) : option.xAxis,
    yAxis: option.yAxis ? mapAxis(option.yAxis) : option.yAxis,
    series: option.series?.map((serie) => ({
      ...serie,
      label: { ...(serie.label || {}), color: serie.label?.color || "#FFFFFF" },
    })),
  };
}

function ScopeToggle({ value, onChange }) {
  const buttons = [
    { id: "sc", label: "SC" },
    { id: "tijucas", label: "Tijucas" },
  ];

  return (
    <div className="inline-flex rounded-lg border border-brand-border bg-slate-100 p-1">
      {buttons.map((button) => (
        <button
          key={button.id}
          type="button"
          aria-pressed={value === button.id}
          onClick={() => onChange(button.id)}
          className={`min-w-[74px] rounded-md px-3 py-1.5 text-xs font-extrabold transition ${
            value === button.id
              ? "bg-brand-navy text-white shadow-sm"
              : "text-slate-700 hover:bg-white"
          }`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

function EconomyViewToggle({ value, onChange }) {
  const buttons = [
    { id: "employment", label: "Emprego" },
    { id: "pib", label: "PIB" },
  ];

  return (
    <div className="mt-5 inline-flex rounded-lg border border-white/20 bg-white/10 p-1">
      {buttons.map((button) => (
        <button
          key={button.id}
          type="button"
          aria-pressed={value === button.id}
          onClick={() => onChange(button.id)}
          className={`min-w-[96px] rounded-md px-3 py-2 text-sm font-extrabold transition ${
            value === button.id
              ? "bg-brand-yellow text-brand-navy"
              : "text-white hover:bg-white/10"
          }`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

function PibSeriesSelector({ series, selected, onToggle }) {
  const label =
    selected.length === 1
      ? selected[0]
      : `${selected.length} séries selecionadas`;

  return (
    <details className="relative">
      <summary className="flex min-h-9 min-w-[220px] cursor-pointer list-none items-center justify-between gap-3 rounded-md border border-brand-border bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-800 transition hover:bg-white">
        <span>{label}</span>
        <span className="text-brand-navy">▾</span>
      </summary>
      <div className="absolute right-0 z-20 mt-2 grid w-[300px] gap-1 rounded-lg border border-brand-border bg-white p-2 shadow-soft">
        {series.map((item) => {
          const active = selected.includes(item.name);

          return (
            <label
              key={item.name}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => onToggle(item.name)}
                className="h-4 w-4 rounded border-slate-300 accent-brand-navy"
              />
              <span>{item.name}</span>
            </label>
          );
        })}
      </div>
    </details>
  );
}

function formatPib(value) {
  if (Math.abs(value) >= 1_000_000_000) {
    return `R$ ${decimalNumber.format(value / 1_000_000_000)} bi`;
  }
  return `R$ ${brInteger.format(value / 1_000_000)} mi`;
}

function PibScopeToggle({ value, onChange }) {
  const buttons = [
    { id: "tijucas", label: "Tijucas" },
    { id: "sc", label: "SC" },
  ];

  return (
    <div className="inline-flex rounded-lg border border-brand-border bg-slate-100 p-1">
      {buttons.map((button) => (
        <button
          key={button.id}
          type="button"
          aria-pressed={value === button.id}
          onClick={() => onChange(button.id)}
          className={`min-w-[86px] rounded-md px-3 py-1.5 text-xs font-extrabold transition ${
            value === button.id
              ? "bg-brand-navy text-white shadow-sm"
              : "text-slate-700 hover:bg-white"
          }`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

function PibTableCard({ title, subtitle, rows }) {
  return (
    <article className="rounded-lg border border-white bg-white p-5 2xl:p-6">
      <div className="mb-5">
        <h3 className="text-base font-extrabold text-brand-navy">{title}</h3>
        <p className="text-xs font-semibold text-slate-700">{subtitle}</p>
      </div>
      <div className="max-h-[430px] overflow-auto rounded-lg border border-brand-border 2xl:max-h-[500px]">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-3 font-extrabold">Município</th>
              <th className="px-3 py-3 font-extrabold">Mesorregião</th>
              <th className="px-3 py-3 text-right font-extrabold">PIB 2023</th>
              <th className="px-3 py-3 text-right font-extrabold">Proj. 2024</th>
              <th className="px-3 py-3 text-right font-extrabold">Proj. 2025</th>
              <th className="px-3 py-3 text-right font-extrabold">Proj. 2030</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.codigo}
                className={`border-t border-brand-border ${
                  row.municipio === "Tijucas" ? "bg-blue-50" : "bg-white"
                }`}
              >
                <td className="px-3 py-2 font-bold text-brand-navy">{row.municipio}</td>
                <td className="px-3 py-2 font-semibold text-slate-600">{row.mesorregiao}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatPib(row.pibObservado)}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatPib(row.pib2024)}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatPib(row.pib2025)}</td>
                <td className="px-3 py-2 text-right font-extrabold text-brand-navy">{formatPib(row.pibProjetado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function buildPibView(pib, scope) {
  const tijucasSeries = pib.chartSeries.find((item) => item.name === "Tijucas");
  const scSeries = pib.chartSeries.find((item) => item.scope === "SC");
  const mesoregionSeries = pib.chartSeries.filter((item) => item.scope === "Mesorregiao");
  const tijucasRow = pib.municipalTable.find((row) => row.municipio === "Tijucas");
  const comparisonRows = pib.municipalTable
    .filter((row) => row.municipio !== "Tijucas")
    .slice(0, 9);
  const tijucasGrowth = tijucasRow
    ? ((tijucasRow.pibProjetado / tijucasRow.pibObservado - 1) * 100)
    : 0;

  if (scope === "sc") {
    return {
      summary: `Santa Catarina combina serie observada ate ${pib.metadata.observedYear} com projecoes ate ${pib.metadata.projectionYear}. O recorte estadual mostra o total de SC e a contribuicao das mesorregioes para contextualizar a posicao de Tijucas na economia catarinense.`,
      source: `Fonte: planilhas locais de PIB municipal e PIB das mesorregioes. Projecoes ate ${pib.metadata.projectionYear}.`,
      kpis: [
        pib.kpis[0],
        { label: "Mesorregioes", value: String(mesoregionSeries.length), note: "series comparadas" },
        { label: "PIB Tijucas", value: pib.kpis[1].value, note: "referencia local 2030" },
      ],
      series: [scSeries, ...mesoregionSeries].filter(Boolean),
      rows: pib.municipalTable.slice(0, 12),
      highlightedName: "Santa Catarina",
      chartTitle: "PIB observado e projetado - SC",
      chartSubtitle: `Estado e mesorregioes, 2002 a ${pib.metadata.projectionYear}`,
      tableTitle: "Maiores PIBs municipais de SC",
      tableSubtitle: `PIB observado ${pib.metadata.observedYear} e projecoes selecionadas`,
    };
  }

  return {
    summary: `Tijucas e o foco do recorte municipal. O PIB observado em ${pib.metadata.observedYear} foi de ${formatPib(tijucasRow?.pibObservado ?? 0)} e a projecao para ${pib.metadata.projectionYear} chega a ${formatPib(tijucasRow?.pibProjetado ?? 0)}, com ganho estimado de ${decimalNumber.format(tijucasGrowth)}% no periodo.`,
    source: `Fonte: planilhas locais de PIB municipal e PIB das mesorregioes. Projecoes ate ${pib.metadata.projectionYear}.`,
    kpis: [
      { label: "PIB Tijucas 2030", value: formatPib(tijucasRow?.pibProjetado ?? 0), note: "projecao" },
      { label: "Crescimento", value: `+${decimalNumber.format(tijucasGrowth)}%`, note: `${pib.metadata.observedYear} a ${pib.metadata.projectionYear}` },
      { label: "PIB observado", value: formatPib(tijucasRow?.pibObservado ?? 0), note: String(pib.metadata.observedYear) },
    ],
    series: [tijucasSeries, scSeries].filter(Boolean),
    rows: [tijucasRow, ...comparisonRows].filter(Boolean),
    highlightedName: "Tijucas",
    chartTitle: "PIB observado e projetado - Tijucas",
    chartSubtitle: `Tijucas em destaque, com SC como referencia, 2002 a ${pib.metadata.projectionYear}`,
    tableTitle: "Tijucas e comparaveis em SC",
    tableSubtitle: "Tijucas no topo; valores observados e projetados",
  };
}

function InfoCard({ title, subtitle, children }) {
  return (
    <article className="rounded-lg border border-white bg-white p-5 2xl:p-6">
      <div className="mb-4">
        <h3 className="text-base font-extrabold text-brand-navy">{title}</h3>
        <p className="text-xs font-semibold text-slate-700">{subtitle}</p>
      </div>
      <div className="rounded-lg border border-dashed border-brand-border bg-slate-50 p-5 text-sm font-semibold leading-6 text-slate-700">
        {children}
      </div>
    </article>
  );
}

function PublicFinanceModeToggle({ value, onChange }) {
  const buttons = [
    { id: "total", label: "Total" },
    { id: "perCapita", label: "Per capita" },
  ];

  return (
    <div className="inline-flex rounded-lg border border-brand-border bg-slate-100 p-1">
      {buttons.map((button) => (
        <button
          key={button.id}
          type="button"
          aria-pressed={value === button.id}
          onClick={() => onChange(button.id)}
          className={`min-w-[86px] rounded-md px-3 py-1.5 text-xs font-extrabold transition ${
            value === button.id
              ? "bg-brand-navy text-white shadow-sm"
              : "text-slate-700 hover:bg-white"
          }`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

function publicFinanceRevenueExpenseOption({ rows, mode }) {
  const divisor = mode === "perCapita" ? 1 : 1_000_000;
  const suffix = mode === "perCapita" ? "R$/hab" : "R$ mi";

  return barOption({
    labels: rows.map((row) => row.name),
    yFormatter: (value) => `${decimalNumber.format(value)} ${suffix}`,
    series: [
      {
        name: "Receita",
        data: rows.map((row) => (row.receita == null ? null : row.receita / divisor)),
      },
      {
        name: "Despesa",
        data: rows.map((row) => (row.despesa == null ? null : row.despesa / divisor)),
      },
    ],
  });
}

function publicFinanceFunctionsOption(rows) {
  return barOption({
    labels: rows.map((row) => row.funcao),
    yFormatter: (value) => `R$ ${decimalNumber.format(value / 1_000_000)} mi`,
    series: [
      {
        name: "Despesa empenhada",
        data: rows.map((row) => row.valor),
      },
    ],
    horizontal: true,
  });
}

function TableCard({ title, subtitle, rows }) {
  return (
    <article className="card p-6">
      <div className="mb-5">
        <h3 className="text-lg font-extrabold text-brand-navy">{title}</h3>
        <p className="text-sm font-medium text-brand-gray">{subtitle}</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-brand-border">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <tbody>
            {rows.map(([name, value, note]) => (
              <tr key={name} className="border-b border-brand-border last:border-b-0">
                <td className="px-4 py-3 font-bold text-brand-navy">{name}</td>
                <td className="px-4 py-3 text-right font-extrabold text-slate-900">{value}</td>
                <td className="px-4 py-3 text-right font-semibold text-brand-gray">{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function KpiStrip({ items }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-brand-border bg-white px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-normal text-brand-gray">{item.label}</p>
          <strong className="mt-1 block text-xl font-extrabold text-brand-navy">{item.value}</strong>
          <span className="text-xs font-semibold text-brand-green">{item.note}</span>
        </div>
      ))}
    </div>
  );
}

function ThemeButton({ theme, active, onClick }) {
  const Icon = themeIcons[theme.id];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group min-h-[148px] rounded-lg border p-5 text-left transition ${
        active
          ? "border-[#000086] bg-[#000086] text-white shadow-soft"
          : "border-brand-border bg-white text-brand-navy hover:border-[#007FFE] hover:shadow-soft"
      }`}
    >
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`grid h-11 w-11 place-items-center rounded-lg ${
              active ? "bg-[#FCD418] text-[#000086]" : "bg-blue-50 text-[#007FFE]"
            }`}
          >
            <Icon size={23} strokeWidth={2.2} />
          </span>
          <span
            className={`h-3 w-3 rounded-full ${
              active ? "bg-[#FCD418]" : "bg-[#71B434]"
            }`}
          />
        </div>
        <div>
          <strong className="block text-lg font-extrabold leading-tight">{theme.label}</strong>
        </div>
      </div>
    </button>
  );
}

function AxisThemeButton({ theme, active, onClick }) {
  const Icon = themeIcons[theme.id];
  const themeColors = axisTheme[theme.id] ?? axisTheme.economiaEmpregos;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="group min-h-[148px] rounded-lg border p-5 text-left text-brand-navy transition hover:shadow-soft"
      style={{
        borderColor: active ? themeColors.primary : palette.border,
        background: active
          ? `linear-gradient(180deg, ${themeColors.secondary} 0%, #FFFFFF 100%)`
          : "#FFFFFF",
        boxShadow: active ? `0 18px 40px ${themeColors.primary}22` : undefined,
      }}
    >
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <span
            className="grid h-11 w-11 place-items-center rounded-lg border"
            style={{
              backgroundColor: active ? themeColors.primary : themeColors.secondary,
              borderColor: `${themeColors.primary}33`,
              color: active ? "#FFFFFF" : themeColors.primary,
            }}
          >
            <Icon size={23} strokeWidth={2.2} />
          </span>
        </div>
        <div>
          <strong className="block text-lg font-extrabold leading-tight">{theme.label}</strong>
          <p
            className="mt-1 text-xs font-semibold"
            style={{ color: active ? themeColors.primary : "#6B7280" }}
          >
            Ver painel
          </p>
        </div>
      </div>
    </button>
  );
}

export function ThematicDashboard({ themes }) {
  const themeList = Object.values(themes);
  const [activeThemeId, setActiveThemeId] = useState("economiaEmpregos");
  const [employmentScope, setEmploymentScope] = useState("sc");
  const [economyView, setEconomyView] = useState("pib");
  const [pibScope, setPibScope] = useState("tijucas");
  const [publicFinanceMode, setPublicFinanceMode] = useState("total");
  const activeTheme = themes[activeThemeId];
  const isEconomyTheme = activeTheme.id === "economiaEmpregos";
  const activeEmploymentScope =
    isEconomyTheme && economyView === "employment"
      ? activeTheme.employmentScopes[employmentScope]
      : null;
  const activePib = isEconomyTheme && economyView === "pib" ? activeTheme.pib : null;
  const activePibView = activePib ? buildPibView(activePib, pibScope) : null;
  const activeFinance = activeTheme.id === "contasPublicas" ? activeTheme.finance : null;

  useEffect(() => {
    function handleThemeSelection(event) {
      const nextThemeId = event.detail?.themeId;
      if (nextThemeId && themes[nextThemeId]) {
        setActiveThemeId(nextThemeId);
      }
    }

    function syncThemeWithHash() {
      if (window.location.hash === "#educacao" && themes.educacao) {
        setActiveThemeId("educacao");
      }
    }

    syncThemeWithHash();
    window.addEventListener(THEME_SELECT_EVENT, handleThemeSelection);
    window.addEventListener("hashchange", syncThemeWithHash);

    return () => {
      window.removeEventListener(THEME_SELECT_EVENT, handleThemeSelection);
      window.removeEventListener("hashchange", syncThemeWithHash);
    };
  }, [themes]);

  const cards = useMemo(() => {
    if (activeTheme.id === "educacao") {
      return [];
    }

    if (activeTheme.id === "contasPublicas") {
      const finance = activeTheme.finance;

      if (!finance.available) {
        return [
          {
            kind: "info",
            title: "Receita x despesa de Tijucas",
            subtitle: "SICONFI 2025",
            content: (
              <>
                Não há registros de receitas ou despesas para Tijucas/SC no SICONFI 2025 fornecido.
                O código IBGE esperado é <strong>4218004</strong>; a população do Censo 2022 foi localizada.
              </>
            ),
          },
          {
            kind: "info",
            title: "Gastos por função",
            subtitle: "Despesas empenhadas por função",
            content: (
              <>
                Sem registros de despesas por função para Tijucas/SC. O único nome semelhante encontrado
                nos arquivos é <strong>Tijucas do Sul - PR</strong>, que não foi usado.
              </>
            ),
          },
        ];
      }

      return [
        {
          kind: "chart",
          title: "Receita x despesa de Tijucas",
          subtitle: publicFinanceMode === "perCapita" ? "Valores por habitante, Censo 2022" : "Valores anuais, SICONFI 2025",
          actions: (
            <PublicFinanceModeToggle
              value={publicFinanceMode}
              onChange={setPublicFinanceMode}
            />
          ),
          option: publicFinanceRevenueExpenseOption({
            rows:
              publicFinanceMode === "perCapita"
                ? finance.revenueExpensePerCapita
                : finance.revenueExpense,
            mode: publicFinanceMode,
          }),
          height: 430,
        },
        {
          kind: "chart",
          title: "Gastos por função em Tijucas",
          subtitle: "Despesas empenhadas, SICONFI 2025",
          option: publicFinanceFunctionsOption(finance.expenseFunctions),
          height: 430,
        },
        { kind: "table", title: "Principais receitas", subtitle: "Fontes selecionadas", rows: activeTheme.table },
      ];
    }

    if (activeTheme.id === "saude") {
      return [
        {
          kind: "chart",
          title: "Procedimentos ambulatoriais",
          subtitle: "DataSUS, Tijucas e SC",
          option: lineOption({
            labels: activeTheme.procedures.map((row) => row.periodo),
            series: [
              { name: "Tijucas", data: activeTheme.procedures.map((row) => row.procedimentosTijucas) },
              { name: "SC", data: activeTheme.procedures.map((row) => row.procedimentosSc) },
            ],
          }),
        },
        {
          kind: "chart",
          title: "Linhas de cuidado",
          subtitle: "Produção recente por tipo de atendimento",
          option: barOption({
            labels: activeTheme.careLines.map((row) => row.name),
            series: [{ name: "Procedimentos", data: activeTheme.careLines.map((row) => row.value) }],
            horizontal: true,
          }),
        },
        {
          kind: "chart",
          title: "Cobertura APS",
          subtitle: "Série simulada",
          option: lineOption({
            labels: activeTheme.coverage.map((row) => row.periodo),
            series: [{ name: "Cobertura", data: activeTheme.coverage.map((row) => row.valor) }],
            yFormatter: (value) => `${value}%`,
          }),
        },
        { kind: "table", title: "Pressões assistenciais", subtitle: "Atendimentos selecionados", rows: activeTheme.table },
      ];
    }

    if (activeTheme.id === "educacao") {
      return [
        {
          kind: "chart",
          title: "Matrículas na rede",
          subtitle: "Série mensal simulada",
          option: lineOption({
            labels: activeTheme.enrollment.map((row) => row.periodo),
            series: [{ name: "Matrículas", data: activeTheme.enrollment.map((row) => row.valor) }],
          }),
        },
        {
          kind: "chart",
          title: "Aprendizagem por etapa",
          subtitle: "Português e matemática",
          option: barOption({
            labels: activeTheme.learning.map((row) => row.etapa),
            series: [
              { name: "Português", data: activeTheme.learning.map((row) => row.portugues) },
              { name: "Matemática", data: activeTheme.learning.map((row) => row.matematica) },
            ],
          }),
        },
        {
          kind: "chart",
          title: "Frequência escolar",
          subtitle: "Média mensal simulada",
          option: lineOption({
            labels: activeTheme.attendance.map((row) => row.periodo),
            series: [{ name: "Frequência", data: activeTheme.attendance.map((row) => row.valor) }],
            yFormatter: (value) => `${value}%`,
          }),
        },
        { kind: "table", title: "Matrículas por etapa", subtitle: "Distribuição estimada", rows: activeTheme.table },
      ];
    }

    if (activeTheme.id === "populacao") {
      return [
        {
          kind: "chart",
          title: "População estimada",
          subtitle: "Série mensal simulada",
          option: lineOption({
            labels: activeTheme.population.map((row) => row.periodo),
            series: [{ name: "População", data: activeTheme.population.map((row) => row.valor) }],
          }),
        },
        {
          kind: "chart",
          title: "Composição etária",
          subtitle: "Distribuição percentual simulada",
          option: pieOption(activeTheme.ageGroups),
        },
        {
          kind: "chart",
          title: "Domicílios",
          subtitle: "Série mensal simulada",
          option: lineOption({
            labels: activeTheme.households.map((row) => row.periodo),
            series: [{ name: "Domicílios", data: activeTheme.households.map((row) => row.valor) }],
          }),
        },
        { kind: "table", title: "Resumo populacional", subtitle: "Indicadores selecionados", rows: activeTheme.table },
      ];
    }

    if (activeTheme.id === "meioAmbiente") {
      return [
        {
          kind: "chart",
          title: "Coleta seletiva",
          subtitle: "Toneladas mensais simuladas",
          option: lineOption({
            labels: activeTheme.waste.map((row) => row.periodo),
            series: [{ name: "Toneladas", data: activeTheme.waste.map((row) => row.valor) }],
          }),
        },
        {
          kind: "chart",
          title: "Licenciamento ambiental",
          subtitle: "Processos por tipo",
          option: pieOption(activeTheme.licensing),
        },
        {
          kind: "chart",
          title: "Arborização urbana",
          subtitle: "Mudas plantadas no ano",
          option: barOption({
            labels: activeTheme.treePlanting.map((row) => row.periodo),
            series: [{ name: "Mudas", data: activeTheme.treePlanting.map((row) => row.valor) }],
          }),
        },
        { kind: "table", title: "Ocorrências ambientais", subtitle: "Resumo operacional", rows: activeTheme.table },
      ];
    }

    if (activeTheme.id === "construcaoCivil") {
      return [
        {
          kind: "map",
          title: "Obras geolocalizadas em Tijucas",
          subtitle: "Setores censitários com obras ativas (CNO)",
        },
        { kind: "obrasSeries" },
      ];
    }

    if (activePibView) {
      return [
        {
          kind: "chart",
          title: activePibView.chartTitle,
          subtitle: activePibView.chartSubtitle,
          actions: (
            <PibScopeToggle
              value={pibScope}
              onChange={setPibScope}
            />
          ),
          option: pibLineOption({
            series: activePibView.series,
            highlightedName: activePibView.highlightedName,
          }),
          height: 430,
        },
        {
          kind: "pibTable",
          title: activePibView.tableTitle,
          subtitle: activePibView.tableSubtitle,
          rows: activePibView.rows,
        },
      ];
    }

    const scope = activeEmploymentScope;
    const scopeToggle = (
      <ScopeToggle value={employmentScope} onChange={setEmploymentScope} />
    );

    return [
      {
        kind: "chart",
        title: `Saldo de empregos formais - ${scope.fullLabel}`,
        subtitle: `Últimos 12 meses, ${activeTheme.employmentPeriod}`,
        actions: scopeToggle,
        option: barOption({
          labels: scope.monthly.map((row) => row.periodo),
          series: [
            {
              name: scope.label,
              data: scope.monthly.map((row) => row.saldo),
              itemStyle: {
                borderRadius: [6, 6, 0, 0],
                color: (params) => (params.value >= 0 ? palette.blue : palette.orange),
              },
            },
          ],
        }),
        height: 430,
      },
      {
        kind: "chart",
        title: `Saldo de empregos por CNAE - ${scope.fullLabel}`,
        subtitle: `Saldo acumulado, ${activeTheme.employmentPeriod}`,
        actions: scopeToggle,
        option: treemapOption(scope.sectors),
        height: 430,
      },
      {
        kind: "chart",
        title: "Bolsa Família e renda",
        subtitle: "Famílias e repasse mensal em Tijucas",
        option: lineOption({
          labels: activeTheme.bolsaFamilia.map((row) => row.periodo),
          series: [
            { name: "Famílias", data: activeTheme.bolsaFamilia.map((row) => row.familiasTijucas) },
            { name: "Repasse", data: activeTheme.bolsaFamilia.map((row) => row.valorTijucas) },
          ],
        }),
      },
      {
        kind: "chart",
        title: "Matriz municipal",
        subtitle: "Vulnerabilidade, emprego e saúde",
        height: 360,
        option: scatterOption(activeTheme.scatter),
      },
    ];
  }, [activeEmploymentScope, activePibView, activeTheme, employmentScope, pibScope, publicFinanceMode]);

  const visibleCards =
    activeTheme.id === "construcaoCivil" ? cards : cards.slice(0, 2);
  const narrative =
    activePibView?.summary ?? activeEmploymentScope?.summary ?? activeFinance?.summary ?? axisNarratives[activeTheme.id] ?? activeTheme.summary;
  const kpis = activePibView?.kpis ?? activeEmploymentScope?.kpis ?? activeTheme.kpis;
  const supportingText = activePibView
    ? activePibView.source
    : activeFinance
      ? `Fonte: SICONFI 2025 e IBGE Censo 2022. Código IBGE esperado: ${activeFinance.cdIbge}.`
    : activeEmploymentScope
      ? `Fonte: MTE/CAGED. Recorte exibido: ${activeTheme.employmentPeriod}.`
      : activeTheme.summary;

  return (
    <section id="indicadores" className="flex flex-col gap-5" aria-labelledby="themes-title">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="themes-title" className="text-xl font-extrabold text-brand-navy">
            Painéis temáticos
          </h2>
          <p className="text-sm font-medium text-brand-gray">
            Escolha uma área para visualizar.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        {themeList.map((theme) => (
          <AxisThemeButton
            key={theme.id}
            theme={theme}
            active={theme.id === activeThemeId}
            onClick={() => setActiveThemeId(theme.id)}
          />
        ))}
      </div>

      {activeTheme.id === "economiaEmpregos" ? (
        <div className="rounded-[32px] shadow-soft">
          <EconomiaPage theme={activeTheme} />
        </div>
      ) : activeTheme.id === "educacao" ? (
        <div className="rounded-[32px] shadow-soft">
          <EducacaoPage />
        </div>
      ) : activeTheme.id === "contasPublicas" ? (
        <div className="rounded-[32px] shadow-soft">
          <ContasPublicasPage />
        </div>
      ) : (
        <div className="rounded-lg bg-brand-navy p-5 text-white shadow-soft md:p-6 2xl:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(340px,0.82fr)_minmax(0,2.55fr)] 2xl:gap-8">
            <aside className="flex flex-col gap-4 xl:self-start">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-normal text-brand-yellow">
                  Eixo selecionado
                </span>
                <h3 className="mt-3 text-3xl font-extrabold leading-tight text-white 2xl:text-4xl">
                  {activeTheme.label}
                </h3>
                {isEconomyTheme ? (
                  <EconomyViewToggle value={economyView} onChange={setEconomyView} />
                ) : null}
                <p className="mt-5 text-base font-semibold leading-7 text-white xl:text-[15px] xl:leading-7 2xl:text-base">
                  {narrative}
                </p>
                <p className="mt-4 text-sm font-medium leading-6 text-blue-50">
                  {supportingText}
                </p>
              </div>

              <div className="grid gap-3">
                {kpis.slice(0, 3).map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-white bg-white px-5 py-4 2xl:px-6 2xl:py-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-normal text-slate-700">
                      {item.label}
                    </p>
                    <strong className="mt-2 block text-2xl font-extrabold text-brand-navy 2xl:text-3xl">
                      {item.value}
                    </strong>
                    <span className="text-xs font-semibold text-slate-700">{item.note}</span>
                  </div>
                ))}
              </div>
            </aside>

            <div className="grid gap-6 lg:grid-cols-2 2xl:gap-8">
              {visibleCards.map((card) =>
                card.kind === "map" ? (
                  <ObrasMapCard
                    key={card.title}
                    title={card.title}
                    subtitle={card.subtitle}
                    height={520}
                    className="lg:col-span-2"
                  />
                ) : card.kind === "obrasSeries" ? (
                  <ObrasSeriesCharts key="obras-series" className="lg:col-span-2" />
                ) : card.kind === "pibTable" ? (
                  <PibTableCard
                    key={card.title}
                    title={card.title}
                    subtitle={card.subtitle}
                    rows={card.rows}
                  />
                ) : card.kind === "info" ? (
                  <InfoCard key={card.title} title={card.title} subtitle={card.subtitle}>
                    {card.content}
                  </InfoCard>
                ) : (
                  <EChartCard
                    key={card.title}
                    title={card.title}
                    subtitle={card.subtitle}
                    height={card.height ?? 560}
                    option={card.option}
                    variant="dark"
                    actions={card.actions}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
