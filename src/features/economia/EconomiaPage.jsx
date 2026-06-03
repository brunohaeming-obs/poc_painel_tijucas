import { BarChart3, BriefcaseBusiness, LineChart as LineChartIcon, MapPinned, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import { EducacaoChartCard } from "../educacao/components/EducacaoChartCard.jsx";
import { EducacaoChartNarrativeRow } from "../educacao/components/EducacaoChartNarrativeRow.jsx";
import { EducacaoNarrativeText } from "../educacao/components/EducacaoNarrativeText.jsx";
import { EducacaoSectionHeader } from "../educacao/components/EducacaoSectionHeader.jsx";

const numberFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

const chartColors = {
  tijucas: "#FCD418",
  sc: "#38BDF8",
  meso: "#71B434",
  positive: "#71B434",
  negative: "#F2A116",
  grid: "rgba(255,255,255,0.12)",
  text: "#CBD5E1",
};

function formatPib(value) {
  if (Math.abs(value) >= 1_000_000_000) {
    return `R$ ${compactCurrencyFormatter.format(value / 1_000_000_000)} bi`;
  }

  return `R$ ${numberFormatter.format(value / 1_000_000)} mi`;
}

function asBillions(value) {
  return Math.round(value / 100_000_000) / 10;
}

function getSeriesValue(series, year) {
  return series?.data.find((row) => row.ano === year)?.pib ?? 0;
}

function calculateCagr(startValue, endValue, years) {
  if (!startValue || !endValue || !years) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

function buildPibModel(pib) {
  const tijucas = pib.chartSeries.find((item) => item.name === "Tijucas");
  const sc = pib.chartSeries.find((item) => item.scope === "SC");
  const meso =
    pib.chartSeries.find((item) => item.name === "Grande Florianópolis") ??
    pib.chartSeries.find((item) => item.scope === "Mesorregiao");
  const tijucasRow = pib.municipalTable.find((row) => row.municipio === "Tijucas");
  const observedYear = pib.metadata.observedYear;
  const projectionYear = pib.metadata.projectionYear;
  const cagr2025To2030 = calculateCagr(
    getSeriesValue(tijucas, 2025),
    getSeriesValue(tijucas, 2030),
    5,
  );
  const mesoShare2030 =
    getSeriesValue(meso, projectionYear) > 0
      ? (getSeriesValue(tijucas, projectionYear) / getSeriesValue(meso, projectionYear)) * 100
      : 0;
  const scShare2030 =
    getSeriesValue(sc, projectionYear) > 0
      ? (getSeriesValue(tijucas, projectionYear) / getSeriesValue(sc, projectionYear)) * 100
      : 0;

  const lineData =
    tijucas?.data.map((row) => ({
      ano: row.ano,
      Tijucas: asBillions(row.pib),
      "Santa Catarina": asBillions(getSeriesValue(sc, row.ano)),
      [meso?.name ?? "Mesorregiao"]: asBillions(getSeriesValue(meso, row.ano)),
    })) ?? [];

  return {
    tijucas,
    sc,
    meso,
    tijucasRow,
    observedYear,
    projectionYear,
    cagr2025To2030,
    mesoShare2030,
    scShare2030,
    lineData,
    kpis: [
      {
        label: "PIB Tijucas 2030",
        value: formatPib(tijucasRow?.pibProjetado ?? 0),
        note: "projecao",
      },
      {
        label: "CAGR 2025-2030",
        value: `${decimalFormatter.format(cagr2025To2030)}%`,
        note: "crescimento medio anual",
      },
      {
        label: "Peso na mesorregiao",
        value: `${decimalFormatter.format(mesoShare2030)}%`,
        note: `${meso?.name ?? "mesorregiao"} em 2030`,
      },
      {
        label: "Peso em SC",
        value: `${decimalFormatter.format(scShare2030)}%`,
        note: "PIB projetado em 2030",
      },
    ],
  };
}

function buildEmploymentModel(employment) {
  const tijucas = employment.scopes.tijucas;
  const sc = employment.scopes.sc;
  const monthlyData = tijucas.monthly.map((row, index) => ({
    periodo: row.periodo,
    Tijucas: row.saldo,
    "Santa Catarina": sc.monthly[index]?.saldo ?? 0,
  }));
  const topSectors = [...tijucas.sectors]
    .sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo))
    .slice(0, 5);

  return {
    tijucas,
    sc,
    monthlyData,
    topSectors,
    kpis: [
      {
        label: "Saldo mensal",
        value: `${tijucas.monthlyBalance > 0 ? "+" : ""}${numberFormatter.format(tijucas.monthlyBalance)}`,
        note: `${tijucas.latestMonth} em Tijucas`,
      },
      {
        label: "Acumulado 12 meses",
        value: `${tijucas.annualBalance > 0 ? "+" : ""}${numberFormatter.format(tijucas.annualBalance)}`,
        note: "empregos formais",
      },
      {
        label: "Setor lider",
        value: topSectors[0]?.name ?? "-",
        note: `${topSectors[0]?.saldo > 0 ? "+" : ""}${numberFormatter.format(topSectors[0]?.saldo ?? 0)} vagas`,
      },
    ],
  };
}

function ScopeToggle({ value, onChange }) {
  const buttons = [
    { id: "tijucas", label: "Tijucas" },
    { id: "sc", label: "SC" },
  ];

  return (
    <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
      {buttons.map((button) => (
        <button
          key={button.id}
          type="button"
          aria-pressed={value === button.id}
          onClick={() => onChange(button.id)}
          className={`min-w-[92px] rounded-xl px-4 py-2 text-sm font-extrabold transition ${
            value === button.id
              ? "bg-brand-yellow text-brand-navy"
              : "text-slate-200 hover:bg-white/10"
          }`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label, suffix = "" }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#071845] px-4 py-3 text-sm text-white shadow-lg">
      <strong>{label}</strong>
      <div className="mt-2 grid gap-1">
        {payload.map((item) => (
          <p key={item.dataKey} className="text-slate-200">
            <span style={{ color: item.color }}>{item.name}: </span>
            {decimalFormatter.format(item.value)}
            {suffix}
          </p>
        ))}
      </div>
    </div>
  );
}

function EconomiaKpiGrid({ items }) {
  return (
    <div className="grid h-full gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.label}
          className="educacao-surface educacao-kpi-card flex h-full min-h-[214px] flex-col justify-between rounded-[24px] p-6"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              {item.label}
            </p>
            <strong className="mt-4 block text-[1.9rem] font-extrabold leading-none tracking-tight text-white">
              {item.value}
            </strong>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-300">{item.note}</p>
        </article>
      ))}
    </div>
  );
}

function PibLineChart({ data, mesoName }) {
  return (
    <div className="h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 4" />
          <XAxis dataKey="ano" tick={{ fill: chartColors.text, fontSize: 12 }} />
          <YAxis
            scale="log"
            domain={["auto", "auto"]}
            tick={{ fill: chartColors.text, fontSize: 12 }}
            tickFormatter={(value) => `${decimalFormatter.format(value)} bi`}
          />
          <Tooltip content={<ChartTooltip suffix=" bi" />} />
          <Legend wrapperStyle={{ color: chartColors.text }} />
          <ReferenceArea x1={2024} x2={2030} fill="rgba(252,212,24,0.08)" />
          <Line
            type="monotone"
            dataKey="Tijucas"
            stroke={chartColors.tijucas}
            strokeWidth={5}
            dot={{ r: 3 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey={mesoName}
            stroke={chartColors.meso}
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Santa Catarina"
            stroke={chartColors.sc}
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmploymentBarChart({ data, scope }) {
  return (
    <div className="h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 4" />
          <XAxis dataKey="periodo" tick={{ fill: chartColors.text, fontSize: 12 }} />
          <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} tickFormatter={numberFormatter.format} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey={scope === "tijucas" ? "Tijucas" : "Santa Catarina"} radius={[8, 8, 0, 0]}>
            {data.map((row) => {
              const value = row[scope === "tijucas" ? "Tijucas" : "Santa Catarina"];
              return <Cell key={row.periodo} fill={value >= 0 ? chartColors.positive : chartColors.negative} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SectorRanking({ sectors }) {
  return (
    <div className="grid gap-3">
      {sectors.map((sector, index) => (
        <div
          key={sector.name}
          className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 md:grid-cols-[42px_minmax(0,1fr)_auto] md:items-center"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-sm font-extrabold text-white">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-white">{sector.name}</p>
            <p className="text-xs font-semibold text-slate-400">Saldo no recorte disponivel</p>
          </div>
          <strong className={sector.saldo >= 0 ? "text-brand-yellow" : "text-orange-300"}>
            {sector.saldo > 0 ? "+" : ""}
            {numberFormatter.format(sector.saldo)}
          </strong>
        </div>
      ))}
    </div>
  );
}

export function EconomiaPage({ theme }) {
  const [employmentScope, setEmploymentScope] = useState("tijucas");
  const pibModel = useMemo(() => buildPibModel(theme.pib), [theme.pib]);
  const employmentModel = useMemo(
    () => buildEmploymentModel(theme.employmentScopes ? { scopes: theme.employmentScopes } : { scopes: {} }),
    [theme.employmentScopes],
  );
  const activeEmployment = employmentScope === "tijucas" ? employmentModel.tijucas : employmentModel.sc;
  const mesoName = pibModel.meso?.name ?? "Mesorregiao";

  return (
    <section
      id="economia"
      aria-labelledby="economia-title"
      className="educacao-shell relative overflow-hidden rounded-[32px] font-sans shadow-[0_24px_80px_rgba(3,10,34,0.24)]"
    >
      <div className="relative flex flex-col gap-14 p-6 md:p-8 xl:p-10">
        <header className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-300">
              Eixo economia
            </p>
            <h2 id="economia-title" className="mt-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              PIB e emprego formal em fluxo continuo
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-200">
              O eixo comeca pelo PIB para situar Tijucas na economia de Santa Catarina e da mesorregiao.
              Depois, acompanha o saldo de empregos formais, com leitura acumulada em 12 meses e setores de maior impacto.
            </p>
          </div>
          <div className="educacao-surface rounded-[28px] px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Periodo emprego</p>
            <strong className="mt-1 block text-xl font-extrabold text-white">{theme.employmentPeriod}</strong>
          </div>
        </header>

        <section className="grid gap-8" aria-labelledby="economia-pib-title">
          <EducacaoSectionHeader
            titleId="economia-pib-title"
            eyebrow="PIB primeiro"
            title="Tijucas em destaque frente a SC e Grande Florianopolis"
            badge={`Projecao ate ${pibModel.projectionYear}`}
            description="A leitura separa o comportamento municipal do estadual e da mesorregiao, preservando Tijucas como serie principal."
          />

          <div className="grid gap-8 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.25fr)] xl:items-stretch">
            <EducacaoNarrativeText
              eyebrow="Leitura economica"
              title="PIB municipal ganha escala no horizonte projetado"
              body={`Tijucas parte de ${formatPib(pibModel.tijucasRow?.pibObservado ?? 0)} em ${pibModel.observedYear} e chega a ${formatPib(pibModel.tijucasRow?.pibProjetado ?? 0)} em ${pibModel.projectionYear}. Entre 2025 e 2030, o CAGR estimado e de ${decimalFormatter.format(pibModel.cagr2025To2030)}% ao ano. Em 2030, o municipio representa ${decimalFormatter.format(pibModel.mesoShare2030)}% do PIB projetado da mesorregiao e ${decimalFormatter.format(pibModel.scShare2030)}% de SC.`}
              caption="Valores em reais correntes no arquivo de PIB do projeto; anos de 2024 a 2030 sao projecoes."
              icon={TrendingUp}
              className="h-full"
            />

            <EconomiaKpiGrid items={pibModel.kpis} />
          </div>

          <EducacaoChartNarrativeRow
            chart={
              <EducacaoChartCard
                title="PIB observado e projetado"
                subtitle="Tijucas aparece em destaque; SC e mesorregiao ficam como referencia de escala."
              >
                <PibLineChart data={pibModel.lineData} mesoName={mesoName} />
              </EducacaoChartCard>
            }
            narrative={
              <EducacaoNarrativeText
                eyebrow="Comparacao territorial"
                title="O municipio dentro da mesorregiao"
                body={`A comparacao com ${mesoName} mostra o peso relativo de Tijucas no arranjo regional. O grafico usa escala logaritmica para permitir que municipio, mesorregiao e estado sejam lidos juntos sem esconder a serie municipal.`}
                icon={MapPinned}
                className="h-full"
              />
            }
          />
        </section>

        <section className="grid gap-8" aria-labelledby="economia-emprego-title">
          <EducacaoSectionHeader
            titleId="economia-emprego-title"
            eyebrow="Emprego formal"
            title="Saldo acumulado em 12 meses e setores de maior impacto"
            badge={`Ultimo mes: ${employmentModel.tijucas.latestMonth}`}
            description="A segunda parte do eixo mostra o ritmo recente do mercado de trabalho e os setores que explicam o resultado de Tijucas."
          />

          <div className="grid gap-8 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.25fr)] xl:items-stretch">
            <EducacaoNarrativeText
              eyebrow="Leitura de emprego"
              title="Tijucas segue com saldo positivo no recorte recente"
              body={`Em ${employmentModel.tijucas.latestMonth}, Tijucas registrou ${employmentModel.tijucas.monthlyBalance > 0 ? "+" : ""}${numberFormatter.format(employmentModel.tijucas.monthlyBalance)} empregos formais. No acumulado de 12 meses, o saldo chega a ${employmentModel.tijucas.annualBalance > 0 ? "+" : ""}${numberFormatter.format(employmentModel.tijucas.annualBalance)} vagas.`}
              caption="A leitura setorial usa a base de setores disponivel no painel de emprego."
              icon={BriefcaseBusiness}
              className="h-full"
            />

            <EconomiaKpiGrid items={employmentModel.kpis} />
          </div>

          <EducacaoChartNarrativeRow
            reverse
            chart={
              <EducacaoChartCard
                title={`Saldo mensal - ${activeEmployment.fullLabel}`}
                subtitle="Serie dos ultimos 12 meses do CAGED/MTE."
                actions={<ScopeToggle value={employmentScope} onChange={setEmploymentScope} />}
              >
                <EmploymentBarChart data={employmentModel.monthlyData} scope={employmentScope} />
              </EducacaoChartCard>
            }
            narrative={
              <EducacaoNarrativeText
                eyebrow="Acumulado 12 meses"
                title="Mudancas mensais explicam o saldo anual"
                body={`O recorte ${activeEmployment.fullLabel} acumula ${activeEmployment.annualBalance > 0 ? "+" : ""}${numberFormatter.format(activeEmployment.annualBalance)} vagas entre ${theme.employmentPeriod}. A visualizacao mensal evidencia meses de expansao e queda sazonal.`}
                icon={LineChartIcon}
                className="h-full"
              />
            }
          />

          <EducacaoChartNarrativeRow
            chart={
              <EducacaoChartCard
                title="Top 5 setores de Tijucas"
                subtitle="Maiores saldos absolutos na base setorial disponivel."
              >
                <SectorRanking sectors={employmentModel.topSectors} />
              </EducacaoChartCard>
            }
            narrative={
              <EducacaoNarrativeText
                eyebrow="Composicao setorial"
                title="Setores explicam onde o emprego se move"
                body="O ranking destaca os setores com maior impacto no saldo de Tijucas. Valores positivos indicam criacao liquida de vagas; valores negativos mostram contracao no mesmo recorte."
                icon={BarChart3}
                className="h-full"
              />
            }
          />
        </section>
      </div>
    </section>
  );
}
