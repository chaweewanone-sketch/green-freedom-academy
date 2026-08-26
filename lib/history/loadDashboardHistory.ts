import { buildLearningSummaryFromRepository } from "@/lib/analytics";
import type { LearningSummary } from "@/types/analytics";
import type { LearningHistoryRepository } from "@/types/history";
import { createLearningHistoryRepository } from "./createRepository";

export function loadDashboardHistory(
  repository: LearningHistoryRepository = createLearningHistoryRepository(),
): LearningSummary {
  return buildLearningSummaryFromRepository(repository);
}
