// Orquestrador dos painéis temáticos: renderiza o seletor de eixos e roteia
// cada eixo para sua página dedicada (economia, educação, contas públicas) ou
// para o painel padrão (AxisPanel) usado pelos demais eixos.
import { useEffect, useMemo, useState } from "react";
import { EconomiaPage } from "../economia/EconomiaPage.jsx";
import { EducacaoPage } from "../educacao/EducacaoPage.jsx";
import { ContasPublicasPage } from "../contas-publicas/ContasPublicasPage.jsx";
import SaudePage from "../../pages/SaudePage";
import { AxisSelector } from "./components/AxisSelector.jsx";
import { AxisPanel } from "./components/AxisPanel.jsx";
import { THEME_SELECT_EVENT } from "./config/axes.js";

export function ThematicDashboard({ themes }) {
  const themeList = useMemo(() => Object.values(themes), [themes]);
  const [activeThemeId, setActiveThemeId] = useState("economiaEmpregos");
  const activeTheme = themes[activeThemeId];

  useEffect(() => {
    function handleThemeSelection(event) {
      const nextThemeId = event.detail?.themeId;
      if (nextThemeId && themes[nextThemeId]) {
        setActiveThemeId(nextThemeId);
      }
    }

    function syncThemeWithHash() {
      const hashThemeId = window.location.hash.replace("#", "");
      if (hashThemeId && themes[hashThemeId]) {
        setActiveThemeId(hashThemeId);
      }
    }

    syncThemeWithHash();
    window.addEventListener(THEME_SELECT_EVENT, handleThemeSelection);
    window.addEventListener("hashchange", syncThemeWithHash);

    return () => {
      window.removeEventListener(THEME_SELECT_EVENT, handleThemeSelection);
      window.removeEventListener("hashchange", syncThemeWithHash);
    };
  }, [themes]);

  return (
    <section id="indicadores" className="flex flex-col gap-5" aria-labelledby="themes-title">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="themes-title" className="text-xl font-extrabold text-brand-navy">
            Painéis temáticos
          </h2>
          <p className="text-sm font-medium text-brand-gray">Escolha uma área para visualizar.</p>
        </div>
      </div>

      <AxisSelector themes={themeList} activeThemeId={activeThemeId} onSelect={setActiveThemeId} />

      {activeTheme.id === "economiaEmpregos" ? (
        <div className="rounded-[32px] shadow-soft">
          <EconomiaPage theme={activeTheme} />
        </div>
      ) : activeTheme.id === "educacao" ? (
        <div className="rounded-[32px] shadow-soft">
          <EducacaoPage />
        </div>
      ) : activeTheme.id === "contasPublicas" ? (
        <div className="rounded-[32px] shadow-soft">
          <ContasPublicasPage />
        </div>
      ) : activeTheme.id === "saude" ? (
        <div className="rounded-[32px] shadow-soft">
          <SaudePage />
        </div>
      ) : (
        <AxisPanel theme={activeTheme} />
      )}
    </section>
  );
}
