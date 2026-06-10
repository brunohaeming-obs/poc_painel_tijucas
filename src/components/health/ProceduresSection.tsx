import { Activity } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { brInteger, decimalNumber } from "../../shared/lib/formatters.js";
import { HealthSectionCard, HealthToggleButton } from "./HealthSectionCard";

type Benchmark = { valor: number; descricao: string; fonte: string };

type ProceduresData = {
  summary: {
    ultimoValor?: number | null;
    variacaoMensalPct: number | null;
    mediaUltimos12Meses: number | null;
    participacaoScPct: number | null;
    atendPorMilHabAtual?: number | null;
    atendPorMilHabScAtual?: number | null;
    benchmarkMunicipios5070k?: Benchmark | null;
  };
  series: Array<Record<string, number | string | null>>;
};

type Mode = "compare" | "absolute" | "moving";

function MicroCard({
  label,
  value,
  context,
  contextColor,
}: {
  label: string;
  value: string;
  context?: string;
  contextColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-red-100 bg-[#FFF5F4] px-4 py-3">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <strong className="mt-1 block text-xl font-extrabold text-slate-950">{value}</strong>
      {context && (
        <p className="mt-0.5 text-[11px] font-semibold" style={{ color: contextColor ?? "#64748B" }}>
          {context}
        </p>
      )}
    </div>
  );
}

function tooltipFormatter(value: number, name: string) {
  if (name.includes("mil hab")) return [`${decimalNumber.format(value)} / mil hab.`, name];
  return [brInteger.format(value), name];
}

export function ProceduresSection({ data }: { data: ProceduresData }) {
  const [mode, setMode] = useState<Mode>("compare");

  const lastPeriod = (data.series[data.series.length - 1]?.periodo as string) ?? "—";
  const variacaoPct = data.summary.variacaoMensalPct ?? 0;
  const ultimoValor =
    data.summary.ultimoValor ??
    (data.series[data.series.length - 1]?.procedimentosTijucas as number | null) ??
    0;

  const benchmark = data.summary.benchmarkMunicipios5070k;
  const atendPerMilAtual = data.summary.atendPorMilHabAtual ?? 0;
  const atendPerMilSc = data.summary.atendPorMilHabScAtual ?? 0;
  const benchmarkValor = benchmark?.valor ?? 0;
  const vsBenchmarkPct = benchmarkValor > 0 ? ((atendPerMilAtual - benchmarkValor) / benchmarkValor) * 100 : null;

  type NarrativeMode = {
    title: string;
    subtitle: string;
    insight: string;
    narrativeTitle: string;
    narrativeHeadline: string;
    narrative: string;
    narrativeSource?: string;
  };

  const modeConfig: Record<Mode, NarrativeMode> = {
    compare: {
      title: "Atendimento realizado",
      subtitle: "Atendimentos por mil habitantes · Tijucas, municípios similares e média SC",
      insight:
        vsBenchmarkPct !== null && vsBenchmarkPct < 0
          ? `Tijucas registra ${decimalNumber.format(atendPerMilAtual)} atendimentos por mil habitantes — ${decimalNumber.format(Math.abs(vsBenchmarkPct))}% abaixo da mediana do grupo de municípios similares (${decimalNumber.format(benchmarkValor)}/mil hab.). A diferença é pequena e pode refletir sazonalidade ou perfil de oferta local.`
          : `Tijucas registra ${decimalNumber.format(atendPerMilAtual)} atendimentos por mil habitantes — acima da mediana do grupo de municípios similares (${decimalNumber.format(benchmarkValor)}/mil hab.). A média estadual é maior porque inclui serviços especializados de referência regional.`,
      narrativeTitle: "COMPARAÇÃO DE PARES",
      narrativeHeadline: "Como Tijucas se posiciona entre municípios de mesmo porte",
      narrative:
        `Normalizar pelo número de habitantes elimina o efeito do tamanho das cidades. A linha laranja representa a mediana estimada de ${benchmark?.municipios?.join(", ") ?? "municípios SC 50–80k hab."} — o grupo mais comparável a Tijucas. O cálculo usa população real do IBGE e per-capita estadual ajustado pelo perfil de atenção primária. A média SC (linha verde-água) é mais alta porque inclui alta complexidade feita em hospitais de referência.`,
      narrativeSource: `Fonte: ${benchmark?.fonte ?? "IBGE + DataSUS/SIA"}`,
    },
    absolute: {
      title: "Atendimento realizado",
      subtitle: "Volume mensal de atendimentos ambulatoriais · DataSUS/SIA",
      insight: `O último mês registrou ${brInteger.format(ultimoValor)} atendimentos. A variação de ${decimalNumber.format(variacaoPct)}% em relação ao mês anterior é pontual — acompanhe nos próximos meses para confirmar tendência.`,
      narrativeTitle: "O QUE ESTÁ SENDO CONTADO",
      narrativeHeadline: "Todos os atendimentos ambulatoriais registrados no SUS",
      narrative:
        "Inclui consultas, exames e pequenos procedimentos realizados nos estabelecimentos do município. O número é afetado por sazonalidade, campanhas de vacinação e variações de oferta. Comparar meses equivalentes do ano anterior reduz o ruído sazonal.",
      narrativeSource: "Fonte: DataSUS/SIA",
    },
    moving: {
      title: "Atendimento realizado",
      subtitle: "Tendência de longo prazo via média móvel de 3 meses",
      insight:
        "A média móvel confirma a tendência de crescimento em Tijucas. Santa Catarina mostra estabilidade. A divergência crescente pode exigir reforço na capacidade instalada local.",
      narrativeTitle: "LEITURA DA TENDÊNCIA",
      narrativeHeadline: "O crescimento é real, não é ruído sazonal",
      narrative:
        "A média dos últimos 3 meses suaviza campanhas pontuais e fechamentos temporários, revelando a direção estrutural da demanda. Quando a linha de Tijucas sobe de forma consistente — mesmo após a suavização — é sinal de pressão crescente sobre a rede, não de variação aleatória.",
      narrativeSource: "Fonte: DataSUS/SIA",
    },
  };

  const { title, subtitle, insight, narrativeTitle, narrativeHeadline, narrative, narrativeSource } = modeConfig[mode];

  const actions = (
    <>
      <HealthToggleButton active={mode === "compare"} onClick={() => setMode("compare")}>Comparação</HealthToggleButton>
      <HealthToggleButton active={mode === "absolute"} onClick={() => setMode("absolute")}>Volume mensal</HealthToggleButton>
      <HealthToggleButton active={mode === "moving"} onClick={() => setMode("moving")}>Tendência</HealthToggleButton>
    </>
  );

  return (
    <HealthSectionCard
      eyebrow="Atenção ambulatorial"
      eyebrowIcon={Activity}
      title={title}
      subtitle={subtitle}
      actions={actions}
      narrativeTitle={narrativeTitle}
      narrativeHeadline={narrativeHeadline}
      narrative={narrative}
      narrativeSource={narrativeSource}
      narrativeIcon={Activity}
    >
      {/* KPIs — adaptam por modo */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {mode === "compare" ? (
          <>
            <MicroCard
              label={`Tijucas por mil hab. (${lastPeriod})`}
              value={`${decimalNumber.format(atendPerMilAtual)}`}
              context="atendimentos por mês / mil hab."
            />
            <MicroCard
              label="Média SC por mil hab."
              value={`${decimalNumber.format(atendPerMilSc)}`}
              context="inclui serviços de referência regional"
            />
            <MicroCard
              label="Diferença vs municípios de porte similar"
              value={benchmarkValor > 0
                ? `${atendPerMilAtual >= benchmarkValor ? "+" : ""}${decimalNumber.format(Math.round(atendPerMilAtual - benchmarkValor))} / mil hab.`
                : "—"}
              context={`Tijucas: ${decimalNumber.format(atendPerMilAtual)} · Mediana grupo: ${decimalNumber.format(benchmarkValor)}`}
              contextColor={vsBenchmarkPct !== null && vsBenchmarkPct >= 0 ? "#15803D" : "#DC2626"}
            />
          </>
        ) : (
          <>
            <MicroCard
              label={`Atendimentos em ${lastPeriod}`}
              value={brInteger.format(ultimoValor)}
              context={`${variacaoPct >= 0 ? "+" : ""}${decimalNumber.format(variacaoPct)}% em relação ao mês anterior`}
              contextColor={variacaoPct >= 0 ? "#15803D" : "#DC2626"}
            />
            <MicroCard
              label="Média mensal (últimos 12 meses)"
              value={brInteger.format(data.summary.mediaUltimos12Meses ?? 0)}
              context="atendimentos por mês"
            />
            <MicroCard
              label="Representatividade no estado"
              value={`${decimalNumber.format(data.summary.participacaoScPct ?? 0)}%`}
              context="dos atendimentos ambulatoriais de SC"
            />
          </>
        )}
      </div>

      {/* Legenda inline */}
      <div className="mb-2 flex flex-wrap gap-5">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-5 rounded-full bg-[#EC4137]" />
          <span className="text-xs font-semibold text-slate-500">Tijucas</span>
        </span>
        {mode === "compare" && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5" style={{ height: 0, borderTop: "2.5px dashed #F59E0B" }} />
              <span className="text-xs font-semibold text-slate-500">Municípios similares SC</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5" style={{ height: 0, borderTop: "2.5px dashed #14B8A6" }} />
              <span className="text-xs font-semibold text-slate-500">Média SC</span>
            </span>
          </>
        )}
        {mode === "moving" && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5" style={{ height: 0, borderTop: "2.5px dashed #14B8A6" }} />
              <span className="text-xs font-semibold text-slate-500">Santa Catarina</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-[3px] w-5 rounded-full bg-[#94A3B8]" />
              <span className="text-xs font-semibold text-slate-500">Valores mensais</span>
            </span>
          </>
        )}
      </div>

      {/* Gráfico */}
      <div className="h-[320px] rounded-2xl border border-red-100 bg-white/75 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.series} margin={{ top: 12, right: 24, bottom: 12, left: 8 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="periodo" tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} width={70} />
            <Tooltip formatter={tooltipFormatter} labelStyle={{ fontWeight: 800 }} />
            {mode === "compare" ? (
              <>
                <Line
                  type="monotone"
                  dataKey="medianaGrupoAtendMilHab"
                  name="Municípios similares SC"
                  stroke="#F59E0B"
                  strokeWidth={2.2}
                  strokeDasharray="5 3"
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="atendPorMilHabTijucas"
                  name="Tijucas (por mil hab)"
                  stroke="#EC4137"
                  strokeWidth={3.2}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="atendPorMilHabSc"
                  name="Média SC (por mil hab)"
                  stroke="#14B8A6"
                  strokeWidth={2.4}
                  strokeDasharray="6 3"
                  dot={false}
                  connectNulls
                />
              </>
            ) : mode === "absolute" ? (
              <Line
                type="monotone"
                dataKey="procedimentosTijucas"
                name="Atendimentos Tijucas"
                stroke="#EC4137"
                strokeWidth={3.2}
                dot={{ r: 2.5 }}
              />
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="procedimentosTijucas"
                  name="Atendimentos Tijucas"
                  stroke="#94A3B8"
                  strokeWidth={2.2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="mediaMovel3"
                  name="Média móvel 3 meses"
                  stroke="#EC4137"
                  strokeWidth={3.2}
                  dot={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insight inline */}
      <div className="mt-4 rounded-xl border-l-4 border-[#EC4137] bg-red-50 px-4 py-3">
        <p className="text-sm font-semibold leading-6 text-slate-700">{insight}</p>
      </div>
    </HealthSectionCard>
  );
}
