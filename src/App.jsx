import { Header } from "./shared/layout/Header.jsx";
import { ThematicDashboard } from "./features/dashboard/ThematicDashboard.jsx";
import { thematicDashboardData } from "./features/dashboard/data/thematicDashboardData.js";

export default function App() {
  return (
    <div className="min-h-screen bg-brand-page font-sans">
      <Header />

      <main className="mx-auto flex w-full max-w-[2200px] flex-col gap-10 px-6 py-6 md:px-10 md:py-8 2xl:px-16">
        <ThematicDashboard themes={thematicDashboardData} />
      </main>
    </div>
  );
}
