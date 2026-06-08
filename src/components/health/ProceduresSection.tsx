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

type ProceduresData = {
  summary: {
    variacaoMensalPct: number | null;
    mediaUltimos12Meses: number | null;
    participacaoScPct: number | null;
  };
  series: Array<Record<string, number | string | null>>;
};

function MicroCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-[#FFF5F4] px-4 py-3">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <strong className="mt-1 block text-lg font-extrabold text-slate-950">{value}</strong>
    </div>
  );
}

function tooltipFormatter(value: number, name: string) {
  if (name.includes("Índice")) return [decimalNumber.format(value), name];
  return [brInteger.format(value), name];
}

export function ProceduresSection({ data }: { data: ProceduresData }) {
  const [mode, setMode] = useState<"index" | "absolute" | "moving">("index");

  const actions = (
    <>
      <HealthToggleButton active={mode === "index"} onClick={() => setMode("index")}>Índice</HealthToggleButton>
      <HealthToggleButton active={mode === "absolute"} onClick={() => setMode("absolute")}>Valor absoluto</HealthToggleButton>
      <HealthToggleButton active={mode === "moving"} onClick={() => setMode("moving")}>Média móvel</HealthToggleButton>
    </>
  );

  return (
    <HealthSectionCard
      title="1. Atendimento realizado"
      subtitle="Procedimentos ambulatoriais registrados no SUS."
      actions={actions}
      narrativeTitle="Leitura do gráfico"
      narrative="A demanda por procedimentos ambulatoriais em Tijucas mostra a tendência de uso da rede pública ao longo do período. A comparação com Santa Catarina ajuda a identificar se o município acompanha, acelera ou desacelera em relação ao padrão estadual."
    >
      <div className="h-[340px] rounded-2xl border border-red-100 bg-white/75 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.series} margin={{ top: 16, right: 18, bottom: 12, left: 8 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="periodo" tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} width={70} />
            <Tooltip formatter={tooltipFormatter} labelStyle={{ fontWeight: 800 }} />
            {mode === "index" ? (
              <>
                <Line type="monotone" dataKey="indiceTijucas" name="Índice Tijucas" stroke="#EC4137" strokeWidth={3.2} dot={false} />
                <Line type="monotone" dataKey="indiceSc" name="Índice SC" stroke="#14B8A6" strokeWidth={2.6} dot={false} />
              </>
            ) : mode === "absolute" ? (
              <Line type="monotone" dataKey="procedimentosTijucas" name="Procedimentos Tijucas" stroke="#EC4137" strokeWidth={3.2} dot={{ r: 2.5 }} />
            ) : (
              <>
                <Line type="monotone" dataKey="procedimentosTijucas" name="Procedimentos Tijucas" stroke="#94A3B8" strokeWidth={2.2} dot={false} />
                <Line type="monotone" dataKey="mediaMovel3" name="Média móvel 3 meses" stroke="#EC4137" strokeWidth={3.2} dot={false} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MicroCard label="Variação mensal" value={`${decimalNumber.format(data.summary.variacaoMensalPct ?? 0)}%`} />
        <MicroCard label="Média dos últimos 12 meses" value={brInteger.format(data.summary.mediaUltimos12Meses ?? 0)} />
        <MicroCard label="Participação de Tijucas em SC" value={`${decimalNumber.format(data.summary.participacaoScPct ?? 0)}%`} />
      </div>
    </HealthSectionCard>
  );
}
