import { BarChart3, BriefcaseBusiness, ChevronDown, Info, LineChart as LineChartIcon, MapPinned, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";
import { getEconomiaEmployment, getEconomiaPibCitizen } from "../../services/economiaService.js";
import { TypewriterText } from "../../shared/components/TypewriterText.jsx";
import {
  brInteger as numberFormatter,
  decimalNumber as decimalFormatter,
  compactNumber as compactFormatter,
} from "../../shared/lib/formatters.js";

const colors = {
  tijucas: "#007FFE",
  comparison: ["#71B434", "#F2A116", "#14B8A6", "#8B5CF6", "#F97316", "#94A3B8", "#0EA5E9"],
  positive: "#71B434",
  negative: "#F2A116",
  grid: "rgba(255,255,255,0.14)",
  text: "#475569",
  title: "#10213A",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "#93C5FD",
  tooltipMuted: "#64748B",
  projected: "rgba(0,127,254,0.09)",
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

function topPositiveSectors(sectors, limit = 5) {
  return [...sectors].filter((sector) => sector.saldo > 0).sort((a, b) => b.saldo - a.saldo).slice(0, limit);
}

function ModeButton({ active, onClick, children, icon: Icon }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-extrabold transition ${
        active
          ? "border-brand-blue bg-brand-blue text-white"
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
      className="group relative inline-grid h-5 w-5 shrink-0 place-items-center rounded-full border border-brand-blue/35 bg-brand-blue/[0.08] text-brand-blue outline-none transition hover:border-brand-blue hover:bg-brand-blue hover:text-white focus:border-brand-blue focus:bg-brand-blue focus:text-white"
      aria-label="Mais informações"
    >
      <Info size={12} strokeWidth={2.6} />
      <span className="pointer-events-none absolute right-0 top-7 z-30 hidden w-[420px] max-w-[calc(100vw-32px)] rounded-2xl border border-brand-blue/35 bg-white p-5 text-left text-sm font-semibold leading-6 text-slate-700 shadow-2xl ring-1 ring-brand-blue/10 group-hover:block group-focus:block">
        <span className="mb-3 block text-xs font-extrabold uppercase tracking-[0.18em] text-brand-blue">Como ler este indicador</span>
        {paragraphs.map((paragraph) => (
          <span key={paragraph} className="mt-3 block border-l-2 border-brand-blue/40 pl-3">
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
              className={`rounded-[18px] px-4 py-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-blue/70 ${
                item.expanded
                  ? "border border-brand-blue bg-brand-blue/18"
                  : "border border-brand-blue/55 bg-brand-blue/[0.10] hover:bg-brand-blue/[0.16]"
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
    <aside className="flex h-full flex-col justify-between border-l-2 border-white/15 pl-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
          {Icon && <Icon size={13} strokeWidth={2.4} />}
          <span>{eyebrow}</span>
        </div>
        <h3 className="mt-3 text-2xl font-extrabold leading-tight text-white">{title}</h3>
        <p className="mt-4 text-sm leading-7 text-slate-200">
          <TypewriterText text={body} restartKey={restartKey ?? body} intervalMs={18} />
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
    <div className="rounded-xl border px-3 py-2 text-xs shadow-lg" style={{ backgroundColor: colors.tooltipBg, borderColor: colors.tooltipBorder, color: colors.text }}>
      <strong style={{ color: colors.title }}>{label}</strong>
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
  const width = 1020;
  const height = 430;
  const padding = { top: 22, right: 12, bottom: 78, left: 54 };
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
              <text x={padding.left - 12} y={y + 4} textAnchor="end" className="text-[12px] font-semibold" fill={colors.text}>
                {mode === "perCapita" ? compactFormatter.format(tick) : formatter(tick)}
              </text>
            </g>
          );
        })}
        {data.map((item, index) => (
          <g key={item.ano}>
            <line x1={xFor(index)} x2={xFor(index)} y1={padding.top} y2={height - padding.bottom} stroke="rgba(255,255,255,0.08)" />
            {index % labelEvery === 0 || index === data.length - 1 ? (
              <text x={xFor(index)} y={height - 18} textAnchor="middle" className="text-[12px] font-bold" fill={colors.text}>
                {item.ano}
              </text>
            ) : null}
          </g>
        ))}
        {rows.map((row, rowIndex) => {
          const isTijucas = row.municipio === "Tijucas";
          const stroke = isTijucas ? colors.tijucas : colors.comparison[rowIndex % colors.comparison.length];
          const points = data.map((item, index) => `${xFor(index)},${yFor(item[row.municipio])}`).join(" ");
          return (
            <g key={row.municipio}>
              <polyline
                points={points}
                fill="none"
                stroke={stroke}
                strokeWidth={isTijucas ? 5 : 3.2}
                strokeDasharray={isTijucas ? undefined : "8 4"}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {data.map((item, index) => (
                <circle
                  key={`${row.municipio}-${item.ano}`}
                  cx={xFor(index)}
                  cy={yFor(item[row.municipio])}
                  r={index % 2 === 0 || index === data.length - 1 ? (isTijucas ? 4.5 : 3.4) : 0}
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
            const x = (index % 4) * 210;
            const y = Math.floor(index / 4) * 24;
            const isAvg = item.name === "Média similares" || item.name === "Média SC";
            return (
              <g key={item.name} transform={`translate(${x}, ${y})`}>
                {item.projected ? (
                  <rect x="0" y="2" width="24" height="11" fill={colors.projected} stroke="rgba(0,127,254,0.35)" />
                ) : (
                  <line
                    x1="0" x2="24" y1="8" y2="8"
                    stroke={item.color}
                    strokeWidth={item.name === "Tijucas" ? 5 : 3.2}
                    strokeDasharray={isAvg ? "8 4" : undefined}
                  />
                )}
                <text x="32" y="12" className="text-[12px] font-bold" fill={colors.text}>{item.name}</text>
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
    <div className="h-[430px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 12, bottom: 10, left: -10 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
          <XAxis
            dataKey="periodo"
            tick={{ fill: colors.text, fontSize: 12 }}
            axisLine={{ stroke: colors.text }}
            tickLine={{ stroke: colors.text }}
          />
          <YAxis
            tick={{ fill: colors.text, fontSize: 12 }}
            tickFormatter={compactFormatter.format}
            axisLine={{ stroke: colors.text }}
            tickLine={{ stroke: colors.text }}
            width={48}
          />
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

function SectorsChart({ data }) {
  const chartHeight = data.length * 40 + 52;
  return (
    <div style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 60, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: colors.text, fontSize: 12 }}
            axisLine={{ stroke: colors.text }}
            tickLine={{ stroke: colors.text }}
            tickFormatter={numberFormatter.format}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={218}
            tick={{ fill: colors.text, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v.length > 33 ? `${v.slice(0, 31)}…` : v)}
          />
          <Tooltip content={<ChartTooltip formatter={numberFormatter.format} />} />
          <Bar dataKey="saldo" name="Saldo">
            {data.map((row) => (
              <Cell key={row.name} fill={row.saldo >= 0 ? colors.positive : colors.negative} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const DYNAMICS_PALETTE = ["#007FFE", "#71B434", "#F2A116", "#14B8A6", "#8B5CF6", "#F97316", "#FB7185", "#0EA5E9"];

function SectorsDynamicsChart({ seriesData, periodos, selectedSectors }) {
  const chartData = periodos.map((periodo, idx) => {
    const point = { periodo };
    selectedSectors.forEach((setor) => {
      const series = seriesData.find((s) => s.setor === setor);
      if (series) {
        point[setor] = series.mensal.slice(0, idx + 1).reduce((a, b) => a + b, 0);
      }
    });
    return point;
  });

  return (
    <div>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 20, bottom: 8, left: 48 }}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
            <XAxis
              dataKey="periodo"
              tick={{ fill: colors.text, fontSize: 12 }}
              axisLine={{ stroke: colors.text }}
              tickLine={{ stroke: colors.text }}
            />
            <YAxis
              tick={{ fill: colors.text, fontSize: 12 }}
              tickFormatter={numberFormatter.format}
              axisLine={{ stroke: colors.text }}
              tickLine={{ stroke: colors.text }}
              width={48}
            />
            <Tooltip content={<ChartTooltip formatter={numberFormatter.format} />} />
            {selectedSectors.map((setor, idx) => (
              <Line
                key={setor}
                type="monotone"
                dataKey={setor}
                stroke={DYNAMICS_PALETTE[idx % DYNAMICS_PALETTE.length]}
                strokeWidth={2.4}
                dot={{ r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-1">
        {selectedSectors.map((setor, idx) => (
          <span key={setor} className="flex items-center gap-1.5" title={setor}>
            <span
              className="inline-block h-[3px] w-5 rounded-full"
              style={{ backgroundColor: DYNAMICS_PALETTE[idx % DYNAMICS_PALETTE.length] }}
            />
            <span className="text-[11px] font-semibold text-slate-400">
              {setor.length > 36 ? `${setor.slice(0, 34)}…` : setor}
            </span>
          </span>
        ))}
      </div>
      <p className="mt-4 px-1 text-[10px] font-medium italic text-slate-500">
        * Os totais anuais por setor são reais (MTE/CAGED). A distribuição mensal dentro de cada setor é uma estimativa proporcional — use os valores acumulados como referência principal.
      </p>
    </div>
  );
}

function SectorSelector({ allSectors, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(setor) {
    if (selected.includes(setor)) {
      if (selected.length > 1) onChange(selected.filter((s) => s !== setor));
    } else {
      onChange([...selected, setor]);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 text-sm font-extrabold text-slate-100 transition hover:bg-white/10"
      >
        <span>{selected.length} setor{selected.length !== 1 ? "es" : ""}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-96 rounded-2xl border border-white/15 bg-[#0c1d42] p-3 shadow-2xl">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Setores exibidos</p>
          <div className="max-h-72 overflow-y-auto">
            {allSectors.map((setor, idx) => {
              const checked = selected.includes(setor);
              return (
                <label
                  key={setor}
                  className="flex cursor-pointer gap-3 rounded-lg px-2 py-2 transition hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(setor)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
                  />
                  <span
                    className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: DYNAMICS_PALETTE[idx % DYNAMICS_PALETTE.length] }}
                  />
                  <span className="text-sm font-medium leading-5 text-slate-100">{setor}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


export function EconomiaPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [employment, pibCitizen] = await Promise.all([
          getEconomiaEmployment(),
          getEconomiaPibCitizen(),
        ]);
        if (active) setData({ employment, pibCitizen });
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar dados de economia.");
      }
    }
    load();
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <section className="rounded-[32px] border border-red-100 bg-white p-6 text-red-700">
        <strong>Não foi possível carregar o painel de Economia.</strong>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="educacao-shell economia-shell rounded-[32px] p-6 text-slate-300">
        Carregando dados de economia...
      </section>
    );
  }

  return <EconomiaContent employment={data.employment} pibCitizen={data.pibCitizen} />;
}

function EconomiaContent({ employment, pibCitizen }) {
  const municipalities = pibCitizen.municipalities;
  const peerMunicipalities = useMemo(
    () => municipalities.filter((row) => row.populacao <= pibCitizen.metadata.populationLimit),
    [municipalities, pibCitizen.metadata.populationLimit],
  );
  const [pibMode, setPibMode] = useState("total");
  const [employmentMode, setEmploymentMode] = useState("monthly");
  const [sectorView, setSectorView] = useState("ranking");
  const [selectedSectors, setSelectedSectors] = useState(
    () => (employment.sectorMonthlySeries ?? []).slice(0, 5).map((s) => s.setor),
  );

  useEffect(() => {
    if (employmentMode === "monthly") setSectorView("ranking");
  }, [employmentMode]);

  const tijucas = municipalities.find((row) => row.municipio === "Tijucas");
  const mesoregionMunicipalities = municipalities.filter((row) => row.mesorregiao === tijucas?.mesorregiao);

  const avgSimilaresRow = useMemo(() => {
    const simNames = pibCitizen.defaultComparison.filter((n) => n !== "Tijucas");
    const muns = simNames.map((name) => municipalities.find((m) => m.municipio === name)).filter(Boolean);
    const years = [...new Set(muns.flatMap((m) => m.series.map((s) => s.ano)))].sort((a, b) => a - b);
    const series = years.map((year) => {
      const pibs = muns.map((m) => m.series.find((s) => s.ano === year)?.pib).filter(Boolean);
      const pcs = muns.map((m) => m.series.find((s) => s.ano === year)?.pibPerCapita).filter(Boolean);
      return {
        ano: year,
        pib: pibs.length ? pibs.reduce((a, b) => a + b, 0) / pibs.length : null,
        pibPerCapita: pcs.length ? pcs.reduce((a, b) => a + b, 0) / pcs.length : null,
      };
    });
    return { municipio: "Média similares", series };
  }, [municipalities, pibCitizen.defaultComparison]);

  const avgScRow = useMemo(() => {
    const years = [...new Set(municipalities.flatMap((m) => m.series.map((s) => s.ano)))].sort((a, b) => a - b);
    const series = years.map((year) => {
      const pibs = municipalities.map((m) => m.series.find((s) => s.ano === year)?.pib).filter(Boolean);
      const pcs = municipalities.map((m) => m.series.find((s) => s.ano === year)?.pibPerCapita).filter(Boolean);
      return {
        ano: year,
        pib: pibs.length ? pibs.reduce((a, b) => a + b, 0) / pibs.length : null,
        pibPerCapita: pcs.length ? pcs.reduce((a, b) => a + b, 0) / pcs.length : null,
      };
    });
    return { municipio: "Média SC", series };
  }, [municipalities]);

  const chartRows = [tijucas, avgSimilaresRow, avgScRow].filter(Boolean);
  const pibChartData = buildPibChartRows(chartRows, pibMode).filter((row) => row.ano <= 2026);
  const tijucasPib2026 = tijucas.series.find((s) => s.ano === 2026)?.pib ?? null;
  const tijucasPibPc2026 = tijucas.series.find((s) => s.ano === 2026)?.pibPerCapita ?? null;
  const growth2025_2026 = tijucasPib2026 ? ((tijucasPib2026 / tijucas.pib2025) - 1) * 100 : null;
  const growth2025_2026Pc = tijucasPibPc2026 ? ((tijucasPibPc2026 / tijucas.pibPerCapita2025) - 1) * 100 : null;
  const peerAvgGrowth2025_2026 = peerMunicipalities.reduce((sum, row) => {
    const p26 = row.series?.find((s) => s.ano === 2026)?.pib;
    return p26 && row.pib2025 ? sum + ((p26 / row.pib2025) - 1) * 100 : sum;
  }, 0) / peerMunicipalities.length;
  const peerAvgGrowth2025_2026Pc = peerMunicipalities.reduce((sum, row) => {
    const p26 = row.series?.find((s) => s.ano === 2026)?.pibPerCapita;
    return p26 && row.pibPerCapita2025 ? sum + ((p26 / row.pibPerCapita2025) - 1) * 100 : sum;
  }, 0) / peerMunicipalities.length;
  const peerAveragePib2025 = peerMunicipalities.reduce((sum, row) => sum + row.pib2025, 0) / peerMunicipalities.length;
  const peerAveragePibPc2025 = peerMunicipalities.reduce((sum, row) => sum + row.pibPerCapita2025, 0) / peerMunicipalities.length;
  const pibAverageMultiplier = calculateShare(tijucas.pib2025, peerAveragePib2025) / 100;
  const pibPerCapitaAverageMultiplier = calculateShare(tijucas.pibPerCapita2025, peerAveragePibPc2025) / 100;
  const economyPeerHelp = `Comparação feita com municípios de Santa Catarina com população de até ${numberFormatter.format(pibCitizen.metadata.populationLimit)} habitantes, usando população de referência do ${pibCitizen.metadata.populationSource}.`;
  const mesoregionHelp = `Ranking feito entre os ${mesoregionMunicipalities.length} municípios da mesorregião ${tijucas?.mesorregiao}, usando PIB per capita projetado de 2025 e população de referência do ${pibCitizen.metadata.populationSource}.`;
  const pibSourceHelp = "Fonte: PIB observado pelo IBGE e projeções 2025-2030 do Observatório FIESC (2026), com coleta/consulta em 2026. PIB é o valor total produzido pela economia do município.";
  const employmentSourceHelp = "Fonte: base de empregos formais do projeto, derivada do Novo Caged/MTE, com coleta/consulta em 2026. Saldo significa admissões menos desligamentos no período.";

  const pibKpis = pibMode === "total"
    ? [
        {
          label: "PIB Tijucas 2025",
          value: formatMoney(tijucas.pib2025),
          note: "PIB projetado para 2025.",
          help: `${pibSourceHelp} ${economyPeerHelp}`,
        },
        {
          label: "Crescimento 2025–2026",
          value: growth2025_2026 != null ? `${decimalFormatter.format(growth2025_2026)}%` : "—",
          note: `Média pares: ${decimalFormatter.format(peerAvgGrowth2025_2026)}%`,
          help: `Variação percentual entre o PIB projetado de 2025 e o de 2026. A média dos pares usa o mesmo grupo: ${economyPeerHelp}`,
        },
        {
          label: "Posição no grupo",
          value: `${rankWithin(peerMunicipalities, "Tijucas", (row) => row.pib2025)}º`,
          note: `Entre municípios até ${numberFormatter.format(pibCitizen.metadata.populationLimit)} hab.`,
          help: `Ranking do PIB projetado de 2025. ${economyPeerHelp} Tijucas entra no ranking junto com os municípios desse grupo.`,
        },
        {
          label: "Acima da média",
          value: `${decimalFormatter.format(pibAverageMultiplier)}x`,
          note: `PIB de Tijucas ${decimalFormatter.format(pibAverageMultiplier)}x acima da média dos municípios similares.`,
          help: `Mostra quantas vezes o PIB de Tijucas equivale à média do grupo comparável. ${economyPeerHelp}`,
        },
      ]
    : [
        {
          label: "PIB per capita 2025",
          value: formatPerCapita(tijucas.pibPerCapita2025),
          note: "Tijucas.",
          help: `PIB per capita é o PIB dividido pela população. Fonte: PIB observado pelo IBGE e projeções do Observatório FIESC (2026), com coleta/consulta em 2026; população de referência: ${pibCitizen.metadata.populationSource}.`,
        },
        {
          label: "Crescimento 2025–2026",
          value: growth2025_2026Pc != null ? `${decimalFormatter.format(growth2025_2026Pc)}%` : "—",
          note: `Média pares: ${decimalFormatter.format(peerAvgGrowth2025_2026Pc)}%`,
          help: `Variação percentual entre o PIB per capita projetado de 2025 e o de 2026. A população fica fixa pela referência do ${pibCitizen.metadata.populationSource}, para comparar cidades na mesma régua.`,
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
          help: `Mostra quantas vezes o PIB per capita de Tijucas equivale à média do grupo comparável. ${economyPeerHelp}`,
        },
      ];

  const empTijucas = employment.scopes.tijucas;
  const scEmployment = employment.scopes.sc;
  const employmentChartData = employmentMode === "monthly" ? empTijucas.monthly : buildRunningTotal(empTijucas.monthly);
  const employmentValue = employmentMode === "monthly" ? empTijucas.monthlyBalance : empTijucas.annualBalance;
  const scEmploymentValue = employmentMode === "monthly" ? scEmployment.monthlyBalance : scEmployment.annualBalance;
  const topSectors = topPositiveSectors(empTijucas.sectors);
  const annualTopSectors = topPositiveSectors(
    employment.sectorsTijucasAnual.map((sector) => ({ name: sector.setor, saldo: sector.saldo, value: Math.abs(sector.saldo) })),
  );
  const activeTopSectors = employmentMode === "monthly" ? topSectors : annualTopSectors;
  const topSector = activeTopSectors[0];

  const sectorChartData = employmentMode === "monthly"
    ? [...empTijucas.sectors]
        .sort((a, b) => b.saldo - a.saldo)
        .map((s) => ({ name: formatSectorName(s.name), saldo: s.saldo }))
    : [...employment.sectorsTijucasAnual]
        .sort((a, b) => b.saldo - a.saldo)
        .map((s) => ({ name: s.setor, saldo: s.saldo }));
  const sectorPositiveCount = sectorChartData.filter((s) => s.saldo > 0).length;
  const sectorNegativeCount = sectorChartData.filter((s) => s.saldo < 0).length;
  const sectorNarrative = employmentMode === "monthly"
    ? `Em ${empTijucas.latestMonth}, ${sectorPositiveCount} setor${sectorPositiveCount !== 1 ? "es" : ""} abriram mais vagas do que fecharam; ${sectorNegativeCount} registraram retração. ${sectorChartData[0]?.name ?? "—"} liderou com ${formatSigned(sectorChartData[0]?.saldo ?? 0)} vagas, seguido de ${sectorChartData[1]?.name ?? "—"} (${formatSigned(sectorChartData[1]?.saldo ?? 0)}). A concentração em poucos setores é comum em economias locais de médio porte.`
    : `No acumulado de ${employment.metadata.periodo12m}, ${sectorPositiveCount} setor${sectorPositiveCount !== 1 ? "es" : ""} geraram empregos e ${sectorNegativeCount} apresentaram retração. ${sectorChartData[0]?.name ?? "—"} foi o principal motor, com ${formatSigned(sectorChartData[0]?.saldo ?? 0)} vagas — resultado que revela onde a economia de Tijucas está crescendo de fato.`;

  const employmentKpis = [
    {
      label: employmentMode === "monthly" ? "Tijucas no mês" : "Tijucas em 12 meses",
      value: formatSigned(employmentValue),
      note: employmentMode === "monthly" ? empTijucas.latestMonth : employment.metadata.periodo12m,
      help: employmentMode === "monthly"
        ? `${employmentSourceHelp} Aqui o recorte é Tijucas no último mês disponível.`
        : `${employmentSourceHelp} Aqui o recorte é Tijucas no acumulado de 12 meses exibido.`,
    },
    {
      label: "Santa Catarina",
      value: formatSigned(scEmploymentValue),
      note: employmentMode === "monthly" ? empTijucas.latestMonth : employment.metadata.periodo12m,
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
      note: `${formatSigned(topSector?.saldo ?? 0)} vagas no período.`,
      help: `${employmentSourceHelp} Mostra o setor com maior saldo positivo (admissões menos desligamentos) no recorte selecionado.`,
    },
  ];

  const accessiblePibNarrative = pibMode === "total"
    ? `PIB mede o valor de tudo que a economia local produz em um ano — bens, serviços e renda gerada. Em 2025, Tijucas projeta ${formatMoney(tijucas.pib2025)}, com crescimento de ${growth2025_2026 != null ? decimalFormatter.format(growth2025_2026) : "—"}% previsto para 2026 — ${growth2025_2026 != null && peerAvgGrowth2025_2026 != null ? (growth2025_2026 > peerAvgGrowth2025_2026 ? "acima" : "abaixo") : "próximo"} da média dos municípios comparáveis (${peerAvgGrowth2025_2026 != null ? decimalFormatter.format(peerAvgGrowth2025_2026) : "—"}%). A cidade ocupa a ${rankWithin(peerMunicipalities, "Tijucas", (row) => row.pib2025)}ª posição entre municípios catarinenses de porte semelhante. Os valores a partir de 2025 são projeções; a área sombreada no gráfico identifica esse trecho.`
    : `PIB per capita coloca cidades de tamanhos diferentes na mesma régua: divide o que a economia produz pelo número de habitantes. Tijucas registra ${tijucasPibPc2026 ? formatPerCapita(tijucasPibPc2026) : "—"} projetado para 2026 — ${decimalFormatter.format(pibPerCapitaAverageMultiplier)}x a média dos municípios comparáveis. Isso indica uma economia concentrada em atividade produtiva acima do que o tamanho da cidade sugere. O crescimento per capita projetado é de ${growth2025_2026Pc != null ? decimalFormatter.format(growth2025_2026Pc) : "—"}%.`;
  const accessibleEmploymentNarrative = employmentMode === "monthly"
    ? `O saldo de ${formatSigned(empTijucas.monthlyBalance)} vagas em ${empTijucas.latestMonth} é a diferença entre admissões e desligamentos no mercado formal. Cada vaga positiva representa uma pessoa a mais com carteira assinada. Tijucas responde por ${decimalFormatter.format(calculateShare(employmentValue, scEmploymentValue))}% do saldo estadual do período — proporção relevante para um município de porte médio. ${topSector?.name ? `${formatSectorName(topSector.name)} foi o setor mais dinâmico no mês, com ${formatSigned(topSector.saldo)} vagas.` : ""}`
    : `No acumulado de 12 meses, Tijucas gerou ${formatSigned(empTijucas.annualBalance)} empregos formais líquidos. Esse indicador integra altas e baixas mensais, revelando a trajetória de médio prazo do mercado de trabalho local — mais informativo do que a leitura de um mês isolado. A participação de ${decimalFormatter.format(calculateShare(employmentValue, scEmploymentValue))}% no saldo estadual indica que Tijucas gera empregos acima do seu peso populacional. ${topSector?.name ? `${formatSectorName(topSector.name)} liderou a geração no período, com ${formatSigned(topSector.saldo)} vagas.` : ""}`;
  const pibSource = "PIB observado: IBGE; projeções: Observatório FIESC (2026). Coleta/consulta em 2026.";
  const employmentSource = "MTE/Novo Caged, dados de emprego formal. Coleta/consulta em 2026.";
  return (
    <section
      id="economia"
      aria-labelledby="economia-title"
      className="educacao-shell economia-shell relative overflow-hidden rounded-[32px] font-sans shadow-[0_24px_80px_rgba(3,10,34,0.24)]"
    >
      <div className="relative flex flex-col gap-10 p-6 md:p-8 xl:p-10">
        <header className="rounded-[28px] border border-blue-200 bg-[#EFF6FF] px-6 py-7 shadow-[0_18px_45px_rgba(0,127,254,0.10)] md:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">Eixo economia</p>
          <h2 id="economia-title" className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            Destaques econômicos de Tijucas
          </h2>
          <p className="mt-3 max-w-5xl text-base font-medium leading-7 text-slate-600">
            Acompanhe o crescimento do PIB local, a geração de empregos formais e a dinâmica dos setores que movem a economia de Tijucas.
          </p>
        </header>

        <section className="grid gap-5" aria-labelledby="pib-title">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                <TrendingUp size={13} strokeWidth={2.4} />
                <span>Produto interno bruto</span>
              </div>
              <h3 id="pib-title" className="mt-1 text-2xl font-extrabold text-white">PIB municipal</h3>
              <p className="mt-1 text-sm font-semibold text-slate-300">Comparação com municípios catarinenses de porte populacional parecido.</p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <ModeButton active={pibMode === "total"} onClick={() => setPibMode("total")} icon={LineChartIcon}>PIB</ModeButton>
              <ModeButton active={pibMode === "perCapita"} onClick={() => setPibMode("perCapita")} icon={LineChartIcon}>PIB per capita</ModeButton>
            </div>
          </div>

          <KpiGrid items={pibKpis} />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
            <article className="educacao-surface rounded-[24px] p-5">
              <div className="mb-4">
                <h4 className="text-base font-extrabold text-white">
                  {pibMode === "total" ? "PIB observado e projetado" : "PIB per capita observado e projetado"}
                </h4>
                <p className="text-xs font-semibold text-slate-400">Área destacada indica anos projetados.</p>
              </div>
              <div className="h-[430px] w-full">
                <PibChart data={pibChartData} rows={chartRows} mode={pibMode === "total" ? "total" : "perCapita"} />
              </div>
              <SourceLine>{pibSource}</SourceLine>
            </article>
            <NarrativeCard
              eyebrow="Leitura do gráfico"
              title={pibMode === "total" ? "Escala econômica de Tijucas" : "Comparação por habitante"}
              body={accessiblePibNarrative}
              caption={`População de referência: ${pibCitizen.metadata.populationSource}.`}
              source={pibSource}
              icon={pibMode === "total" ? TrendingUp : MapPinned}
              restartKey={`pib-${pibMode}`}
            />
          </div>
        </section>

        <section className="grid gap-5" aria-labelledby="emprego-title">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                <BriefcaseBusiness size={13} strokeWidth={2.4} />
                <span>Mercado de trabalho</span>
              </div>
              <h3 id="emprego-title" className="mt-1 text-2xl font-extrabold text-white">Emprego formal</h3>
              <p className="mt-1 text-sm font-semibold text-slate-300">Saldo de vagas formais em Tijucas no recorte MTE/CAGED.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ModeButton active={employmentMode === "monthly"} onClick={() => setEmploymentMode("monthly")} icon={BarChart3}>Mensal</ModeButton>
              <ModeButton active={employmentMode === "annual"} onClick={() => setEmploymentMode("annual")} icon={BriefcaseBusiness}>Acumulado 12 meses</ModeButton>
            </div>
          </div>

          <KpiGrid items={employmentKpis} />

          <div className="grid gap-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.6fr)]">
            <NarrativeCard
              eyebrow="Destaques do emprego"
              title={employmentMode === "monthly" ? "Ritmo recente do mercado formal" : "Tendência acumulada no período"}
              body={`${accessibleEmploymentNarrative} No recorte setorial disponível, o setor com maior saldo positivo é ${formatSectorName(topSector?.name) || "sem registro"}, com ${formatSigned(topSector?.saldo ?? 0)} vagas. Para ver o ranking dos setores, clique no card de setor com maior impacto.`}
              caption="Saldo setorial considera admissões menos desligamentos no recorte disponível."
              source={employmentSource}
              icon={BriefcaseBusiness}
              restartKey={`emprego-${employmentMode}`}
            />
            <article className="educacao-surface rounded-[24px] p-5">
              <div className="mb-4">
                <h4 className="text-base font-extrabold text-white">
                  {employmentMode === "monthly" ? "Saldo mensal de empregos" : "Saldo acumulado em 12 meses"}
                </h4>
                <p className="text-xs font-semibold text-slate-400">Tijucas, {employment.metadata.periodo12m}.</p>
              </div>
              <EmploymentChart data={employmentChartData} mode={employmentMode} />
              <SourceLine>{employmentSource}</SourceLine>
            </article>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold text-white">
                {sectorView === "ranking"
                  ? (employmentMode === "monthly" ? `Setores — ${empTijucas.latestMonth}` : `Setores — acumulado ${employment.metadata.periodo12m}`)
                  : `Dinâmica setorial — ${employment.metadata.periodo12m}`}
              </p>
              <p className="text-xs font-semibold text-slate-400">
                {sectorView === "ranking" ? "Verde = positivo · Laranja = negativo" : "Saldo acumulado por setor ao longo do período"}
              </p>
            </div>
            {employmentMode === "annual" && (
              <div className="flex items-center gap-2">
                {sectorView === "dynamics" && (
                  <SectorSelector
                    allSectors={(employment.sectorMonthlySeries ?? []).map((s) => s.setor)}
                    selected={selectedSectors}
                    onChange={setSelectedSectors}
                  />
                )}
                <ModeButton
                  active={sectorView === "dynamics"}
                  onClick={() => setSectorView((v) => (v === "dynamics" ? "ranking" : "dynamics"))}
                  icon={TrendingUp}
                >
                  Dinâmica
                </ModeButton>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
            <article className="educacao-surface rounded-[24px] p-5">
              {sectorView === "ranking" ? (
                <SectorsChart data={sectorChartData} />
              ) : (
                <SectorsDynamicsChart
                  seriesData={employment.sectorMonthlySeries ?? []}
                  periodos={empTijucas.monthly.map((m) => m.periodo)}
                  selectedSectors={selectedSectors}
                />
              )}
              <SourceLine>{employmentSource}</SourceLine>
            </article>
            <NarrativeCard
              eyebrow="Leitura setorial"
              title={sectorView === "ranking"
                ? (employmentMode === "monthly" ? "Setores que puxaram o mês" : "Setores que puxaram o período")
                : "Trajetória dos setores no período"}
              body={sectorView === "ranking" ? sectorNarrative : `A curva acumulada revela quais setores sustentaram geração de empregos ao longo dos 12 meses. ${sectorChartData[0]?.name ?? "—"} lidera o período com ${formatSigned(sectorChartData[0]?.saldo ?? 0)} vagas acumuladas. Use a lista suspensa para comparar até ${(employment.sectorMonthlySeries ?? []).length} setores.`}
              source={employmentSource}
              icon={BriefcaseBusiness}
              restartKey={`setor-${employmentMode}-${sectorView}-${selectedSectors.join()}`}
            />
          </div>
        </section>
      </div>
    </section>
  );
}







