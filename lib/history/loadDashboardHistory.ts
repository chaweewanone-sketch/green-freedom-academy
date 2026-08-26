import { buildLearningSummary } from "@/lib/analytics";
import type {
  AggregatableLearningEvent,
  LearningSummary,
} from "@/types/analytics";
import type { LearningHistoryRepository } from "@/types/history";
import { createLearningHistoryRepository } from "./createRepository";

export type DashboardLearningState = {
  summary: LearningSummary;
  events: AggregatableLearningEvent[];
};

export function loadDashboardLearningState(
  repository: LearningHistoryRepository = createLearningHistoryRepository(),
): DashboardLearningState {
  const events = repository.getAll() as AggregatableLearningEvent[];
  return {
    summary: buildLearningSummary(events),
    events,
  };
}

export function loadDashboardHistory(
  repository: LearningHistoryRepository = createLearningHistoryRepository(),
): LearningSummary {
  return loadDashboardLearningState(repository).summary;
}
