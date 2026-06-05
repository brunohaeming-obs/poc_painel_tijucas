import { BarChart3, BriefcaseBusiness, Info, LineChart as LineChartIcon, MapPinned, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import { pibCitizenData } from "../../data/pibCitizenData.js";
import { realIndicators } from "../../data/realIndicators.js";
import { TypewriterText } from "../educacao/components/TypewriterText.jsx";

const numberFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const compactFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const colors = {
  tijucas: "#FCD418",
  comparison: ["#71B434", "#F2A116", "#14B8A6", "#8B5CF6", "#F97316", "#94A3B8", "#0EA5E9"],
  positive: "#71B434",
  negative: "#F2A116",
  grid: "rgba(255,255,255,0.14)",
  text: "#CBD5E1",
  projected: "rgba(252,212,24,0.09)",
};

function formatMoney(value) {
  if (Math.abs(value) >= 1_000_000_000) {
    return `R$ ${decimalFormatter.format(value / 1_000_000_000)} bi`;
  }
  return `R$ ${numberFormatter.format(value / 1_000_000)} mi`;
}

function formatPerCapita(value) {
  return `R$ ${numberFormatter.format(value)}`;
}

function formatSigned(value) {
  return `${value > 0 ? "+" : ""}${numberFormatter.format(value)}`;
}

function formatSectorName(name = "") {
  const replacements = {
    "Construcao de edificios": "Construção de edifícios",
    "Comercio varejista nao especializado": "Comércio varejista não especializado",
    "Outros servicos especializados para construcao": "Outros serviços especializados para construção",
    "Atividades de apoio a gestao de saude": "Atividades de apoio à gestão de saúde",
    "Servicos de escritorio e apoio administrativo": "Serviços de escritório e apoio administrativo",
  };
  return replacements[name] ?? name;
}

function calculateShare(part, total) {
  return total ? (part / total) * 100 : 0;
}

function buildRunningTotal(rows) {
  let total = 0;
  return rows.map((row) => {
    total += row.saldo;
    return { ...row, saldo: total };
  });
}

function getMetricValue(row, mode, year) {
  const point = row.series.find((item) => item.ano === year);
  if (!point) return 0;
  return mode === "perCapita" ? point.pibPerCapita : point.pib;
}

function buildPibChartRows(seriesRows, mode) {
  const years = [...new Set(seriesRows.flatMap((row) => row.series.map((item) => item.ano)))].sort((a, b) => a - b);
  return years.map((year) => {
    const row = { ano: year };
    seriesRows.forEach((municipality) => {
      row[municipality.municipio] = getMetricValue(municipality, mode, year);
    });
    return row;
  });
}

function rankWithin(rows, municipality, valueGetter) {
  const ranked = [...rows].sort((a, b) => valueGetter(b) - valueGetter(a));
  return ranked.findIndex((row) => row.municipio === municipality) + 1;
}

function buildPibRanking(rows, mode) {
  const valueGetter = mode === "perCapita" ? (row) => row.pibPerCapita2025 : (row) => row.pib2025;
  return [...rows]
    .sort((a, b) => valueGetter(b) - valueGetter(a))
    .map((row, index) => ({
      rank: index + 1,
      municipio: row.municipio,
      value: valueGetter(row),
    }));
}

function topPositiveSectors(sectors, limit = 5) {
  return [...sectors].filter((sector) => sector.saldo > 0).sort((a, b) => b.saldo - a.saldo).slice(0, limit);
}

function PibRankingBox({ ranking, mode, average, onClose }) {
  const formatter = mode === "perCapita" ? formatPerCapita : formatMoney;
  const topItems = ranking.slice(0, 5);
  const tijucasItem = ranking.find((item) => item.municipio === "Tijucas");
  const showTijucasPosition = tijucasItem && !topItems.some((item) => item.municipio === "Tijucas");

  const renderItem = (item) => (
    <li
      key={`${item.rank}-${item.municipio}`}
      className={`flex items-start gap-3 rounded-2xl border p-3 ${
        item.municipio === "Tijucas"
          ? "border-brand-yellow/60 bg-brand-yellow/[0.12]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-yellow text-sm font-extrabold text-brand-navy">
        {item.rank}
      </span>
      <div>
        <p className="text-sm font-extrabold leading-5 text-white">{item.municipio}</p>
        <p className="mt-1 text-xs font-bold text-slate-300">{formatter(item.value)}</p>
      </div>
    </li>
  );

  return (
    <aside className="educacao-surface rounded-[24px] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-yellow">Ranking do recorte comparável</p>
          <h4 className="mt-2 text-xl font-extrabold text-white">
            Top municípios por {mode === "perCapita" ? "PIB per capita projetado" : "PIB projetado"}
          </h4>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
            Recorte: municípios de Santa Catarina com até {numberFormatter.format(pibCitizenData.metadata.populationLimit)} habitantes.
            A média do grupo é {formatter(average)}.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="self-start rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-extrabold text-slate-100 transition hover:bg-white/10"
        >
          Fechar
        </button>
      </div>
      <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {topItems.map(renderItem)}
      </ol>
      {showTijucasPosition ? (
        <div className="mt-4 rounded-2xl border border-brand-yellow/45 bg-brand-yellow/[0.10] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-yellow">Posição de Tijucas</p>
          <div className="mt-3">{renderItem(tijucasItem)}</div>
        </div>
      ) : null}
      <SourceLine>PIB municipal do projeto; IBGE Censo 2022; projeções 2025-2030.</SourceLine>
    </aside>
  );
}

function SectorImpactBox({ monthlySectors, annualSectors, monthLabel, annualLabel, onClose }) {
  const renderList = (items) => (
    <ol className="mt-4 grid gap-3">
      {items.map((sector, index) => (
        <li key={`${sector.name}-${sector.saldo}`} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-yellow text-sm font-extrabold text-brand-navy">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-extrabold leading-5 text-white">{formatSectorName(sector.name)}</p>
            <p className="mt-1 text-xs font-bold text-slate-300">{formatSigned(sector.saldo)} vagas no período</p>
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <aside className="educacao-surface rounded-[24px] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-yellow">Setores com maior impacto</p>
          <h4 className="mt-2 text-xl font-extrabold text-white">Top 5 setores que mais geraram vagas</h4>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
            Saldo significa admissões menos desligamentos. Valores positivos indicam setores que mais contribuíram para criação líquida de empregos formais.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="self-start rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-extrabold text-slate-100 transition hover:bg-white/10"
        >
          Fechar
        </button>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section>
          <h5 className="text-sm font-extrabold text-slate-200">Mês: {monthLabel}</h5>
          {renderList(monthlySectors)}
        </section>
        <section>
          <h5 className="text-sm font-extrabold text-slate-200">Acumulado 12 meses: {annualLabel}</h5>
          {renderList(annualSectors)}
        </section>
      </div>
      <SourceLine>MTE/Novo Caged, dados de emprego formal atualizados em 2026.</SourceLine>
    </aside>
  );
}

function ModeButton({ active, onClick, children, icon: Icon }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-extrabold transition ${
        active
          ? "border-brand-yellow bg-brand-yellow text-brand-navy"
          : "border-white/15 bg-white/[0.04] text-slate-100 hover:bg-white/10"
      }`}
    >
      {Icon ? <Icon size={16} strokeWidth={2.4} /> : null}
      {children}
    </button>
  );
}

function InfoMark({ text }) {
  if (!text) return null;
  const paragraphs = String(text).split(/(?<=\.)\s+/).filter(Boolean);
  return (
    <span
      tabIndex={0}
      className="group relative inline-grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-slate-200 outline-none transition hover:border-brand-yellow hover:text-brand-yellow focus:border-brand-yellow focus:text-brand-yellow"
      aria-label="Mais informações"
    >
      <Info size={12} strokeWidth={2.6} />
      <span className="pointer-events-none absolute right-0 top-7 z-30 hidden w-[420px] max-w-[calc(100vw-32px)] rounded-2xl border border-brand-yellow/35 bg-[#071845] p-5 text-left text-sm font-semibold leading-6 text-slate-100 shadow-2xl ring-1 ring-white/10 group-hover:block group-focus:block">
        <span className="mb-3 block text-xs font-extrabold uppercase tracking-[0.18em] text-brand-yellow">Como ler este indicador</span>
        {paragraphs.map((paragraph) => (
          <span key={paragraph} className="mt-3 block border-l-2 border-brand-yellow/40 pl-3">
            {paragraph}
          </span>
        ))}
      </span>
    </span>
  );
}

function KpiGrid({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const content = (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
              <InfoMark text={item.help} />
            </div>
            <strong className="mt-2 block text-xl font-extrabold leading-tight text-white">{item.value}</strong>
            <span className="mt-2 block text-xs font-semibold leading-5 text-slate-300">{item.note}</span>
          </>
        );
        if (item.onClick) {
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              aria-expanded={item.expanded}
              className={`rounded-[18px] px-4 py-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-yellow/70 ${
                item.expanded
                  ? "border border-brand-yellow bg-brand-yellow/18"
                  : "border border-brand-yellow/55 bg-brand-yellow/[0.10] hover:bg-brand-yellow/[0.16]"
              }`}
            >
              {content}
            </button>
          );
        }
        return (
          <article key={item.label} className="educacao-surface rounded-[18px] px-4 py-4 shadow-sm">
            {content}
          </article>
        );
      })}
    </div>
  );
}

function SourceLine({ children }) {
  if (!children) return null;
  return <p className="mt-4 border-t border-white/10 pt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Fonte: {children}</p>;
}

function NarrativeCard({ eyebrow, title, body, caption, source, icon: Icon, restartKey }) {
  return (
    <aside className="educacao-surface flex h-full flex-col justify-between rounded-[24px] p-6">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-yellow text-brand-navy">
            <Icon size={20} strokeWidth={2.4} />
          </span>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{eyebrow}</p>
        </div>
        <h4 className="mt-5 text-2xl font-extrabold leading-tight text-white">{title}</h4>
        <p className="mt-4 text-sm font-medium leading-7 text-slate-200">
          <TypewriterText
            text={body}
            restartKey={restartKey ?? body}
            intervalMs={18}
          />
        </p>
      </div>
      <div>
        {caption ? <p className="mt-6 text-xs font-semibold leading-5 text-slate-400">{caption}</p> : null}
        <SourceLine>{source}</SourceLine>
      </div>
    </aside>
  );
}

function ChartTooltip({ active, payload, label, formatter = numberFormatter.format }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#071845] px-3 py-2 text-xs text-slate-100 shadow-lg">
      <strong className="text-white">{label}</strong>
      <div className="mt-2 grid gap-1">
        {payload.map((item) => (
          <span key={item.dataKey}>
            <span style={{ color: item.color }}>{item.name}: </span>
            {formatter(item.value)}
          </span>
        ))}
      </div>
    </div>
  );
}

function PibChart({ data, rows, mode }) {
  const formatter = mode === "perCapita" ? formatPerCapita : formatMoney;
  const width = 920;
  const height = 360;
  const padding = { top: 28, right: 18, bottom: 74, left: 86 };
  const values = data.flatMap((item) => rows.map((row) => item[row.municipio]).filter((value) => Number.isFinite(value)));
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const min = rawMin === rawMax ? rawMin * 0.9 : rawMin * 0.96;
  const max = rawMin === rawMax ? rawMax * 1.1 : rawMax * 1.04;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xFor = (index) => padding.left + (plotWidth * index) / Math.max(data.length - 1, 1);
  const yFor = (value) => padding.top + plotHeight - ((value - min) / Math.max(max - min, 1)) * plotHeight;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => min + (max - min) * ratio);
  const projectionIndex = data.findIndex((item) => item.ano >= 2024);
  const projectionStart =
    projectionIndex > 0
      ? xFor(projectionIndex) - (xFor(projectionIndex) - xFor(projectionIndex - 1)) / 2
      : xFor(0);
  const labelEvery = data.length > 18 ? 2 : 1;
  const legendItems = [
    ...rows.map((row, index) => ({
      name: row.municipio,
      color: row.municipio === "Tijucas" ? colors.tijucas : colors.comparison[index % colors.comparison.length],
      projected: false,
    })),
    { name: "Projeção", color: colors.projected, projected: true },
  ];

  return (
    <div className="h-full min-h-[340px] w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={mode === "perCapita" ? "Evolução do PIB per capita" : "Evolução do PIB"}
        className="h-full w-full"
      >
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        <rect
          x={projectionStart}
          y={padding.top}
          width={width - padding.right - projectionStart}
          height={plotHeight}
          fill={colors.projected}
        />
        {ticks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke={colors.grid} strokeDasharray="4 4" />
              <text x={padding.left - 12} y={y + 4} textAnchor="end" className="fill-slate-300 text-[12px] font-semibold">
                {mode === "perCapita" ? compactFormatter.format(tick) : formatter(tick)}
              </text>
            </g>
          );
        })}
        {data.map((item, index) => (
          <g key={item.ano}>
            <line x1={xFor(index)} x2={xFor(index)} y1={padding.top} y2={height - padding.bottom} stroke="rgba(255,255,255,0.08)" />
            {index % labelEvery === 0 || index === data.length - 1 ? (
              <text x={xFor(index)} y={height - 18} textAnchor="middle" className="fill-slate-300 text-[12px] font-bold">
                {item.ano}
              </text>
            ) : null}
          </g>
        ))}
        {rows.map((row, rowIndex) => {
          const stroke = row.municipio === "Tijucas" ? colors.tijucas : colors.comparison[rowIndex % colors.comparison.length];
          const points = data.map((item, index) => `${xFor(index)},${yFor(item[row.municipio])}`).join(" ");
          return (
            <g key={row.municipio}>
              <polyline
                points={points}
                fill="none"
                stroke={stroke}
                strokeWidth={row.municipio === "Tijucas" ? 5 : 3.2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {data.map((item, index) => (
                <circle
                  key={`${row.municipio}-${item.ano}`}
                  cx={xFor(index)}
                  cy={yFor(item[row.municipio])}
                  r={index % 2 === 0 || index === data.length - 1 ? (row.municipio === "Tijucas" ? 4.5 : 3.4) : 0}
                  fill="#071845"
                  stroke={stroke}
                  strokeWidth="2"
                >
                  <title>{`${row.municipio} - ${item.ano}: ${formatter(item[row.municipio])}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
        <g transform={`translate(${padding.left}, ${height - 50})`}>
          {legendItems.map((item, index) => {
            const x = (index % 4) * 180;
            const y = Math.floor(index / 4) * 24;
            return (
              <g key={item.name} transform={`translate(${x}, ${y})`}>
                {item.projected ? (
                  <rect x="0" y="2" width="24" height="11" fill={colors.projected} stroke="rgba(252,212,24,0.35)" />
                ) : (
                  <line x1="0" x2="24" y1="8" y2="8" stroke={item.color} strokeWidth={item.name === "Tijucas" ? 5 : 3.2} />
                )}
                <text x="32" y="12" className="fill-slate-200 text-[12px] font-bold">{item.name}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function EmploymentChart({ data, mode }) {
  return (
    <div className="h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 20, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
          <XAxis dataKey="periodo" tick={{ fill: colors.text, fontSize: 12 }} />
          <YAxis tick={{ fill: colors.text, fontSize: 12 }} tickFormatter={compactFormatter.format} width={58} />
          <Tooltip content={<ChartTooltip formatter={numberFormatter.format} />} />
          <Bar dataKey="saldo" name={mode === "monthly" ? "Saldo mensal" : "Acumulado"} radius={[8, 8, 0, 0]}>
            {data.map((row) => (
              <Cell key={row.periodo} fill={row.saldo >= 0 ? colors.positive : colors.negative} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MultiMunicipalityPicker({ selected, onChange, options, label = "Municípios" }) {
  const toggle = (name) => {
    if (name === "Tijucas") return;
    const next = selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name];
    onChange(["Tijucas", ...next.filter((item) => item !== "Tijucas")].slice(0, 8));
  };

  return (
    <details className="relative">
      <summary className="flex h-10 min-w-[250px] cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-3 text-sm font-bold text-slate-100 transition hover:bg-white/10">
        <span>{label}: {selected.length}</span>
        <span aria-hidden="true">v</span>
      </summary>
      <div className="absolute right-0 z-20 mt-2 grid max-h-[310px] w-[320px] gap-1 overflow-auto rounded-xl border border-white/10 bg-[#071845] p-2 shadow-xl">
        {options.map((name) => (
          <label
            key={name}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
          >
            <input
              type="checkbox"
              checked={selected.includes(name)}
              disabled={name === "Tijucas"}
              onChange={() => toggle(name)}
              className="h-4 w-4 rounded border-slate-300 accent-brand-yellow"
            />
            {name}
          </label>
        ))}
      </div>
    </details>
  );
}

export function EconomiaPage({ theme }) {
  const municipalities = pibCitizenData.municipalities;
  const peerMunicipalities = useMemo(
    () => municipalities.filter((row) => row.populacao <= pibCitizenData.metadata.populationLimit),
    [municipalities],
  );
  const peerNames = useMemo(() => peerMunicipalities.map((row) => row.municipio), [peerMunicipalities]);
  const [pibMode, setPibMode] = useState("total");
  const [pibNames, setPibNames] = useState(["Tijucas", "Xanxerê", "Imbituba"]);
  const [pibPerCapitaNames, setPibPerCapitaNames] = useState(pibCitizenData.defaultComparison.slice(0, 4));
  const [showPibRanking, setShowPibRanking] = useState(false);
  const [employmentMode, setEmploymentMode] = useState("monthly");
  const [showSectorImpact, setShowSectorImpact] = useState(false);

  const tijucas = municipalities.find((row) => row.municipio === "Tijucas");
  const mesoregionMunicipalities = municipalities.filter((row) => row.mesorregiao === tijucas?.mesorregiao);
  const selectedNames = pibMode === "total" ? pibNames : pibPerCapitaNames;
  const setSelectedNames = pibMode === "total" ? setPibNames : setPibPerCapitaNames;
  const chartRows = selectedNames.map((name) => municipalities.find((row) => row.municipio === name)).filter(Boolean);
  const pibChartData = buildPibChartRows(chartRows, pibMode);
  const peerAverageCagr = peerMunicipalities.reduce((sum, row) => sum + row.cagrPib2025_2030, 0) / peerMunicipalities.length;
  const peerAveragePib2025 = peerMunicipalities.reduce((sum, row) => sum + row.pib2025, 0) / peerMunicipalities.length;
  const peerAveragePibPc2025 = peerMunicipalities.reduce((sum, row) => sum + row.pibPerCapita2025, 0) / peerMunicipalities.length;
  const pibRanking = buildPibRanking(peerMunicipalities, pibMode);
  const pibAverageMultiplier = calculateShare(tijucas.pib2025, peerAveragePib2025) / 100;
  const pibPerCapitaAverageMultiplier = calculateShare(tijucas.pibPerCapita2025, peerAveragePibPc2025) / 100;
  const economyPeerHelp = `Comparação feita com municípios de Santa Catarina com população de até ${numberFormatter.format(pibCitizenData.metadata.populationLimit)} habitantes, usando população de referência do ${pibCitizenData.metadata.populationSource}.`;
  const mesoregionHelp = `Ranking feito entre os ${mesoregionMunicipalities.length} municípios da mesorregião ${tijucas?.mesorregiao}, usando PIB per capita projetado de 2025 e população de referência do ${pibCitizenData.metadata.populationSource}.`;
  const pibSourceHelp = "Fonte: base de PIB municipal do projeto, com série observada até 2023 e projeções de 2025 a 2030. PIB é o valor total produzido pela economia do município.";
  const employmentSourceHelp = "Fonte: base de empregos formais do projeto, derivada do Novo Caged/MTE. Saldo significa admissões menos desligamentos no período.";

  const pibKpis = pibMode === "total"
    ? [
        {
          label: "PIB Tijucas 2025",
          value: formatMoney(tijucas.pib2025),
          note: "PIB projetado para 2025.",
          help: `${pibSourceHelp} ${economyPeerHelp}`,
        },
        {
          label: "Crescimento até 2030",
          value: `${decimalFormatter.format(tijucas.cagrPib2025_2030)}% a.a.`,
          note: `Média pares: ${decimalFormatter.format(peerAverageCagr)}% a.a.`,
          help: `CAGR é a taxa média anual de crescimento entre o PIB projetado de 2025 e 2030. A média dos pares usa o mesmo grupo: ${economyPeerHelp}`,
        },
        {
          label: "Posição no grupo",
          value: `${rankWithin(peerMunicipalities, "Tijucas", (row) => row.pib2025)}º`,
          note: `Entre municípios até ${numberFormatter.format(pibCitizenData.metadata.populationLimit)} hab.`,
          help: `Ranking do PIB projetado de 2025. ${economyPeerHelp} Tijucas entra no ranking junto com os municípios desse grupo.`,
        },
        {
          label: "Acima da média",
          value: `${decimalFormatter.format(pibAverageMultiplier)}x`,
          note: `PIB de Tijucas ${decimalFormatter.format(pibAverageMultiplier)}x acima da média dos municípios similares.`,
          help: `Mostra quantas vezes o PIB de Tijucas equivale à média do grupo comparável. ${economyPeerHelp} Clique no card para ver o ranking dos municípios desse recorte.`,
          onClick: () => setShowPibRanking((current) => !current),
          expanded: showPibRanking,
        },
      ]
    : [
        {
          label: "PIB per capita 2025",
          value: formatPerCapita(tijucas.pibPerCapita2025),
          note: "Tijucas.",
          help: `PIB per capita é o PIB dividido pela população. Fonte: base de PIB per capita do projeto; população de referência: ${pibCitizenData.metadata.populationSource}.`,
        },
        {
          label: "Crescimento até 2030",
          value: `${decimalFormatter.format(tijucas.cagrPibPerCapita2025_2030)}% a.a.`,
          note: "Projeção com população censitária fixa.",
          help: `Crescimento anual médio do PIB per capita projetado entre 2025 e 2030. A população fica fixa pela referência do ${pibCitizenData.metadata.populationSource}, para comparar cidades na mesma régua.`,
        },
        {
          label: "Posição na mesorregião",
          value: `${rankWithin(mesoregionMunicipalities, "Tijucas", (row) => row.pibPerCapita2025)}º`,
          note: `Na mesorregião ${tijucas?.mesorregiao}.`,
          help: mesoregionHelp,
        },
        {
          label: "Acima da média",
          value: `${decimalFormatter.format(pibPerCapitaAverageMultiplier)}x`,
          note: `PIB per capita de Tijucas ${decimalFormatter.format(pibPerCapitaAverageMultiplier)}x acima da média dos municípios similares.`,
          help: `Mostra quantas vezes o PIB per capita de Tijucas equivale à média do grupo comparável. ${economyPeerHelp} Clique no card para ver o ranking dos municípios desse recorte.`,
          onClick: () => setShowPibRanking((current) => !current),
          expanded: showPibRanking,
        },
      ];

  const employment = theme.employmentScopes.tijucas;
  const scEmployment = theme.employmentScopes.sc;
  const employmentChartData = employmentMode === "monthly" ? employment.monthly : buildRunningTotal(employment.monthly);
  const employmentValue = employmentMode === "monthly" ? employment.monthlyBalance : employment.annualBalance;
  const scEmploymentValue = employmentMode === "monthly" ? scEmployment.monthlyBalance : scEmployment.annualBalance;
  const topSectors = topPositiveSectors(employment.sectors);
  const annualTopSectors = topPositiveSectors(
    realIndicators.employmentSectorsTijucas.map((sector) => ({ name: sector.setor, saldo: sector.saldo, value: Math.abs(sector.saldo) })),
  );
  const activeTopSectors = employmentMode === "monthly" ? topSectors : annualTopSectors;
  const topSector = activeTopSectors[0];
  const employmentKpis = [
    {
      label: employmentMode === "monthly" ? "Tijucas no mês" : "Tijucas em 12 meses",
      value: formatSigned(employmentValue),
      note: employmentMode === "monthly" ? employment.latestMonth : theme.employmentPeriod,
      help: employmentMode === "monthly"
        ? `${employmentSourceHelp} Aqui o recorte é Tijucas no último mês disponível.`
        : `${employmentSourceHelp} Aqui o recorte é Tijucas no acumulado de 12 meses exibido.`,
    },
    {
      label: "Santa Catarina",
      value: formatSigned(scEmploymentValue),
      note: employmentMode === "monthly" ? employment.latestMonth : theme.employmentPeriod,
      help: `${employmentSourceHelp} Aqui o mesmo cálculo é agregado para todo o estado de Santa Catarina, no mesmo período de Tijucas.`,
    },
    {
      label: "Peso de Tijucas",
      value: `${decimalFormatter.format(calculateShare(employmentValue, scEmploymentValue))}%`,
      note: "Participação no saldo estadual.",
      help: "Mostra o saldo de Tijucas dividido pelo saldo de Santa Catarina no mesmo período. Serve para medir o peso do município no resultado estadual.",
    },
    {
      label: "Setor com maior impacto",
      value: formatSectorName(topSector?.name) || "-",
      note: `${formatSigned(topSector?.saldo ?? 0)} vagas. Clique para ver o top 5.`,
      help: `${employmentSourceHelp} Clique no card para abrir o ranking dos 5 setores com maior saldo positivo no mês e no acumulado de 12 meses.`,
      onClick: () => setShowSectorImpact((current) => !current),
      expanded: showSectorImpact,
    },
  ];

  const accessiblePibNarrative = pibMode === "total"
    ? `PIB é o valor produzido pela economia da cidade. Tijucas aparece em destaque e pode ser comparada com municípios de porte parecido. Em 2025, o PIB projetado é ${formatMoney(tijucas.pib2025)}. Até 2030, a projeção indica crescimento médio de ${decimalFormatter.format(tijucas.cagrPib2025_2030)}% ao ano. A área amarela mostra valores projetados.`
    : `PIB per capita é o PIB dividido pela população. Ele ajuda a comparar cidades de tamanhos diferentes. Tijucas aparece com outros municípios de até 70 mil habitantes. Este número não é a renda de cada pessoa; é uma média econômica por morador.`;
  const accessibleEmploymentNarrative = employmentMode === "monthly"
    ? `O saldo mensal mostra vagas abertas menos vagas fechadas. Em ${employment.latestMonth}, Tijucas teve saldo de ${formatSigned(employment.monthlyBalance)} vagas formais. O setor com maior impacto foi ${formatSectorName(topSector?.name)}, com ${formatSigned(topSector?.saldo ?? 0)} vagas.`
    : `O acumulado soma os saldos de 12 meses e mostra melhor a tendência do emprego. No período, Tijucas soma ${formatSigned(employment.annualBalance)} vagas formais. O setor com maior impacto foi ${formatSectorName(topSector?.name)}, com ${formatSigned(topSector?.saldo ?? 0)} vagas.`;
  const pibSource = "PIB municipal do projeto; IBGE Censo 2022; projeções 2025-2030.";
  const employmentSource = "MTE/Novo Caged, dados de emprego formal atualizados em 2026.";
  return (
    <section
      id="economia"
      aria-labelledby="economia-title"
      className="educacao-shell relative overflow-hidden rounded-[32px] font-sans shadow-[0_24px_80px_rgba(3,10,34,0.24)]"
    >
      <div className="relative flex flex-col gap-10 p-6 md:p-8 xl:p-10">
        <header className="grid gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-300">Eixo economia</p>
          <h2 id="economia-title" className="max-w-5xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Destaques econômicos de Tijucas
          </h2>
        </header>

        <section className="grid gap-5" aria-labelledby="pib-title">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 id="pib-title" className="text-2xl font-extrabold text-white">PIB municipal</h3>
              <p className="mt-1 text-sm font-semibold text-slate-300">Comparação com municípios catarinenses de porte populacional parecido.</p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <ModeButton active={pibMode === "total"} onClick={() => setPibMode("total")} icon={LineChartIcon}>PIB</ModeButton>
              <ModeButton active={pibMode === "perCapita"} onClick={() => setPibMode("perCapita")} icon={LineChartIcon}>PIB per capita</ModeButton>
              <MultiMunicipalityPicker selected={selectedNames} onChange={setSelectedNames} options={peerNames} />
            </div>
          </div>

          <KpiGrid items={pibKpis} />

          {showPibRanking ? (
            <PibRankingBox
              ranking={pibRanking}
              mode={pibMode}
              average={pibMode === "perCapita" ? peerAveragePibPc2025 : peerAveragePib2025}
              onClose={() => setShowPibRanking(false)}
            />
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
            <article className="educacao-surface rounded-[24px] p-5">
              <div className="mb-4">
                <h4 className="text-base font-extrabold text-white">
                  {pibMode === "total" ? "PIB observado e projetado" : "PIB per capita observado e projetado"}
                </h4>
                <p className="text-xs font-semibold text-slate-400">Área amarela indica anos projetados.</p>
              </div>
              <div className="h-[360px] w-full">
                <PibChart data={pibChartData} rows={chartRows} mode={pibMode === "total" ? "total" : "perCapita"} />
              </div>
              <SourceLine>{pibSource}</SourceLine>
            </article>
            <NarrativeCard
              eyebrow="Leitura do gráfico"
              title={pibMode === "total" ? "Escala econômica de Tijucas" : "Comparação por habitante"}
              body={accessiblePibNarrative}
              caption={`População de referência: ${pibCitizenData.metadata.populationSource}.`}
              source={pibSource}
              icon={pibMode === "total" ? TrendingUp : MapPinned}
              restartKey={`pib-${pibMode}-${selectedNames.join("|")}`}
            />
          </div>
        </section>

        <section className="grid gap-5" aria-labelledby="emprego-title">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 id="emprego-title" className="text-2xl font-extrabold text-white">Emprego formal</h3>
              <p className="mt-1 text-sm font-semibold text-slate-300">Saldo de vagas formais em Tijucas no recorte MTE/CAGED.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ModeButton active={employmentMode === "monthly"} onClick={() => setEmploymentMode("monthly")} icon={BarChart3}>Mensal</ModeButton>
              <ModeButton active={employmentMode === "annual"} onClick={() => setEmploymentMode("annual")} icon={BriefcaseBusiness}>Acumulado 12 meses</ModeButton>
            </div>
          </div>

          <KpiGrid items={employmentKpis} />

          {showSectorImpact ? (
            <SectorImpactBox
              monthlySectors={topSectors}
              annualSectors={annualTopSectors}
              monthLabel={employment.latestMonth}
              annualLabel={theme.employmentPeriod}
              onClose={() => setShowSectorImpact(false)}
            />
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
            <article className="educacao-surface rounded-[24px] p-5">
              <div className="mb-4">
                <h4 className="text-base font-extrabold text-white">
                  {employmentMode === "monthly" ? "Saldo mensal de empregos" : "Saldo acumulado em 12 meses"}
                </h4>
                <p className="text-xs font-semibold text-slate-400">Tijucas, {theme.employmentPeriod}.</p>
              </div>
              <EmploymentChart data={employmentChartData} mode={employmentMode} />
              <SourceLine>{employmentSource}</SourceLine>
            </article>
            <NarrativeCard
              eyebrow="Destaques do emprego"
              title={employmentMode === "monthly" ? "Ritmo recente do mercado formal" : "Tendência acumulada no período"}
              body={`${accessibleEmploymentNarrative} No recorte setorial disponível, o setor com maior saldo positivo é ${formatSectorName(topSector?.name) || "sem registro"}, com ${formatSigned(topSector?.saldo ?? 0)} vagas. Para ver o ranking dos setores, clique no card de setor com maior impacto.`}
              caption="Saldo setorial considera admissões menos desligamentos no recorte disponível."
              source={employmentSource}
              icon={BriefcaseBusiness}
              restartKey={`emprego-${employmentMode}`}
            />
          </div>
        </section>
      </div>
    </section>
  );
}







