import { useEffect, useState } from "react";
import { ApsCapacitySection } from "../components/health/ApsCapacitySection";
import { HealthHero } from "../components/health/HealthHero";
import { HealthMethodologyFooter } from "../components/health/HealthMethodologyFooter";
import { HealthSummaryCards } from "../components/health/HealthSummaryCards";
import { ProceduresSection } from "../components/health/ProceduresSection";
import { VaccinationSection } from "../components/health/VaccinationSection";
import {
  getHealthAps,
  getHealthDashboard,
  getHealthProcedures,
  getHealthVaccination,
} from "../services/healthService";

type HealthState = {
  dashboard: any;
  procedures: any;
  aps: any;
  vaccination: any;
};

export default function SaudePage() {
  const [data, setData] = useState<HealthState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHealthData() {
      try {
        const [dashboard, procedures, aps, vaccination] = await Promise.all([
          getHealthDashboard(),
          getHealthProcedures(),
          getHealthAps(),
          getHealthVaccination(),
        ]);
        if (active) {
          setData({ dashboard, procedures, aps, vaccination });
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Erro ao carregar dados de saúde.");
        }
      }
    }

    loadHealthData();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <section className="rounded-[28px] border border-red-100 bg-white p-6 text-red-700">
        <strong>Não foi possível carregar o painel de Saúde.</strong>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-[28px] border border-red-100 bg-white p-6 text-slate-700">
        Carregando dados de saúde...
      </section>
    );
  }

  return (
    <section className="health-shell rounded-[32px] bg-white p-5 shadow-soft md:p-7">
      <div className="grid gap-5">
        <HealthHero title={data.dashboard.metadata.titulo} subtitle={data.dashboard.metadata.subtitulo} />
        <HealthSummaryCards cards={data.dashboard.cards} />
        <ProceduresSection data={data.procedures} />
        <ApsCapacitySection data={data.aps} />
        <VaccinationSection data={data.vaccination} />
        <HealthMethodologyFooter lastUpdate={data.dashboard.metadata.ultimaAtualizacao} />
      </div>
    </section>
  );
}
