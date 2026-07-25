import type { LearningEvent } from "@/types/analytics";
import type { LearningHistoryRepository } from "@/types/history";

export class MemoryLearningHistoryRepository
  implements LearningHistoryRepository
{
  private events: LearningEvent[] = [];

  save(event: LearningEvent): void {
    this.events.push({ ...event });
  }

  getAll(): LearningEvent[] {
    return this.events.map((event) => ({ ...event }));
  }

  getByLesson(lessonSlug: string): LearningEvent[] {
    return this.getAll().filter((event) => event.lessonSlug === lessonSlug);
  }

  getByActivity(activity: string): LearningEvent[] {
    return this.getAll().filter((event) => event.activity === activity);
  }

  getLatest(limit?: number): LearningEvent[] {
    const sorted = [...this.events].sort(
      (a, b) => b.completedAt - a.completedAt,
    );

    if (limit === undefined) {
      return sorted.map((event) => ({ ...event }));
    }

    if (limit <= 0) {
      return [];
    }

    return sorted.slice(0, limit).map((event) => ({ ...event }));
  }

  clear(): void {
    this.events = [];
  }
}
