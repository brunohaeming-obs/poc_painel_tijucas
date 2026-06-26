import { HeartPulse, Stethoscope, Users } from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
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


function KpiCard({
  icon: Icon,
  label,
  value,
  context,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  value: string;
  context: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-white/70 px-4 py-3">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-50 text-[#EC4137]">
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <strong className="block text-lg font-extrabold text-slate-950">{value}</strong>
        <p className="text-[11px] font-semibold text-slate-400">{context}</p>
      </div>
    </div>
  );
}

export function ApsCapacitySection({ data }: { data: ApsData }) {
  const [mode, setMode] = useState<"coverage" | "teams">("coverage");
  const [years, setYears] = useState<3 | 5>(3);

  const currentYear = new Date().getFullYear();
  const filteredSeries = data.series.filter((row) => Number(row.ano) >= currentYear - years);

  type ModeNarrative = { narrativeTitle: string; narrativeHeadline: string; narrative: string; narrativeSource: string };
  const modeNarrative: Record<"coverage" | "teams", ModeNarrative> = {
    coverage: {
      narrativeTitle: "COBERTURA DE ATENÇÃO PRIMÁRIA",
      narrativeHeadline: "88% da população coberta pela Saúde da Família",
      narrative:
        "A cobertura estimada da ESF indica a proporção da população com acesso teórico a uma equipe de Saúde da Família. Valores acima de 100% acontecem quando o cadastro supera a estimativa do IBGE — não é erro, mas requer revisão da qualidade dos registros. A cobertura dos ACS tende a ser mais sensível: queda no indicador costuma antecipar sobrecarga na rede antes que os dados de atendimento registrem.",
      narrativeSource: "Fonte: e-Gestor APS / Ministério da Saúde",
    },
    teams: {
      narrativeTitle: "EQUIPES EM CAMPO",
      narrativeHeadline: "O número de equipes determina o teto de atendimento primário",
      narrative:
        "Cada equipe ESF é responsável por até 4.000 pessoas em sua área adscrita. Quando a população cresce mais rápido que as equipes, a cobertura percentual cai — mesmo com mais equipes em campo. O número de ACS ativos é o indicador mais sensível a esse descompasso, pois reflete o alcance real das visitas domiciliares.",
      narrativeSource: "Fonte: e-Gestor APS · CNES",
    },
  };
  const { narrativeTitle, narrativeHeadline, narrative, narrativeSource } = modeNarrative[mode] ?? modeNarrative.coverage;

  const actions = (
    <>
      <HealthToggleButton active={mode === "coverage"} onClick={() => setMode("coverage")}>Coberturas</HealthToggleButton>
      <HealthToggleButton active={mode === "teams"} onClick={() => setMode("teams")}>Equipes</HealthToggleButton>
      <span className="h-9 w-px self-center bg-red-200" />
      <HealthToggleButton active={years === 3} onClick={() => setYears(3)}>Últimos 3 anos</HealthToggleButton>
      <HealthToggleButton active={years === 5} onClick={() => setYears(5)}>Últimos 5 anos</HealthToggleButton>
    </>
  );

  return (
    <HealthSectionCard
      eyebrow="Atenção primária"
      eyebrowIcon={HeartPulse}
      title="Capacidade da Atenção Básica"
      subtitle="Cobertura estimada por equipes e serviços."
      actions={actions}
      narrativeTitle={narrativeTitle}
      narrativeHeadline={narrativeHeadline}
      narrative={narrative}
      narrativeSource={narrativeSource}
      narrativeIcon={HeartPulse}
      sidebarPosition="left"
    >
      {/* KPIs acima do gráfico */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <KpiCard
          icon={Stethoscope}
          label="Equipes ESF"
          value={brInteger.format(data.summary.coberturaAps.equipesEsf ?? 0)}
          context="Saúde da Família ativas"
        />
        <KpiCard
          icon={Users}
          label="Agentes comunitários"
          value={brInteger.format(data.summary.coberturaAcs.acsAtivos ?? 0)}
          context="ACS ativos em campo"
        />
        <KpiCard
          icon={HeartPulse}
          label="Equipes saúde bucal"
          value={brInteger.format(data.summary.saudeBucal.equipes40h ?? 0)}
          context="Modalidade 40h"
        />
      </div>

      {/* Legenda inline (modo coberturas) */}
      {mode === "coverage" && (
        <div className="mb-2 flex flex-wrap gap-5">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-5 rounded-full bg-[#EC4137]" />
            <span className="text-xs font-semibold text-slate-500">Cobertura APS</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-5 rounded-full bg-[#22C55E]" />
            <span className="text-xs font-semibold text-slate-500">Cobertura ACS</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-5"
              style={{
                height: 0,
                borderTop: "2.5px dashed #F59E0B",
              }}
            />
            <span className="text-xs font-semibold text-slate-500">Saúde Bucal</span>
          </span>
        </div>
      )}

      {/* Gráfico */}
      <div className="h-[320px] rounded-2xl border border-red-100 bg-white/75 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredSeries} margin={{ top: 12, right: 48, bottom: 12, left: 8 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis
              dataKey="competencia"
              tick={{ fill: "#475569", fontSize: 11, fontWeight: 700 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} width={70} />
            <Tooltip
              formatter={(value: number, name: string) => [
                name.includes("Cobertura") ? `${decimalNumber.format(value)}%` : brInteger.format(value),
                name,
              ]}
            />
            {mode === "coverage" && (
              <ReferenceLine
                y={100}
                stroke="#94A3B8"
                strokeDasharray="6 3"
                strokeWidth={1}
                label={{ value: "100%", position: "right", fill: "#94A3B8", fontSize: 11 }}
              />
            )}
            {mode === "coverage" ? (
              <>
                <Line type="monotone" dataKey="coberturaAps" name="Cobertura APS" stroke="#EC4137" strokeWidth={3.2} dot={false} connectNulls />
                <Line type="monotone" dataKey="coberturaAcs" name="Cobertura ACS" stroke="#22C55E" strokeWidth={2.8} dot={false} connectNulls />
                <Line type="monotone" dataKey="coberturaSaudeBucal" name="Cobertura Saúde Bucal" stroke="#F59E0B" strokeWidth={2.8} strokeDasharray="6 3" dot={false} connectNulls />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="equipesEsf" name="Equipes ESF" stroke="#EC4137" strokeWidth={3.2} dot={false} connectNulls />
                <Line type="monotone" dataKey="acsAtivos" name="ACS ativos" stroke="#22C55E" strokeWidth={2.8} dot={false} connectNulls />
                <Line type="monotone" dataKey="equipesSaudeBucal40h" name="Equipes Saúde Bucal 40h" stroke="#F59E0B" strokeWidth={2.8} dot={false} connectNulls />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insight inline */}
      <div className="mt-4 rounded-xl border-l-4 border-[#EC4137] bg-red-50 px-4 py-3">
        <p className="text-sm font-semibold leading-6 text-slate-700">
          A cobertura ESF se mantém estável (~88%). Os ACS registram queda nos últimos 18 meses, provável reflexo do crescimento populacional acelerado. Saúde bucal iniciou recuperação após queda em 2023.
        </p>
      </div>
    </HealthSectionCard>
  );
}
