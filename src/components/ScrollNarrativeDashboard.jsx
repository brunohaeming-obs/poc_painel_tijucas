"use client";

import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  Compass,
  GraduationCap,
  HeartPulse,
  Leaf,
  UsersRound,
} from "lucide-react";
import { useEffect } from "react";
import { EChartCard } from "./EChartCard.jsx";

const palette = {
  navy: "#000086",
  blue: "#2FA6FF",
  deepBlue: "#007FFE",
  yellow: "#FCD418",
  orange: "#F2A116",
  green: "#71B434",
  mint: "#72D1B4",
  line: "rgba(221,227,234,0.18)",
  text: "#EAF4FF",
};

const compactNumber = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const brInteger = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

const iconByTheme = {
  economiaEmpregos: BriefcaseBusiness,
  populacao: UsersRound,
  educacao: GraduationCap,
  saude: HeartPulse,
  meioAmbiente: Leaf,
  contasPublicas: Banknote,
  construcaoCivil: Building2,
};

function darkGrid(extra = {}) {
  return {
    left: 58,
    right: 28,
    top: 50,
    bottom: 42,
    ...extra,
  };
}

function darkLineOption({ labels, series, yFormatter = compactNumber.format }) {
  return {
    color: [palette.blue, palette.yellow, palette.green, palette.orange],
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(5,18,32,0.94)",
      borderColor: "rgba(255,255,255,0.14)",
      textStyle: { color: "#fff" },
    },
    legend: { top: 0, right: 0, textStyle: { color: "#DCEBFF", fontWeight: 700 } },
    grid: darkGrid(),
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: "#AFC7DD" },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.18)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#AFC7DD", formatter: yFormatter },
      splitLine: { lineStyle: { color: palette.line, type: "dashed" } },
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

function darkBarOption({ labels, series, horizontal = false }) {
  return {
    color: [palette.blue, palette.yellow, palette.green, palette.orange],
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(5,18,32,0.94)",
      borderColor: "rgba(255,255,255,0.14)",
      textStyle: { color: "#fff" },
    },
    legend: { top: 0, right: 0, textStyle: { color: "#DCEBFF", fontWeight: 700 } },
    grid: darkGrid(horizontal ? { left: 190, right: 24, bottom: 32 } : {}),
    xAxis: horizontal
      ? {
          type: "value",
          axisLabel: { color: "#AFC7DD", formatter: compactNumber.format },
          splitLine: { lineStyle: { color: palette.line, type: "dashed" } },
        }
      : {
          type: "category",
          data: labels,
          axisLabel: { color: "#AFC7DD" },
          axisLine: { lineStyle: { color: "rgba(255,255,255,0.18)" } },
        },
    yAxis: horizontal
      ? {
          type: "category",
          data: labels,
          axisLabel: { color: "#DCEBFF", fontSize: 11, overflow: "truncate", width: 168 },
        }
      : {
          type: "value",
          axisLabel: { color: "#AFC7DD", formatter: compactNumber.format },
          splitLine: { lineStyle: { color: palette.line, type: "dashed" } },
        },
    series: series.map((item) => ({
      ...item,
      type: "bar",
      itemStyle: {
        ...(item.itemStyle || {}),
        borderRadius: horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0],
      },
    })),
  };
}

function darkTreemapOption(data) {
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(5,18,32,0.94)",
      borderColor: "rgba(255,255,255,0.14)",
      textStyle: { color: "#fff" },
      formatter: (params) => {
        const saldo = params.data?.saldo ?? params.value;
        return `${params.name}<br/>Saldo: ${saldo > 0 ? "+" : ""}${brInteger.format(saldo)}`;
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
          color: "#fff",
          fontSize: 12,
          fontWeight: 800,
          formatter: (params) => {
            const saldo = params.data?.saldo ?? 0;
            return `${params.name}\n${saldo > 0 ? "+" : ""}${brInteger.format(saldo)}`;
          },
        },
        itemStyle: { borderColor: "#10293c", borderWidth: 3, gapWidth: 3 },
        data: data.map((row) => ({
          ...row,
          itemStyle: { color: row.saldo >= 0 ? palette.deepBlue : palette.orange },
        })),
      },
    ],
  };
}

function darkPieOption(data) {
  return {
    color: [palette.blue, palette.yellow, palette.green, palette.orange, palette.mint, "#8B5CF6"],
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(5,18,32,0.94)",
      borderColor: "rgba(255,255,255,0.14)",
      textStyle: { color: "#fff" },
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      bottom: 0,
      left: "center",
      textStyle: { color: "#DCEBFF", fontWeight: 700 },
    },
    series: [
      {
        type: "pie",
        radius: ["42%", "68%"],
        center: ["50%", "43%"],
        data,
        label: { color: "#fff", formatter: "{b}\n{d}%", fontWeight: 700 },
      },
    ],
  };
}

function sectionChart(theme) {
  if (theme.id === "economiaEmpregos") {
    const tijucas = theme.employmentScopes.tijucas;
    return {
      title: "Empregos formais e setores",
      subtitle: "Tijucas, últimos 12 meses",
      option: darkLineOption({
        labels: tijucas.monthly.map((row) => row.periodo),
        series: [{ name: "Saldo", type: "bar", data: tijucas.monthly.map((row) => row.saldo) }],
      }),
      secondary: darkTreemapOption(tijucas.sectors.slice(0, 12)),
    };
  }

  if (theme.id === "saude") {
    return {
      title: "Procedimentos ambulatoriais",
      subtitle: "Tijucas e Santa Catarina",
      option: darkLineOption({
        labels: theme.procedures.map((row) => row.periodo),
        series: [
          { name: "Tijucas", data: theme.procedures.map((row) => row.procedimentosTijucas) },
          { name: "SC", data: theme.procedures.map((row) => row.procedimentosSc) },
        ],
      }),
      secondaryTitle: "Linhas de cuidado",
      secondarySubtitle: "Produção recente por tipo de atendimento",
      secondary: darkBarOption({
        labels: theme.careLines.map((row) => row.name),
        series: [{ name: "Procedimentos", data: theme.careLines.map((row) => row.value) }],
        horizontal: true,
      }),
    };
  }

  if (theme.id === "populacao") {
    return {
      title: "População estimada",
      subtitle: "Série de planejamento",
      option: darkLineOption({
        labels: theme.population.map((row) => row.periodo),
        series: [{ name: "População", data: theme.population.map((row) => row.valor) }],
      }),
      secondaryTitle: "Composição etária",
      secondarySubtitle: "Distribuição percentual",
      secondary: darkPieOption(theme.ageGroups),
    };
  }

  if (theme.id === "educacao") {
    return {
      title: "Matrículas e aprendizagem",
      subtitle: "Indicadores da rede",
      option: darkBarOption({
        labels: theme.learning.map((row) => row.etapa),
        series: [
          { name: "Português", data: theme.learning.map((row) => row.portugues) },
          { name: "Matemática", data: theme.learning.map((row) => row.matematica) },
        ],
      }),
      secondaryTitle: "Frequência escolar",
      secondarySubtitle: "Média mensal",
      secondary: darkLineOption({
        labels: theme.attendance.map((row) => row.periodo),
        series: [{ name: "Frequência", data: theme.attendance.map((row) => row.valor) }],
        yFormatter: (value) => `${value}%`,
      }),
    };
  }

  if (theme.id === "meioAmbiente") {
    return {
      title: "Coleta seletiva",
      subtitle: "Toneladas mensais",
      option: darkLineOption({
        labels: theme.waste.map((row) => row.periodo),
        series: [{ name: "Toneladas", type: "bar", data: theme.waste.map((row) => row.valor) }],
      }),
      secondaryTitle: "Licenciamento ambiental",
      secondarySubtitle: "Processos por tipo",
      secondary: darkPieOption(theme.licensing),
    };
  }

  if (theme.id === "contasPublicas") {
    const available = theme.finance?.available;
    return {
      title: available ? "Receita x despesa" : "SICONFI 2025",
      subtitle: available ? "Valores de Tijucas" : "Dados fiscais municipais",
      option: darkBarOption({
        labels: available ? theme.finance.revenueExpense.map((row) => row.name) : ["População", "SICONFI", "Código"],
        series: [
          {
            name: available ? "Valor" : "Status",
            data: available
              ? theme.finance.revenueExpense.map((row) => row.receita ?? row.despesa ?? 0)
              : [theme.finance.populacaoCenso, 0, 4218004],
          },
        ],
      }),
      secondaryTitle: available ? "Gastos por função" : "Cobertura SICONFI",
      secondarySubtitle: available ? "Despesas empenhadas" : "Disponibilidade dos registros",
      secondary: darkBarOption({
        labels: available
          ? theme.finance.expenseFunctions.map((row) => row.funcao)
          : ["Tijucas/SC", "Tijucas do Sul/PR"],
        series: [
          {
            name: available ? "Valor" : "Registro",
            data: available ? theme.finance.expenseFunctions.map((row) => row.valor) : [0, 1],
          },
        ],
        horizontal: true,
      }),
    };
  }

  return {
    title: "Construção civil",
    subtitle: "Alvarás emitidos",
    option: darkBarOption({
      labels: theme.permits.map((row) => row.periodo),
      series: [{ name: "Alvarás", data: theme.permits.map((row) => row.valor) }],
    }),
    secondaryTitle: "Área licenciada",
    secondarySubtitle: "Mil m² por mês",
    secondary: darkLineOption({
      labels: theme.areaLicensed.map((row) => row.periodo),
      series: [{ name: "Área licenciada", data: theme.areaLicensed.map((row) => row.valor) }],
    }),
  };
}

function AxisSection({ theme, index }) {
  const Icon = iconByTheme[theme.id] ?? Compass;
  const chart = sectionChart(theme);

  return (
    <section
      id={theme.id}
      className="reveal grid min-h-screen items-start gap-8 py-20 lg:grid-cols-[0.86fr_1.14fr] lg:py-28"
    >
      <div className="max-w-xl">
        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-brand-yellow">
          <Icon size={18} />
          Eixo {String(index + 1).padStart(2, "0")}
        </div>
        <h2 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
          {theme.label}
        </h2>
        <p className="mt-6 text-lg font-semibold leading-8 text-sky-50/90">
          {theme.summary}
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {theme.kpis.slice(0, 3).map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs font-extrabold uppercase text-sky-100/70">{kpi.label}</p>
              <strong className="mt-2 block text-2xl font-extrabold text-white">{kpi.value}</strong>
              <span className="text-xs font-bold text-sky-100/70">{kpi.note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5">
        <EChartCard
          title={chart.title}
          subtitle={chart.subtitle}
          height={420}
          option={chart.option}
          variant="midnight"
        />
        {chart.secondary ? (
          <EChartCard
            title={chart.secondaryTitle ?? "Indicador complementar"}
            subtitle={chart.secondarySubtitle ?? "Série selecionada"}
            height={320}
            option={chart.secondary}
            variant="midnight"
          />
        ) : null}
      </div>
    </section>
  );
}

export function ScrollNarrativeDashboard({ themes }) {
  const themeList = Object.values(themes);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("reveal-visible");
        });
      },
      { threshold: 0.18 },
    );

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#081d2d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,127,254,0.20),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(252,212,24,0.10),transparent_26%)]" />
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-[#081d2d]/82 backdrop-blur">
        <div className="relative mx-auto flex min-h-[104px] max-w-[1500px] items-center justify-center px-6 py-5 md:px-10">
          <a href="#inicio" className="flex items-center gap-5 text-center text-xl font-extrabold md:gap-8 md:text-2xl">
            <img
              src="/assets/brasao-tijucas.png"
              alt="Brasão de Tijucas"
              className="h-14 w-14 object-contain md:h-16 md:w-16"
            />
            <span>Observatório Municipal de Tijucas</span>
            <img
              src="/assets/logo-turismo-tijucas-2.png"
              alt="Turismo Tijucas"
              className="hidden max-h-16 w-[min(24vw,220px)] object-contain md:block"
            />
          </a>
        </div>
      </header>

      <section id="inicio" className="relative mx-auto flex min-h-screen max-w-[1500px] items-center px-6 pt-36 md:px-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal max-w-3xl">
            <span className="text-sm font-extrabold uppercase tracking-[0.24em] text-brand-yellow">
              Tijucas em dados
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] text-white md:text-7xl">
              Conheça Tijucas pelos dados.
              <span className="block text-sky-100">Descubra a cidade que você ainda não viu.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-sky-50/82">
              Uma experiência interativa para explorar indicadores, territórios e histórias que
              revelam novas formas de olhar para o município.
            </p>
          </div>

          <div className="reveal grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {themeList.map((theme) => {
              const Icon = iconByTheme[theme.id] ?? Compass;
              return (
                <a
                  key={theme.id}
                  href={`#${theme.id}`}
                  className="group min-h-[150px] rounded-lg border border-white/10 bg-[#10293c]/88 p-5 transition hover:border-brand-blue hover:bg-[#143550]"
                >
                  <Icon size={34} className="text-brand-yellow transition group-hover:text-brand-blue" />
                  <strong className="mt-7 block text-xl font-extrabold">{theme.label}</strong>
                  <span className="mt-2 block text-xs font-bold text-sky-100/65">{theme.source}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-[1500px] px-6 md:px-10">
        {themeList.map((theme, index) => (
          <AxisSection key={theme.id} theme={theme} index={index} />
        ))}
      </div>
    </main>
  );
}
