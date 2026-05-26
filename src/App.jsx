import { BulletinsSection } from "./components/BulletinsSection.jsx";
import { Footer } from "./components/Footer.jsx";
import { Header } from "./components/Header.jsx";
import { HeroSection } from "./components/HeroSection.jsx";
import { MapCard } from "./components/MapCard.jsx";
import { MonthlyIndicatorsTable } from "./components/MonthlyIndicatorsTable.jsx";
import { ThematicDashboard } from "./components/ThematicDashboard.jsx";
import { thematicDashboardData } from "./data/thematicDashboardData.js";
import {
  bulletins,
  monthlyIndicators,
} from "./data/portalData.js";

export default function App() {
  return (
    <div className="min-h-screen bg-brand-page font-sans">
      <Header />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 py-6 md:px-10 md:py-8 2xl:px-12">
        <HeroSection />

        <ThematicDashboard themes={thematicDashboardData} />

        <section className="grid gap-5 2xl:gap-6">
          <MapCard />
        </section>

        <MonthlyIndicatorsTable indicators={monthlyIndicators} />
        <BulletinsSection bulletins={bulletins} />
      </main>
      <Footer />
    </div>
  );
}
