import { BrandHeader } from "@/components/BrandHeader";
import { StudentDashboard } from "@/components/dashboard";
import { buildLearningSummaryFromRepository } from "@/lib/analytics";
import { populateSampleHistory } from "@/lib/analytics/sample-data";
import { MemoryLearningHistoryRepository } from "@/lib/history";

export default function DashboardPage() {
  const repository = new MemoryLearningHistoryRepository();
  populateSampleHistory(repository);
  const summary = buildLearningSummaryFromRepository(repository);

  return (
    <main className="page">
      <BrandHeader />
      <StudentDashboard summary={summary} />
    </main>
  );
}
