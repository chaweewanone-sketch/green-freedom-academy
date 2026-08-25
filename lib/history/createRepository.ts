import type { LearningHistoryRepository } from "@/types/history";
import { LocalStorageLearningHistoryRepository } from "./localStorageRepository";
import { MemoryLearningHistoryRepository } from "./memoryRepository";

export function createLearningHistoryRepository(): LearningHistoryRepository {
  if (typeof window === "undefined") {
    return new MemoryLearningHistoryRepository();
  }

  return new LocalStorageLearningHistoryRepository();
}
