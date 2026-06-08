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

type ApsData = {
  summary: {
    coberturaAps: { equipesEsf: number | null };
    coberturaAcs: { acsAtivos: number | null };
    saudeBucal: { equipes40h: number | null };
    cadastros: { disponivel: boolean; valor: number | null };
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

export function ApsCapacitySection({ data }: { data: ApsData }) {
  const [mode, setMode] = useState<"coverage" | "teams" | "registrations">("coverage");
  const hasRegistrations = data.summary.cadastros?.disponivel;

  const actions = (
    <>
      <HealthToggleButton active={mode === "coverage"} onClick={() => setMode("coverage")}>Coberturas</HealthToggleButton>
      <HealthToggleButton active={mode === "teams"} onClick={() => setMode("teams")}>Equipes</HealthToggleButton>
      {hasRegistrations ? (
        <HealthToggleButton active={mode === "registrations"} onClick={() => setMode("registrations")}>Cadastros</HealthToggleButton>
      ) : null}
    </>
  );

  return (
    <HealthSectionCard
      title="2. Capacidade da Atenção Básica"
      subtitle="Cobertura estimada por equipes e serviços."
      actions={actions}
      narrativeTitle="O que a cobertura indica?"
      narrative="A Atenção Básica é a principal porta de entrada do SUS. Coberturas elevadas indicam maior capacidade estimada de acompanhamento da população. Valores acima de 100% podem ocorrer porque representam capacidade estimada, não contagem direta de pessoas atendidas."
    >
      <div className="h-[340px] rounded-2xl border border-red-100 bg-white/75 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.series} margin={{ top: 16, right: 18, bottom: 12, left: 8 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="competencia" tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} width={70} />
            <Tooltip formatter={(value: number, name: string) => [name.includes("Cobertura") ? `${decimalNumber.format(value)}%` : brInteger.format(value), name]} />
            {mode === "coverage" ? (
              <>
                <Line type="monotone" dataKey="coberturaAps" name="Cobertura APS" stroke="#EC4137" strokeWidth={3.2} dot={false} connectNulls />
                <Line type="monotone" dataKey="coberturaAcs" name="Cobertura ACS" stroke="#22C55E" strokeWidth={2.8} dot={false} connectNulls />
                <Line type="monotone" dataKey="coberturaSaudeBucal" name="Cobertura Saúde Bucal" stroke="#F59E0B" strokeWidth={2.8} dot={false} connectNulls />
              </>
            ) : mode === "teams" ? (
              <>
                <Line type="monotone" dataKey="equipesEsf" name="Equipes ESF" stroke="#EC4137" strokeWidth={3.2} dot={false} connectNulls />
                <Line type="monotone" dataKey="acsAtivos" name="ACS ativos" stroke="#22C55E" strokeWidth={2.8} dot={false} connectNulls />
                <Line type="monotone" dataKey="equipesSaudeBucal40h" name="Equipes Saúde Bucal 40h" stroke="#F59E0B" strokeWidth={2.8} dot={false} connectNulls />
              </>
            ) : (
              <Line type="monotone" dataKey="cadastrosAps" name="Cadastros APS" stroke="#EC4137" strokeWidth={3.2} dot={false} connectNulls />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MicroCard label="Equipes ESF" value={brInteger.format(data.summary.coberturaAps.equipesEsf ?? 0)} />
        <MicroCard label="ACS ativos" value={brInteger.format(data.summary.coberturaAcs.acsAtivos ?? 0)} />
        <MicroCard label="Equipes Saúde Bucal 40h" value={brInteger.format(data.summary.saudeBucal.equipes40h ?? 0)} />
      </div>
    </HealthSectionCard>
  );
}
