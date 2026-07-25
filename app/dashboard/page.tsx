import { BrandHeader } from "@/components/BrandHeader";
import { StudentDashboard } from "@/components/dashboard";
import { buildSampleLearningSummary } from "@/lib/analytics/sample-data";

export default function DashboardPage() {
  const summary = buildSampleLearningSummary();

  return (
    <main className="page">
      <BrandHeader />
      <StudentDashboard summary={summary} />
    </main>
  );
}
