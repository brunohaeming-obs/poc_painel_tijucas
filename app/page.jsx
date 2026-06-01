import { ScrollNarrativeDashboard } from "../src/components/ScrollNarrativeDashboard.jsx";
import { thematicDashboardData } from "../src/data/thematicDashboardData.js";

export default function Page() {
  return <ScrollNarrativeDashboard themes={thematicDashboardData} />;
}
