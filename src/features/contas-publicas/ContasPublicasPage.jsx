import {
  Banknote,
  BarChart3,
  Building2,
  Hammer,
  Info,
  Landmark,
  LineChart as LineChartIcon,
  ReceiptText,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import contasPublicasData from "./data/contas_publicas_tijucas.json";
import { TypewriterText } from "../../shared/components/TypewriterText.jsx";
import {
  brInteger as numberFormatter,
  decimalNumber as decimalFormatter,
  compactNumber as compactFormatter,
} from "../../shared/lib/formatters.js";

const colors = {
  revenue: "#71B434",
  expense: "#F2A116",
  result: "#B48A00",
  tijucas: "#007FFE",
  median: "#94A3B8",
  own: "#22C55E",
  transfer: "#38BDF8",
  fpm: "#B48A00",
  investment: "#A78BFA",
  similar: "#38BDF8",
  mesoregion: "#F2A116",
  functionPalette: ["#007FFE", "#B48A00", "#14B8A6", "#F2A116", "#A78BFA", "#71B434", "#38BDF8", "#FB7185"],
  grid: "rgba(0,0,0,0.07)",
  text: "#475569",
};

const functionIndicatorByName = {
  Saúde: "despesa_funcao_saude_per_capita",
  Educação: "despesa_funcao_educacao_per_capita",
  Urbanismo: "despesa_funcao_urbanismo_per_capita",
  Administração: "despesa_funcao_administracao_per_capita",
  "Assistência Social": "despesa_funcao_assistencia_social_per_capita",
  Saneamento: "despesa_funcao_saneamento_per_capita",
  Transporte: "despesa_funcao_transporte_per_capita",
  "Segurança Pública": "despesa_funcao_seguranca_publica_per_capita",
  "Previdência Social": "despesa_funcao_previdencia_per_capita",
};

function formatMoney(value) {
  if (value == null || Number.isNaN(Number(value))) return "dado indisponível";
  const parsed = Number(value);
  if (Math.abs(parsed) >= 1_000_000_000) return `R$ ${decimalFormatter.format(parsed / 1_000_000_000)} bi`;
  return `R$ ${decimalFormatter.format(parsed / 1_000_000)} mi`;
}

function formatPerCapita(value) {
  if (value == null || Number.isNaN(Number(value))) return "dado indisponível";
  return `R$ ${numberFormatter.format(Number(value))}/hab`;
}

function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return "dado indisponível";
  return `${decimalFormatter.format(Number(value))}%`;
}

function formatBenchmark(value, formatter) {
  return value == null ? "sem comparação" : formatter(value);
}

function InfoMark({ text }) {
  if (!text) return null;
  const paragraphs = String(text).split(/(?<=\.)\s+/).filter(Boolean);
  return (
    <span
      tabIndex={0}
      className="group relative inline-grid h-5 w-5 shrink-0 place-items-center rounded-full border border-yellow-400/50 bg-yellow-400/[0.10] text-yellow-700 outline-none transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-brand-navy focus:border-yellow-400 focus:bg-yellow-400 focus:text-brand-navy"
      aria-label="Mais informações"
    >
      <Info size={12} strokeWidth={2.6} />
      <span className="pointer-events-none absolute right-0 top-7 z-30 hidden w-[420px] max-w-[calc(100vw-32px)] rounded-2xl border border-yellow-200 bg-white p-5 text-left text-sm font-semibold leading-6 text-slate-700 shadow-2xl ring-1 ring-yellow-400/20 group-hover:block group-focus:block">
        <span className="mb-3 block text-xs font-extrabold uppercase tracking-[0.18em] text-yellow-700">Como ler este indicador</span>
        {paragraphs.map((paragraph) => (
          <span key={paragraph} className="mt-3 block border-l-2 border-yellow-300 pl-3">
            {paragraph}
          </span>
        ))}
      </span>
    </span>
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

function KpiGrid({ items, columns = "xl:grid-cols-3" }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${columns}`}>
      {items.map((item) => (
        <article key={item.label} className="educacao-surface contas-publicas-kpi-card rounded-[18px] px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
            <InfoMark text={item.help} />
          </div>
          <strong className="mt-2 block text-xl font-extrabold leading-tight text-white">{item.value}</strong>
          <span className="mt-2 block text-xs font-semibold leading-5 text-slate-300">{item.note}</span>
        </article>
      ))}
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
          <TypewriterText text={body} restartKey={restartKey ?? body} intervalMs={16} />
        </p>
      </div>
      <div>
        {caption ? <p className="mt-6 text-xs font-semibold leading-5 text-slate-400">{caption}</p> : null}
        <SourceLine>{source}</SourceLine>
      </div>
    </aside>
  );
}

function FiscalTooltip({ active, payload, label, formatter = formatMoney }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-yellow-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg">
      <strong className="text-brand-navy">{label}</strong>
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

function mergeComparisonSeries(data, comparisonRows = []) {
  const comparisonByYear = new Map(comparisonRows.map((row) => [Number(row.ano), row]));

  return data.map((row) => {
    const comparison = comparisonByYear.get(Number(row.ano)) ?? {};
    return {
      ...row,
      mediaSimilares: comparison.media_similares ?? null,
      mediaMesorregiao: comparison.media_mesorregiao ?? null,
    };
  });
}

function RevenueExpenseChart({ data, mode }) {
  const isPerCapita = mode === "perCapita";
  const rows = data.map((row) => ({
    ano: row.ano,
    receita: isPerCapita ? row.receita_per_capita : row.receita_total,
    despesa: isPerCapita ? row.despesa_per_capita : row.despesa_total,
    saldo: isPerCapita ? row.resultado_orcamentario / row.populacao : row.resultado_orcamentario,
  }));
  const formatter = isPerCapita ? formatPerCapita : formatMoney;

  return (
    <div className="h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 20, right: 24, bottom: 34, left: 18 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
          <XAxis dataKey="ano" tick={{ fill: colors.text, fontSize: 12, fontWeight: 700 }} />
          <YAxis tick={{ fill: colors.text, fontSize: 12 }} tickFormatter={(value) => `R$ ${compactFormatter.format(value)}`} width={76} />
          <Tooltip content={<FiscalTooltip formatter={formatter} />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="line"
            wrapperStyle={{ color: colors.text, fontSize: 12, fontWeight: 800, paddingTop: 16 }}
          />
          <Line type="monotone" dataKey="receita" name="Receita" stroke={colors.revenue} strokeWidth={3.4} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="despesa" name="Despesa" stroke={colors.expense} strokeWidth={3.4} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="saldo" name="Saldo" stroke={colors.result} strokeWidth={2.8} dot={{ r: 2.8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DependencyChart({ data, comparisonRows }) {
  const rows = mergeComparisonSeries(data, comparisonRows).map((row) => ({
    ano: row.ano,
    dependencia: row.fpm_pct_receita_corrente,
    mediaSimilares: row.mediaSimilares,
    mediaMesorregiao: row.mediaMesorregiao,
    fpmPorMorador: row.fpm_per_capita,
  }));

  return (
    <div className="h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 20, right: 24, bottom: 42, left: 18 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
          <XAxis dataKey="ano" tick={{ fill: colors.text, fontSize: 12, fontWeight: 700 }} />
          <YAxis tick={{ fill: colors.text, fontSize: 12 }} tickFormatter={(value) => `${decimalFormatter.format(value)}%`} width={64} />
          <Tooltip content={<FiscalTooltip formatter={formatPercent} />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="line"
            wrapperStyle={{ color: colors.text, fontSize: 12, fontWeight: 800, paddingTop: 16 }}
          />
          <Line type="monotone" dataKey="dependencia" name="Dependência do FPM" stroke={colors.fpm} strokeWidth={3.4} dot={{ r: 3 }} />
          <Line
            type="monotone"
            dataKey="mediaSimilares"
            name="Média dos similares"
            stroke={colors.similar}
            strokeWidth={2.8}
            strokeDasharray="6 4"
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="mediaMesorregiao"
            name="Média da mesorregião"
            stroke={colors.mesoregion}
            strokeWidth={2.8}
            strokeDasharray="2 5"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function InvestmentChart({ data, comparisonRows }) {
  const rows = mergeComparisonSeries(data, comparisonRows).map((row) => ({
    ano: row.ano,
    investimento: row.investimento_per_capita,
    mediaSimilares: row.mediaSimilares,
    mediaMesorregiao: row.mediaMesorregiao,
  }));

  return (
    <div className="h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 20, right: 24, bottom: 42, left: 18 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
          <XAxis dataKey="ano" tick={{ fill: colors.text, fontSize: 12, fontWeight: 700 }} />
          <YAxis tick={{ fill: colors.text, fontSize: 12 }} tickFormatter={(value) => `R$ ${compactFormatter.format(value)}`} width={76} />
          <Tooltip content={<FiscalTooltip formatter={formatPerCapita} />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="line"
            wrapperStyle={{ color: colors.text, fontSize: 12, fontWeight: 800, paddingTop: 16 }}
          />
          <Line type="monotone" dataKey="investimento" name="Investimento por morador" stroke={colors.investment} strokeWidth={3.4} dot={{ r: 3 }} />
          <Line
            type="monotone"
            dataKey="mediaSimilares"
            name="Média dos similares"
            stroke={colors.similar}
            strokeWidth={2.8}
            strokeDasharray="6 4"
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="mediaMesorregiao"
            name="Média da mesorregião"
            stroke={colors.mesoregion}
            strokeWidth={2.8}
            strokeDasharray="2 5"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function FunctionProfileChart({ rows, mode }) {
  const isPerCapita = mode === "perCapita";

  return (
    <div className="h-[410px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 18, right: 24, bottom: 34, left: 118 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
          <XAxis
            type="number"
            tick={{ fill: colors.text, fontSize: 12 }}
            tickFormatter={isPerCapita ? compactFormatter.format : (value) => `${decimalFormatter.format(value)}%`}
          />
          <YAxis type="category" dataKey="funcao" tick={{ fill: colors.text, fontSize: 12, fontWeight: 700 }} width={112} />
          <Tooltip content={<FiscalTooltip formatter={isPerCapita ? formatPerCapita : formatPercent} />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="line"
            wrapperStyle={{ color: colors.text, fontSize: 12, fontWeight: 800, paddingTop: 14 }}
          />
          <Bar dataKey={isPerCapita ? "per_capita" : "participacao_pct"} name="Tijucas" radius={[0, 8, 8, 0]}>
            {rows.map((row) => (
              <Cell key={row.funcao} fill={row.classificacao === "ponto de atencao" ? colors.expense : colors.tijucas} />
            ))}
          </Bar>
          <Bar dataKey={isPerCapita ? "mediana_per_capita" : "mediana_participacao_pct"} name="Mediana de municípios similares a Tijucas" fill={colors.median} radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function buildFunctionHistoryRows(functionNames) {
  const allowed = new Set(functionNames);
  const grouped = new Map();
  contasPublicasData.funcoes_series
    .filter((row) => allowed.has(row.funcao))
    .forEach((row) => {
      const current = grouped.get(row.ano) ?? { ano: row.ano };
      current[`${row.funcao}_per_capita`] = row.per_capita;
      current[`${row.funcao}_participacao`] = row.participacao_pct;
      grouped.set(row.ano, current);
    });
  return [...grouped.values()].sort((a, b) => a.ano - b.ano);
}

function FunctionHistoryChart({ rows, mode, functions }) {
  const isPerCapita = mode === "perCapita";
  const data = buildFunctionHistoryRows(functions.map((row) => row.funcao));
  const formatter = isPerCapita ? formatPerCapita : formatPercent;
  const suffix = isPerCapita ? "_per_capita" : "_participacao";

  return (
    <div className="h-[410px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 18, right: 24, bottom: 34, left: 18 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
          <XAxis dataKey="ano" tick={{ fill: colors.text, fontSize: 12, fontWeight: 700 }} />
          <YAxis
            tick={{ fill: colors.text, fontSize: 12 }}
            tickFormatter={isPerCapita ? compactFormatter.format : (value) => `${decimalFormatter.format(value)}%`}
            width={76}
          />
          <Tooltip content={<FiscalTooltip formatter={formatter} />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="line"
            wrapperStyle={{ color: colors.text, fontSize: 12, fontWeight: 800, paddingTop: 14 }}
          />
          {functions.map((row, index) => (
            <Line
              key={row.funcao}
              type="monotone"
              dataKey={`${row.funcao}${suffix}`}
              name={row.funcao}
              stroke={colors.functionPalette[index % colors.functionPalette.length]}
              strokeWidth={row.funcao === "Educação" || row.funcao === "Saúde" ? 3.2 : 2.6}
              dot={{ r: 2.8 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenueComposition({ latest }) {
  const own = Math.max(0, latest.receita_propria_pct_receita_corrente ?? 0);
  const transfers = Math.max(0, latest.transferencias_correntes_pct_receita_corrente ?? 0);
  const other = Math.max(0, 100 - own - transfers);
  const items = [
    { label: "Receita própria", value: own, color: colors.own },
    { label: "Transferências", value: transfers, color: colors.transfer },
    { label: "Outras receitas", value: other, color: colors.median },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid gap-4">
      <div className="h-7 overflow-hidden rounded-full border border-white/10 bg-white/10">
        <div className="flex h-full">
          {items.map((item) => (
            <span key={item.label} style={{ width: `${item.value}%`, backgroundColor: item.color }} />
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-bold text-slate-300">{item.label}</span>
            </div>
            <strong className="mt-2 block text-lg font-extrabold text-white">{formatPercent(item.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function getBenchmark(indicator) {
  return contasPublicasData.benchmark_ultimo_ano.find((item) => item.indicador === indicator);
}

function latestSeries() {
  return contasPublicasData.series[contasPublicasData.series.length - 1];
}

function buildFunctionRows() {
  return contasPublicasData.funcoes_ultimo_ano.map((row) => {
    const perCapitaBenchmark = getBenchmark(functionIndicatorByName[row.funcao]);
    const pctIndicator = functionIndicatorByName[row.funcao]?.replace("_per_capita", "_pct_despesa_total");
    const pctBenchmark = getBenchmark(pctIndicator);
    return {
      ...row,
      mediana_per_capita: perCapitaBenchmark?.mediana_similares ?? null,
      mediana_participacao_pct: pctBenchmark?.mediana_similares ?? null,
      classificacao: perCapitaBenchmark?.classificacao ?? pctBenchmark?.classificacao ?? "indisponivel",
      ranking: perCapitaBenchmark?.ranking_tijucas ?? null,
    };
  });
}

function buildSaldoText(latest, resultBenchmark) {
  if (latest.resultado_orcamentario == null) return "dado indisponível";
  if (latest.resultado_orcamentario < 0) return "saldo negativo: despesa acima da receita";
  if (resultBenchmark?.classificacao === "ponto de atencao") {
    return "saldo positivo, mas abaixo da mediana dos municípios semelhantes";
  }
  return "saldo positivo: receita acima da despesa";
}

function benchmarkNote(benchmark, formatter) {
  if (!benchmark?.mediana_similares) return "comparação indisponível";
  return `mediana de municípios similares a Tijucas: ${formatter(benchmark.mediana_similares)}`;
}

function perCapitaNote(perCapitaValue, medianaPerCapita) {
  const tijucas = formatPerCapita(perCapitaValue);
  return medianaPerCapita != null
    ? `${tijucas} · mediana similares: ${formatPerCapita(medianaPerCapita)}`
    : tijucas;
}

export function ContasPublicasPage() {
  const [fiscalMode, setFiscalMode] = useState("total");
  const [functionMode, setFunctionMode] = useState("perCapita");
  const [functionChartView, setFunctionChartView] = useState("comparison");
  const latest = latestSeries();
  const functionRows = useMemo(() => buildFunctionRows().slice(0, 8), []);

  const resultBenchmark = getBenchmark("resultado_orcamentario_pct_receita");
  const revenueBenchmark = getBenchmark("receita_total_realizada_per_capita");
  const ownRevenueBenchmark = getBenchmark("receita_propria_per_capita");
  const fpmBenchmark = getBenchmark("fpm_pct_receita_corrente");
  const fpmPerCapitaBenchmark = getBenchmark("fpm_per_capita");
  const investmentBenchmark = getBenchmark("investimentos_per_capita");
  const investmentShareBenchmark = getBenchmark("investimentos_pct_despesa_total");
  const adminRow = functionRows.find((row) => row.funcao === "Administração");
  const healthRow = functionRows.find((row) => row.funcao === "Saúde");
  const educationRow = functionRows.find((row) => row.funcao === "Educação");
  const fiscalSourceHelp = "Fonte: DCA/SICONFI 2013-2024, código IBGE 4218004 para Tijucas/SC, com coleta/consulta em 2026.";
  const fiscalPeerHelp = `Comparação feita com ${contasPublicasData.metadata.grupo_similar.quantidade} municípios de Santa Catarina com população entre 40 mil e 80 mil habitantes em 2024, excluindo Tijucas.`;
  const fpmSourceHelp = "Fonte do FPM: API de Transferências Constitucionais do Tesouro Transparente, validada pelo código IBGE 4218004, com coleta/consulta em 2026.";

  const mainKpis = [
    {
      label: "Quanto a prefeitura arrecadou",
      value: formatMoney(latest.receita_total),
      note: `${formatPerCapita(latest.receita_per_capita)} em receita por morador`,
      help: `Mostra a receita realizada no ano, ou seja, o dinheiro que entrou no orçamento. ${fiscalSourceHelp}`,
    },
    {
      label: "Quanto a prefeitura gastou",
      value: formatMoney(latest.despesa_total),
      note: `${formatPerCapita(latest.despesa_per_capita)} em gasto por morador`,
      help: `Mostra a despesa empenhada no ano, ou seja, o valor que a prefeitura assumiu como compromisso no orçamento. ${fiscalSourceHelp}`,
    },
    {
      label: "Saldo do ano",
      value: formatMoney(latest.resultado_orcamentario),
      note: buildSaldoText(latest, resultBenchmark),
      help: `É a receita menos a despesa empenhada. Saldo positivo indica receita acima da despesa no ano. ${fiscalPeerHelp}`,
    },
    {
      label: "Receita própria",
      value: formatMoney(latest.receita_propria),
      note: perCapitaNote(latest.receita_propria_per_capita, ownRevenueBenchmark?.mediana_similares),
      help: `Mostra quanto Tijucas arrecada localmente — tributos, contribuições e outras receitas próprias, sem contar transferências. ${fiscalSourceHelp} ${fiscalPeerHelp}`,
    },
    {
      label: "Dependência do FPM",
      value: formatPercent(latest.fpm_pct_receita_corrente),
      note: benchmarkNote(fpmBenchmark, formatPercent),
      help: `Mostra quanto da receita corrente vem do Fundo de Participação dos Municípios. Quanto maior, maior a dependência de repasses federais. ${fpmSourceHelp} ${fiscalPeerHelp}`,
    },
    {
      label: "Investimento total",
      value: formatMoney(latest.investimento_total),
      note: perCapitaNote(latest.investimento_per_capita, investmentBenchmark?.mediana_similares),
      help: `Mostra quanto foi destinado a obras, equipamentos e melhorias permanentes. ${fiscalSourceHelp} ${fiscalPeerHelp}`,
    },
  ];

  const sourceKpis = [
    {
      label: "Dependência do FPM",
      value: formatPercent(latest.fpm_pct_receita_corrente),
      note: `${formatMoney(latest.fpm)} vindos do FPM em ${latest.ano}`,
      help: `O FPM é uma transferência do Governo Federal. O indicador divide FPM pela receita corrente para medir dependência. ${fpmSourceHelp}`,
    },
    {
      label: "Receita própria",
      value: formatMoney(latest.receita_propria),
      note: perCapitaNote(latest.receita_propria_per_capita, ownRevenueBenchmark?.mediana_similares),
      help: `Mostra quanto Tijucas arrecada localmente — tributos, contribuições e outras receitas próprias, sem contar transferências. ${fiscalSourceHelp} ${fiscalPeerHelp}`,
    },
    {
      label: "Repasse do FPM",
      value: formatMoney(latest.fpm),
      note: perCapitaNote(latest.fpm_per_capita, fpmPerCapitaBenchmark?.mediana_similares),
      help: `Mostra o valor total recebido do Fundo de Participação dos Municípios. ${fpmSourceHelp} ${fiscalPeerHelp}`,
    },
  ];

  const functionKpis = [
    {
      label: "Maior área do orçamento",
      value: functionRows[0]?.funcao ?? "dado indisponível",
      note: `${formatPercent(functionRows[0]?.participacao_pct)} da despesa total`,
      help: `Mostra a função de governo com maior despesa empenhada no ano. As funções vêm da DCA/SICONFI, Anexo de despesa por função. ${fiscalSourceHelp}`,
    },
    {
      label: "Educação",
      value: formatMoney(educationRow?.valor),
      note: educationRow ? perCapitaNote(educationRow.per_capita, educationRow.mediana_per_capita) : "dado indisponível",
      help: `Educação reúne gastos registrados na função educação — ${formatPercent(educationRow?.participacao_pct)} da despesa total em ${latest.ano}. ${fiscalPeerHelp}`,
    },
    {
      label: "Saúde",
      value: formatMoney(healthRow?.valor),
      note: healthRow ? perCapitaNote(healthRow.per_capita, healthRow.mediana_per_capita) : "dado indisponível",
      help: `Saúde reúne gastos registrados na função saúde — ${formatPercent(healthRow?.participacao_pct)} da despesa total em ${latest.ano}. ${fiscalSourceHelp} ${fiscalPeerHelp}`,
    },
    {
      label: "Administração",
      value: formatPercent(adminRow?.participacao_pct),
      note: "custo da estrutura pública",
      help: `Mostra o peso da função administração na despesa total. É gasto de manutenção da estrutura pública e deve ser lido junto com áreas finalísticas. ${fiscalPeerHelp}`,
    },
  ];

  const investmentKpis = [
    {
      label: "Investimento total",
      value: formatMoney(latest.investimento_total),
      note: perCapitaNote(latest.investimento_per_capita, investmentBenchmark?.mediana_similares),
      help: `Mostra o valor total empenhado como investimento em obras, equipamentos e melhorias permanentes. ${fiscalSourceHelp} ${fiscalPeerHelp}`,
    },
    {
      label: "% da despesa total",
      value: formatPercent(latest.investimento_pct_despesa),
      note: benchmarkNote(investmentShareBenchmark, formatPercent),
      help: `Mostra investimentos divididos pela despesa total empenhada. Ajuda a separar manutenção de serviços e melhorias permanentes. ${fiscalPeerHelp}`,
    },
    {
      label: "% da receita corrente",
      value: formatPercent(latest.investimento_pct_receita),
      note: `${formatMoney(latest.investimento_total)} empenhados em ${latest.ano}`,
      help: `Mostra quanto da receita corrente foi convertido em investimento no ano. ${fiscalSourceHelp}`,
    },
  ];

  const fiscalNarrative =
    fiscalMode === "total"
      ? latest.resultado_orcamentario >= 0
        ? `Em ${latest.ano}, Tijucas arrecadou ${formatMoney(latest.receita_total)} e gastou ${formatMoney(latest.despesa_total)}. O saldo foi positivo em ${formatMoney(latest.resultado_orcamentario)}, ou seja, a prefeitura arrecadou mais do que gastou no ano. Esse é um bom sinal de equilíbrio, mas deve ser lido junto com investimento, serviços e contas que ficam para os anos seguintes.`
        : `Em ${latest.ano}, Tijucas arrecadou ${formatMoney(latest.receita_total)} e gastou ${formatMoney(latest.despesa_total)}. O saldo foi negativo em ${formatMoney(Math.abs(latest.resultado_orcamentario))}, ou seja, a despesa ficou acima da receita. Isso merece atenção porque pode pressionar o orçamento do ano seguinte.`
      : `Por morador, Tijucas arrecadou ${formatPerCapita(latest.receita_per_capita)} e gastou ${formatPerCapita(latest.despesa_per_capita)}. Essa leitura coloca cidades de tamanhos diferentes na mesma régua. Na receita por morador, Tijucas ficou ${revenueBenchmark?.classificacao ?? "sem comparação disponível"} frente aos municípios semelhantes.`;

  const sourceNarrative = `Tijucas arrecada relativamente bem por conta própria: em ${latest.ano}, a receita própria totalizou ${formatMoney(latest.receita_propria)} (${formatPerCapita(latest.receita_propria_per_capita)}, acima da mediana dos municípios semelhantes). Ainda assim, ${formatPercent(latest.transferencias_correntes_pct_receita_corrente)} da receita corrente veio de transferências, grupo que inclui o FPM. O repasse do FPM foi de ${formatMoney(latest.fpm)}, representando ${formatPercent(latest.fpm_pct_receita_corrente)} da receita corrente — peso relevante, mas próximo do padrão de cidades parecidas.`;

  const functionNarrative =
    functionMode === "perCapita"
      ? `Em ${latest.ano}, educação recebeu ${formatMoney(educationRow?.valor)} (${formatPerCapita(educationRow?.per_capita)}) e saúde recebeu ${formatMoney(healthRow?.valor)} (${formatPerCapita(healthRow?.per_capita)}). O orçamento está concentrado nas áreas essenciais — educação, saúde e urbanismo reúnem serviços diretos e infraestrutura da cidade. A leitura por morador permite comparar Tijucas com municípios de porte semelhante.`
      : `A participação mostra para onde vai o orçamento. Educação representa ${formatPercent(educationRow?.participacao_pct)} da despesa total e saúde representa ${formatPercent(healthRow?.participacao_pct)}. Administração mostra o custo de manter a estrutura pública funcionando; ela deve ser lida junto das áreas finalísticas, não isoladamente.`;

  const investmentNarrative = `Em ${latest.ano}, Tijucas investiu ${formatMoney(latest.investimento_total)} em obras, equipamentos e melhorias permanentes — equivalente a ${formatPerCapita(latest.investimento_per_capita)}, acima da mediana dos municípios semelhantes. O investimento representou ${formatPercent(latest.investimento_pct_despesa)} da despesa total, indicando boa capacidade de transformar orçamento em melhoria real para a cidade.`;

  const openingNarrative = `Em ${latest.ano}, Tijucas arrecadou ${formatMoney(latest.receita_total)} e gastou ${formatMoney(latest.despesa_total)}, fechando o ano com ${buildSaldoText(latest, resultBenchmark)}. A receita própria totalizou ${formatMoney(latest.receita_propria)}, mas a maior parte da receita corrente ainda vem de transferências. O investimento de ${formatMoney(latest.investimento_total)} ficou acima da mediana dos municípios catarinenses semelhantes.`;
  const dcaSource = "DCA/SICONFI, contas anuais municipais 2013-2024. Coleta/consulta em 2026.";
  const fpmSource = "STN/Tesouro Transparente, API de Transferências Constitucionais/FPM 2026; DCA/SICONFI 2013-2024. Coleta/consulta em 2026.";
  const functionSource = "DCA/SICONFI, despesa por função 2013-2024. Coleta/consulta em 2026.";

  return (
    <section
      id="contas-publicas"
      aria-labelledby="contas-publicas-title"
      className="educacao-shell contas-publicas-shell relative overflow-hidden rounded-[32px] font-sans shadow-[0_24px_80px_rgba(3,10,34,0.24)]"
    >
      <div className="relative flex flex-col gap-10 p-6 md:p-8 xl:p-10">
        <header className="rounded-[28px] border border-yellow-200 bg-[#FEFCE8] px-6 py-7 shadow-[0_18px_45px_rgba(252,212,24,0.15)] md:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Eixo contas públicas</p>
          <h2 id="contas-publicas-title" className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            Entendendo as contas públicas de Tijucas
          </h2>
          <p className="mt-3 max-w-5xl text-base font-medium leading-7 text-slate-600">
            <TypewriterText text={openingNarrative} restartKey={`abertura-contas-${latest.ano}`} intervalMs={15} />
          </p>
        </header>

        <KpiGrid items={mainKpis} columns="xl:grid-cols-6" />

        <section className="grid gap-5" aria-labelledby="arrecada-gasta-title">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                <Banknote size={13} strokeWidth={2.4} />
                <span>Receita e despesa</span>
              </div>
              <h3 id="arrecada-gasta-title" className="mt-1 text-2xl font-extrabold text-white">Quanto a prefeitura arrecada e gasta?</h3>
              <p className="mt-1 text-sm font-semibold text-slate-300">Receita, despesa e saldo do ano em uma mesma série histórica.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ModeButton active={fiscalMode === "total"} onClick={() => setFiscalMode("total")} icon={LineChartIcon}>Total</ModeButton>
              <ModeButton active={fiscalMode === "perCapita"} onClick={() => setFiscalMode("perCapita")} icon={ReceiptText}>Por morador</ModeButton>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
            <article className="educacao-surface contas-publicas-chart-card rounded-[24px] p-5">
              <div className="mb-4">
                <h4 className="text-base font-extrabold text-white">Receita, despesa e saldo</h4>
                <p className="text-xs font-semibold text-slate-400">Valores nominais da DCA. Termos técnicos ficam na metodologia.</p>
              </div>
              <RevenueExpenseChart data={contasPublicasData.series} mode={fiscalMode} />
              <SourceLine>{dcaSource}</SourceLine>
            </article>
            <NarrativeCard
              eyebrow="Leitura cidadã"
              title={fiscalMode === "total" ? "Tamanho do orçamento" : "Comparação por morador"}
              body={fiscalNarrative}
              caption={contasPublicasData.metadata.grupo_similar.criterio}
              source={dcaSource}
              icon={Banknote}
              restartKey={`fiscal-${fiscalMode}`}
            />
          </div>
        </section>

        <section className="grid gap-5" aria-labelledby="origem-dinheiro-title">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              <Building2 size={13} strokeWidth={2.4} />
              <span>Origem da receita</span>
            </div>
            <h3 id="origem-dinheiro-title" className="mt-1 text-2xl font-extrabold text-white">De onde vem o dinheiro?</h3>
            <p className="mt-1 text-sm font-semibold text-slate-300">Receita própria, transferências e dependência do FPM.</p>
          </div>

          <KpiGrid items={sourceKpis} />

          <div className="grid gap-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.6fr)]">
            <NarrativeCard
              eyebrow="Origem da receita"
              title="Gera localmente ou depende de repasses?"
              body={sourceNarrative}
              caption={`FPM por morador em Tijucas: ${formatPerCapita(latest.fpm_per_capita)}. Mediana de municípios similares a Tijucas: ${formatBenchmark(fpmPerCapitaBenchmark?.mediana_similares, formatPerCapita)}.`}
              source={fpmSource}
              icon={Building2}
              restartKey="origem-receita"
            />
            <article className="educacao-surface contas-publicas-chart-card rounded-[24px] p-5">
              <div className="mb-5">
                <h4 className="text-base font-extrabold text-white">Participação do FPM na receita</h4>
                <p className="text-xs font-semibold text-slate-400">FPM dividido pela receita corrente. Quanto maior, maior a dependência federal.</p>
              </div>
              <DependencyChart
                data={contasPublicasData.series}
                comparisonRows={contasPublicasData.comparativos_series?.indicadores?.fpm_pct_receita_corrente}
              />
              <div className="mt-6">
                <h5 className="mb-3 text-sm font-extrabold text-white">Composição simples da receita corrente em {latest.ano}</h5>
                <RevenueComposition latest={latest} />
              </div>
              <SourceLine>{fpmSource}</SourceLine>
            </article>
          </div>
        </section>

        <section className="grid gap-5" aria-labelledby="destino-dinheiro-title">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                <Landmark size={13} strokeWidth={2.4} />
                <span>Destino dos recursos</span>
              </div>
              <h3 id="destino-dinheiro-title" className="mt-1 text-2xl font-extrabold text-white">Para onde vai o dinheiro?</h3>
              <p className="mt-1 text-sm font-semibold text-slate-300">Perfil da despesa por função e comparação com municípios semelhantes.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ModeButton active={functionMode === "perCapita"} onClick={() => setFunctionMode("perCapita")} icon={BarChart3}>Por morador</ModeButton>
              <ModeButton active={functionMode === "share"} onClick={() => setFunctionMode("share")} icon={Landmark}>Participação</ModeButton>
            </div>
          </div>

          <KpiGrid items={functionKpis} columns="xl:grid-cols-4" />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
            <article className="educacao-surface contas-publicas-chart-card rounded-[24px] p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    {functionChartView === "history"
                      ? functionMode === "perCapita"
                        ? "Série histórica do gasto por morador"
                        : "Série histórica da participação"
                      : functionMode === "perCapita"
                        ? "Gasto por área por morador"
                        : "Peso de cada área na despesa"}
                  </h4>
                  <p className="text-xs font-semibold text-slate-400">
                    {functionChartView === "history"
                      ? "Evolução anual de Tijucas por função, 2013 a 2024."
                      : `Tijucas comparada à mediana dos municípios similares, ${latest.ano}.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFunctionChartView((current) => (current === "history" ? "comparison" : "history"))}
                  className="self-start rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-extrabold text-slate-100 transition hover:border-brand-yellow/60 hover:bg-white/10"
                >
                  {functionChartView === "history" ? "Ver comparação" : "Ver série histórica"}
                </button>
              </div>
              {functionChartView === "history" ? (
                <FunctionHistoryChart rows={contasPublicasData.funcoes_series} mode={functionMode} functions={functionRows} />
              ) : (
                <FunctionProfileChart rows={functionRows} mode={functionMode} />
              )}
              <SourceLine>{functionSource}</SourceLine>
            </article>
            <NarrativeCard
              eyebrow="Prioridades do gasto"
              title={functionMode === "perCapita" ? "Quanto cada área recebe por morador" : "Quais áreas pesam mais"}
              body={functionNarrative}
              caption="Comparar com cidades de porte parecido evita distorções causadas por municípios muito pequenos ou muito grandes."
              source={functionSource}
              icon={Landmark}
              restartKey={`funcoes-${functionMode}`}
            />
          </div>
        </section>

        <section className="grid gap-5" aria-labelledby="futuro-title">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              <Hammer size={13} strokeWidth={2.4} />
              <span>Capacidade de investimento</span>
            </div>
            <h3 id="futuro-title" className="mt-1 text-2xl font-extrabold text-white">Quanto vira futuro?</h3>
            <p className="mt-1 text-sm font-semibold text-slate-300">Investimento em obras, equipamentos e melhorias permanentes.</p>
          </div>

          <KpiGrid items={investmentKpis} />

          <div className="grid gap-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.6fr)]">
            <NarrativeCard
              eyebrow="Capacidade de investimento"
              title="Manter serviços e criar melhorias"
              body={investmentNarrative}
              caption={`O índice fiscal sintético foi movido para leitura secundária: ${decimalFormatter.format(contasPublicasData.cards.find((card) => card.indicador === "indice_saude_fiscal_municipal")?.valor ?? 0)}/100 frente ao grupo similar.`}
              source={dcaSource}
              icon={Hammer}
              restartKey="investimento"
            />
            <article className="educacao-surface contas-publicas-chart-card rounded-[24px] p-5">
              <div className="mb-4">
                <h4 className="text-base font-extrabold text-white">Investimento por morador</h4>
                <p className="text-xs font-semibold text-slate-400">Série histórica nominal. Mostra a parcela voltada a melhorias permanentes.</p>
              </div>
              <InvestmentChart
                data={contasPublicasData.series}
                comparisonRows={contasPublicasData.comparativos_series?.indicadores?.investimentos_per_capita}
              />
              <SourceLine>{dcaSource}</SourceLine>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}
