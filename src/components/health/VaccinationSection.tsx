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

const statusColors: Record<string, string> = {
  adequada: "#22C55E",
  "atenção moderada": "#F59E0B",
  atenção: "#DC2626",
  "revisar interpretação": "#7C3AED",
};

function statusColor(status: string) {
  return statusColors[status] ?? "#64748B";
}

function formatPercent(value: number) {
  return `${decimalNumber.format(value)}%`;
}

export function VaccinationSection({ data }: { data: VaccinationData }) {
  const [mode, setMode] = useState<"latest" | "evolution" | "compare">("latest");

  const evolutionRows = useMemo(() => {
    const grouped = new Map<number, Record<string, number | null>>();
    data.evolution.forEach((row) => {
      const current = grouped.get(row.ano) ?? { ano: row.ano };
      current[row.vacina] = row.cobertura;
      grouped.set(row.ano, current);
    });
    return [...grouped.values()].sort((a, b) => Number(a.ano) - Number(b.ano));
  }, [data.evolution]);

  const vaccines = data.latest.map((row) => row.vacina);
  const actions = (
    <>
      <HealthToggleButton active={mode === "latest"} onClick={() => setMode("latest")}>Último ano</HealthToggleButton>
      <HealthToggleButton active={mode === "evolution"} onClick={() => setMode("evolution")}>Evolução</HealthToggleButton>
      <HealthToggleButton active={mode === "compare"} onClick={() => setMode("compare")}>Comparar</HealthToggleButton>
    </>
  );

  return (
    <HealthSectionCard
      title="3. Imunização"
      subtitle="Cobertura das principais vacinas no último ano disponível."
      actions={actions}
      narrativeTitle="Onde é preciso atenção"
      narrative="A maior parte das vacinas selecionadas deve ser lida em relação à referência de cobertura. Vacinas abaixo da referência podem indicar necessidade de busca ativa, reforço em campanhas e comunicação com a população."
    >
      <div className="h-[410px] rounded-2xl border border-red-100 bg-white/75 p-3">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "evolution" ? (
            <LineChart data={evolutionRows} margin={{ top: 16, right: 18, bottom: 26, left: 8 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
              <XAxis dataKey="ano" tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 12 }} tickFormatter={(value) => `${value}%`} width={58} />
              <Tooltip formatter={(value: number, name: string) => [formatPercent(value), name]} />
              <ReferenceLine y={data.metadata.referenciaCoberturaPct} stroke="#0F766E" strokeDasharray="6 4" label="95%" />
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
              data={mode === "latest" ? data.latest : data.comparisonSc}
              layout="vertical"
              margin={{ top: 12, right: 26, bottom: 18, left: 118 }}
            >
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
              <XAxis type="number" tick={{ fill: "#475569", fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
              <YAxis type="category" dataKey="vacina" tick={{ fill: "#334155", fontSize: 12, fontWeight: 700 }} width={112} />
              <Tooltip formatter={(value: number, name: string) => [formatPercent(value), name]} />
              <ReferenceLine x={data.metadata.referenciaCoberturaPct} stroke="#0F766E" strokeDasharray="6 4" label="95%" />
              {mode === "latest" ? (
                <Bar dataKey="cobertura" name={`Tijucas ${data.metadata.ultimoAno}`} radius={[0, 8, 8, 0]}>
                  {data.latest.map((row) => (
                    <Cell key={row.vacina} fill={statusColor(row.status)} />
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
      {mode === "latest" ? (
        <div className="mt-4 grid gap-2 text-xs font-bold text-slate-600 md:grid-cols-4">
          <span className="rounded-full bg-green-50 px-3 py-2 text-green-700">Adequada: ≥ 95%</span>
          <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700">Atenção moderada: 90% a 94,9%</span>
          <span className="rounded-full bg-red-50 px-3 py-2 text-red-700">Atenção: &lt; 90%</span>
          <span className="rounded-full bg-violet-50 px-3 py-2 text-violet-700">Revisar: &gt; 120%</span>
        </div>
      ) : null}
    </HealthSectionCard>
  );
}
