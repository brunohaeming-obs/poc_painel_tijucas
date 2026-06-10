import { useEffect, useState } from "react";
import { EducacaoHeader } from "./components/EducacaoHeader.jsx";
import { EducacaoOverviewSection } from "./components/EducacaoOverviewSection.jsx";
import { AtendimentoEscolarSection } from "./components/AtendimentoEscolarSection.jsx";
import { InfraestruturaSection } from "./components/InfraestruturaSection.jsx";
import { TerritorioSection } from "./components/TerritorioSection.jsx";
import { loadAllEducacaoData } from "./data/loadEducacaoData.js";
import { buildEducacaoNarratives } from "./data/buildEducacaoNarratives.js";
import { buildEducacaoViewModel } from "./data/transformEducacaoData.js";

const FIXED_YEAR = 2025;

export function EducacaoPage() {
  const [allData, setAllData] = useState(null);
  const [territoryMode, setTerritoryMode] = useState("schools");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await loadAllEducacaoData();
        if (cancelled) return;
        setAllData(response);
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Dados de educação não encontrados. Verifique os arquivos em public/data/educacao.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const viewModel = allData ? buildEducacaoViewModel(allData, { selectedYear: FIXED_YEAR }) : null;
  const narratives = viewModel
    ? buildEducacaoNarratives({
        selectedYear: viewModel.selectedYear,
        overviewKpis: viewModel.overviewKpis,
        schoolComposition: viewModel.schoolComposition,
        enrollmentHistory: viewModel.enrollmentHistory,
        enrollmentComposition: viewModel.enrollmentComposition,
        infrastructureKpis: viewModel.infrastructureKpis,
        infrastructureChart: viewModel.infrastructureChart,
        territoryData: viewModel.territoryData,
      })
    : null;

  return (
    <section
      id="educacao"
      aria-labelledby="educacao-title"
      className="educacao-shell relative overflow-hidden rounded-[32px] font-sans shadow-[0_24px_80px_rgba(3,10,34,0.24)]"
    >
      <div className="relative flex flex-col gap-10 p-5 md:p-6 xl:p-8">
        <EducacaoHeader selectedYear={FIXED_YEAR} />

        {isLoading ? (
          <div className="educacao-surface rounded-[28px] px-6 py-10 text-center text-sm font-semibold text-slate-200">
            Carregando dados de educação...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 px-6 py-8 text-sm font-semibold text-rose-100">
            {errorMessage}
          </div>
        ) : null}

        {!isLoading && !errorMessage && viewModel && narratives ? (
          <>
            <EducacaoOverviewSection
              selectedYear={viewModel.selectedYear}
              kpis={viewModel.overviewKpis}
              composition={viewModel.schoolComposition}
              narratives={narratives}
            />

            <AtendimentoEscolarSection
              selectedYear={viewModel.selectedYear}
              enrollmentHistory={viewModel.enrollmentHistory}
              enrollmentComposition={viewModel.enrollmentComposition}
              narratives={narratives}
            />

            <InfraestruturaSection
              selectedYear={viewModel.selectedYear}
              infrastructureKpis={viewModel.infrastructureKpis}
              infrastructureChart={viewModel.infrastructureChart}
              infrastructureHistory={viewModel.infrastructureHistory}
              narratives={narratives}
            />

            <TerritorioSection
              selectedYear={viewModel.territoryData?.referenceYear ?? 2025}
              territoryData={viewModel.territoryData}
              territoryMode={territoryMode}
              onModeChange={setTerritoryMode}
              narratives={narratives}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
