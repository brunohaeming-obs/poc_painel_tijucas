import { Shield } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { decimalNumber } from "../../shared/lib/formatters.js";
import { HealthSectionCard, HealthToggleButton } from "./HealthSectionCard";

type VaccinationData = {
  metadata: { ultimoAno: number; referenciaCoberturaPct: number; observacao: string };
  latest: Array<{ vacina: string; cobertura: number | null; status: string }>;
  evolution: Array<{ ano: number; vacina: string; cobertura: number | null }>;
  comparisonSc: Array<{ vacina: string; tijucas: number | null; mediaSc: number | null; status: string }>;
};

const STATUS_MAP: Record<string, { color: string; bg: string; text: string; label: string }> = {
  adequada:                { color: "#16a34a", bg: "bg-green-50",  text: "text-green-700",  label: "Adequada: ≥ 95%" },
  "atenção moderada":      { color: "#d97706", bg: "bg-amber-50",  text: "text-amber-700",  label: "Atenção moderada: 90% a 94,9%" },
  atenção:                 { color: "#dc2626", bg: "bg-red-50",    text: "text-red-700",    label: "Atenção: < 90%" },
  "revisar interpretação": { color: "#7c3aed", bg: "bg-violet-50", text: "text-violet-700", label: "Revisar: > 120%" },
};

function statusColor(status: string) {
  return STATUS_MAP[status]?.color ?? "#64748B";
}

function formatPercent(value: number) {
  return `${decimalNumber.format(value)}%`;
}

export function VaccinationSection({ data }: { data: VaccinationData }) {
  const [mode, setMode] = useState<"latest" | "evolution" | "compare">("latest");
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  const evolutionRows = useMemo(() => {
    const grouped = new Map<number, Record<string, number | null>>();
    data.evolution.forEach((row) => {
      const current = grouped.get(row.ano) ?? { ano: row.ano };
      current[row.vacina] = row.cobertura;
      grouped.set(row.ano, current);
    });
    return [...grouped.values()].sort((a, b) => Number(a.ano) - Number(b.ano));
  }, [data.evolution]);

  // Ordenar por cobertura crescente (pior → melhor) no modo "último ano"
  const sortedLatest = useMemo(
    () => [...data.latest].sort((a, b) => (a.cobertura ?? 0) - (b.cobertura ?? 0)),
    [data.latest],
  );

  // Gerar insight dinâmico a partir dos dados
  const redVaccines = data.latest.filter((v) => (v.cobertura ?? 0) < 90).map((v) => v.vacina);
  const insightText =
    redVaccines.length > 0
      ? `Atenção: ${redVaccines.join(", ")} estão abaixo de 90%. Ações de busca ativa e reforço em campanhas são prioritárias para essas populações.`
      : "Todas as vacinas estão acima de 90%. Manter o ritmo de campanhas para alcançar a meta de 95%.";
  const insightBorderColor = redVaccines.length > 0 ? "#DC2626" : "#22C55E";
  const insightBg = redVaccines.length > 0 ? "bg-red-50" : "bg-green-50";

  const vaccines = data.latest.map((row) => row.vacina);

  function toggleStatus(status: string) {
    setActiveStatus((prev) => (prev === status ? null : status));
  }

  type VacNarrative = { narrativeTitle: string; narrativeHeadline: string; narrative: string; narrativeSource: string };
  const modeNarrative: Record<"latest" | "evolution" | "compare", VacNarrative> = {
    latest: {
      narrativeTitle: "COBERTURA VACINAL",
      narrativeHeadline: "Meta de 95% protege toda a comunidade, não só quem vacina",
      narrative:
        "Abaixo de 95%, o vírus ainda encontra pessoas suscetíveis suficientes para circular — inclusive quem não pode se vacinar por contraindicação médica. Cada ponto percentual abaixo da meta representa centenas de crianças ou adultos descobertos. As vacinas em vermelho (< 90%) são prioridade imediata de busca ativa e reforço de campanhas.",
      narrativeSource: "Fonte: DataSUS/TabNet · PNI (Programa Nacional de Imunizações)",
    },
    evolution: {
      narrativeTitle: "TENDÊNCIA HISTÓRICA",
      narrativeHeadline: "Recuperação pós-pandemia ainda incompleta em algumas vacinas",
      narrative:
        "A pandemia interrompeu campanhas rotineiras e reduziu a procura por serviços de saúde, derrubando coberturas no Brasil inteiro entre 2020 e 2022. A recuperação tem sido gradual e desigual — algumas vacinas voltaram ao nível pré-pandemia, outras ainda estão abaixo. Acompanhar a curva ajuda a identificar onde o esforço de retomada ainda é necessário.",
      narrativeSource: "Fonte: DataSUS/TabNet · PNI",
    },
    compare: {
      narrativeTitle: "TIJUCAS VS SANTA CATARINA",
      narrativeHeadline: "Comparar com o estado separa problemas locais de tendências gerais",
      narrative:
        "Quando Tijucas fica abaixo de SC em várias vacinas ao mesmo tempo, pode indicar barreiras de acesso ou falhas de registro específicas do município — e direciona a intervenção com muito mais precisão do que uma análise isolada. Se a queda acompanha SC, o problema é sistêmico e a solução deve vir em nível estadual.",
      narrativeSource: "Fonte: DataSUS/TabNet · PNI",
    },
  };
  const { narrativeTitle: vacNarrTitle, narrativeHeadline: vacNarrHead, narrative: vacNarr, narrativeSource: vacNarrSrc } =
    modeNarrative[mode];

  const actions = (
    <>
      <HealthToggleButton active={mode === "latest"} onClick={() => setMode("latest")}>Último ano</HealthToggleButton>
      <HealthToggleButton active={mode === "evolution"} onClick={() => setMode("evolution")}>Evolução</HealthToggleButton>
      <HealthToggleButton active={mode === "compare"} onClick={() => setMode("compare")}>Comparar</HealthToggleButton>
    </>
  );

  return (
    <HealthSectionCard
      eyebrow="Imunização preventiva"
      eyebrowIcon={Shield}
      title="Imunização"
      subtitle="Cobertura das principais vacinas no último ano disponível."
      actions={actions}
      narrativeTitle={vacNarrTitle}
      narrativeHeadline={vacNarrHead}
      narrative={vacNarr}
      narrativeSource={vacNarrSrc}
      narrativeIcon={Shield}
    >
      <div className="h-[410px] rounded-2xl border border-red-100 bg-white/75 p-3">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "evolution" ? (
            <LineChart data={evolutionRows} margin={{ top: 16, right: 18, bottom: 26, left: 8 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
              <XAxis dataKey="ano" tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 12 }} tickFormatter={(v) => `${v}%`} width={58} />
              <Tooltip formatter={(value: number, name: string) => [formatPercent(value), name]} />
              <ReferenceLine
                y={data.metadata.referenciaCoberturaPct}
                stroke="#0F766E"
                strokeDasharray="6 4"
                label={{ value: "meta 95%", position: "insideTopLeft", fill: "#475569", fontSize: 11, fontWeight: 700 }}
              />
              {vaccines.map((vacina, index) => (
                <Line
                  key={vacina}
                  type="monotone"
                  dataKey={vacina}
                  name={vacina}
                  stroke={["#EC4137", "#22C55E", "#F59E0B", "#7C3AED", "#DC2626", "#14B8A6", "#64748B", "#0F766E"][index]}
                  strokeWidth={2.4}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          ) : (
            <BarChart
              data={mode === "latest" ? sortedLatest : data.comparisonSc}
              layout="vertical"
              margin={{ top: 12, right: 26, bottom: 18, left: 118 }}
            >
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
              <XAxis type="number" tick={{ fill: "#475569", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="vacina" tick={{ fill: "#334155", fontSize: 12, fontWeight: 700 }} width={112} />
              <Tooltip formatter={(value: number, name: string) => [formatPercent(value), name]} />
              <ReferenceLine
                x={data.metadata.referenciaCoberturaPct}
                stroke="#0F766E"
                strokeDasharray="6 4"
                label={{ value: "meta 95%", position: "insideTopRight", fill: "#475569", fontSize: 11, fontWeight: 700 }}
              />
              {mode === "latest" ? (
                <Bar dataKey="cobertura" name={`Tijucas ${data.metadata.ultimoAno}`} radius={[0, 8, 8, 0]}>
                  {sortedLatest.map((row) => (
                    <Cell
                      key={row.vacina}
                      fill={statusColor(row.status)}
                      fillOpacity={activeStatus !== null && activeStatus !== row.status ? 0.2 : 1}
                    />
                  ))}
                </Bar>
              ) : (
                <>
                  <Legend />
                  <Bar dataKey="tijucas" name="Tijucas" fill="#EC4137" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="mediaSc" name="Média de SC" fill="#94A3B8" radius={[0, 8, 8, 0]} />
                </>
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chips do semáforo — interativos no modo "último ano" */}
      {mode === "latest" && (
        <div className="mt-4 grid gap-2 text-xs font-bold md:grid-cols-4">
          {Object.entries(STATUS_MAP).map(([status, { bg, text, label }]) => (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatus(status)}
              aria-pressed={activeStatus === status}
              className={`rounded-full px-3 py-2 text-left transition ${bg} ${text} ${
                activeStatus === status ? "ring-2 ring-offset-1 ring-current" : "hover:opacity-80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Insight inline */}
      <div
        className={`mt-4 rounded-xl px-4 py-3 ${insightBg}`}
        style={{ borderLeft: `4px solid ${insightBorderColor}` }}
      >
        <p className="text-sm font-semibold leading-6 text-slate-700">{insightText}</p>
      </div>
    </HealthSectionCard>
  );
}
