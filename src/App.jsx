import { Header } from "./components/Header.jsx";
import { HeroSection } from "./components/HeroSection.jsx";
import { ThematicDashboard } from "./components/ThematicDashboard.jsx";
import { thematicDashboardData } from "./data/thematicDashboardData.js";

export default function App() {
  return (
    <div className="min-h-screen bg-brand-page font-sans">
      <Header />
      <main className="mx-auto flex w-full max-w-[2200px] flex-col gap-10 px-6 py-6 md:px-10 md:py-8 2xl:px-16">
        <HeroSection />

        <ThematicDashboard themes={thematicDashboardData} />
      </main>
    </div>
  );
}
