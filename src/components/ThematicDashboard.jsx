import {
  Banknote,
  BriefcaseBusiness,
  GraduationCap,
  HeartPulse,
  Leaf,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EChartCard } from "./EChartCard.jsx";

const palette = {
  navy: "#000086",
  blue: "#007FFE",
  yellow: "#FCD418",
  orange: "#F2A116",
  green: "#71B434",
  border: "#DDE3EA",
  text: "#1F2937",
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

const themeIcons = {
  contasPublicas: Banknote,
  saude: HeartPulse,
  educacao: GraduationCap,
  economiaEmpregos: BriefcaseBusiness,
  meioAmbiente: Leaf,
};

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
      itemStyle: { borderRadius: horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0] },
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
      className={`group min-h-[128px] rounded-lg border p-4 text-left transition ${
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
          <p className={`mt-1 text-xs font-semibold ${active ? "text-blue-100" : "text-brand-gray"}`}>
            4 visualizações
          </p>
        </div>
      </div>
    </button>
  );
}

export function ThematicDashboard({ themes }) {
  const themeList = Object.values(themes);
  const [activeThemeId, setActiveThemeId] = useState("economiaEmpregos");
  const activeTheme = themes[activeThemeId];

  const cards = useMemo(() => {
    if (activeTheme.id === "contasPublicas") {
      return [
        {
          kind: "chart",
          title: "Receita x despesa",
          subtitle: "Valores mensais simulados em milhões de reais",
          option: lineOption({
            labels: activeTheme.revenueExpense.receita.map((row) => row.periodo),
            series: [
              { name: "Receita", data: activeTheme.revenueExpense.receita.map((row) => row.valor) },
              { name: "Despesa", data: activeTheme.revenueExpense.despesa.map((row) => row.valor) },
            ],
          }),
        },
        {
          kind: "chart",
          title: "Execução por área",
          subtitle: "Orçado e executado no exercício",
          option: barOption({
            labels: activeTheme.budgetExecution.map((row) => row.area),
            series: [
              { name: "Previsto", data: activeTheme.budgetExecution.map((row) => row.previsto) },
              { name: "Executado", data: activeTheme.budgetExecution.map((row) => row.executado) },
            ],
          }),
        },
        {
          kind: "chart",
          title: "Composição da despesa",
          subtitle: "Participação por grupo",
          option: pieOption(activeTheme.expenseComposition),
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

    return [
      {
        kind: "chart",
        title: "Saldo de empregos formais",
        subtitle: "MTE/CAGED, Tijucas e SC",
        option: barOption({
          labels: activeTheme.employment.map((row) => row.periodo),
          series: [
            { name: "Tijucas", type: "line", data: activeTheme.employment.map((row) => row.saldoTijucas) },
            { name: "SC", data: activeTheme.employment.map((row) => row.saldoSc) },
          ],
        }),
      },
      {
        kind: "chart",
        title: "Setores que mais movem emprego",
        subtitle: "Saldo acumulado por divisão econômica",
        option: barOption({
          labels: activeTheme.sectors.slice(0, 9).map((row) => row.setor),
          series: [{ name: "Saldo", data: activeTheme.sectors.slice(0, 9).map((row) => row.saldo) }],
          horizontal: true,
        }),
        height: 420,
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
  }, [activeTheme]);

  return (
    <section className="flex flex-col gap-5" aria-labelledby="themes-title">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="themes-title" className="text-xl font-extrabold text-brand-navy">
            Painéis por temática
          </h2>
          <p className="text-sm font-medium text-brand-gray">
            Escolha uma área e compare quatro leituras gerenciais no mesmo padrão visual.
          </p>
        </div>
        <span className="w-fit rounded border border-[#FCD418] bg-[#FCD418] px-3 py-1 text-xs font-extrabold text-[#000086]">
          azul predominante, paleta institucional
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {themeList.map((theme) => (
          <ThemeButton
            key={theme.id}
            theme={theme}
            active={theme.id === activeThemeId}
            onClick={() => setActiveThemeId(theme.id)}
          />
        ))}
      </div>

      <div className="rounded-lg border border-brand-border bg-white p-5">
        <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-brand-navy">{activeTheme.label}</h3>
            <p className="mt-1 max-w-4xl text-sm font-medium text-brand-gray">
              {activeTheme.summary}
            </p>
          </div>
          <span className="w-fit rounded border border-brand-border bg-brand-page px-3 py-1 text-xs font-bold text-brand-gray">
            {activeTheme.source}
          </span>
        </div>
        <KpiStrip items={activeTheme.kpis} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {cards.map((card) =>
          card.kind === "table" ? (
            <TableCard
              key={card.title}
              title={card.title}
              subtitle={card.subtitle}
              rows={card.rows}
            />
          ) : (
            <EChartCard
              key={card.title}
              title={card.title}
              subtitle={card.subtitle}
              height={card.height}
              option={card.option}
            />
          ),
        )}
      </div>
    </section>
  );
}
