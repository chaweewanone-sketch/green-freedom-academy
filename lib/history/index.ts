export type { LearningHistoryRepository } from "@/types/history";
export { createLearningHistoryRepository } from "./createRepository";
export {
  LEARNING_HISTORY_STORAGE_KEY,
  LocalStorageLearningHistoryRepository,
  hasPersistedLearningHistory,
} from "./localStorageRepository";
export { MemoryLearningHistoryRepository } from "./memoryRepository";
export {
  loadDashboardHistory,
  loadDashboardLearningState,
  type DashboardLearningState,
} from "./loadDashboardHistory";
export {
  recordActivityCompletion,
  type ActivityCompletionResult,
  type RecordActivityCompletionInput,
} from "./recordActivityCompletion";
export {
  LEARN_ACTIVITY,
  LEGACY_LEARN_CONTENT_VERSION,
  buildLearnSessionId,
  findCurrentLearnCompletion,
  findHistoricalLearnCompletion,
  getEffectiveLearnVersion,
  getLessonContentVersion,
  hasCurrentLearnCompletion,
  hasHistoricalLearnCompletion,
  isLearnActivity,
} from "./learnVersion";
export {
  hasLearnCompletion,
  recordLearnCompletion,
  type RecordLearnCompletionInput,
} from "./recordLearnCompletion";
