import { BarChartCard } from "./components/BarChartCard.jsx";
import { BulletinsSection } from "./components/BulletinsSection.jsx";
import { Footer } from "./components/Footer.jsx";
import { Header } from "./components/Header.jsx";
import { HeroSection } from "./components/HeroSection.jsx";
import { KpiCard } from "./components/KpiCard.jsx";
import { LineChartCard } from "./components/LineChartCard.jsx";
import { MapCard } from "./components/MapCard.jsx";
import { MonthlyIndicatorsTable } from "./components/MonthlyIndicatorsTable.jsx";
import { ThemeSelector } from "./components/ThemeSelector.jsx";
import {
  bulletins,
  chartData,
  kpiCards,
  monthlyIndicators,
  themePanels,
} from "./data/portalData.js";

export default function App() {
  return (
    <div className="min-h-screen bg-brand-page font-sans">
      <Header />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 py-6 md:px-10 md:py-8 2xl:px-12">
        <HeroSection />

        <section
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:gap-5"
          aria-label="Indicadores rápidos"
        >
          {kpiCards.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </section>

        <ThemeSelector
          themes={themePanels}
          selectedTheme="Empresas e Empregos"
        />

        <section className="grid gap-5 xl:grid-cols-[1fr_1.35fr_1.15fr] 2xl:gap-6">
          <MapCard />
          <LineChartCard data={chartData.employmentEvolution} />
          <BarChartCard data={chartData.themeIndicators} />
        </section>

        <MonthlyIndicatorsTable indicators={monthlyIndicators} />
        <BulletinsSection bulletins={bulletins} />
      </main>
      <Footer />
    </div>
  );
}
