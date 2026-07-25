import type { LearningEvent } from "@/types/analytics";

export interface LearningHistoryRepository {
  save(event: LearningEvent): void;
  getAll(): LearningEvent[];
  getByLesson(lessonSlug: string): LearningEvent[];
  getByActivity(activity: string): LearningEvent[];
  getLatest(limit?: number): LearningEvent[];
  clear(): void;
}
