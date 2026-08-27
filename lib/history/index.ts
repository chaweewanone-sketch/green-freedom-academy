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
  hasLearnCompletion,
  isLearnActivity,
  recordLearnCompletion,
  type RecordLearnCompletionInput,
} from "./recordLearnCompletion";
