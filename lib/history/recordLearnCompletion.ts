import type { AggregatableLearningEvent, LearningEvent } from "@/types/analytics";
import type { LearningHistoryRepository } from "@/types/history";
import { createLearningHistoryRepository } from "./createRepository";

export const LEARN_ACTIVITY = "learn";

export type RecordLearnCompletionInput = {
  lessonSlug: string;
  repository?: LearningHistoryRepository;
  completedAt?: number;
};

export function isLearnActivity(activity: string): boolean {
  return activity === LEARN_ACTIVITY;
}

export function hasLearnCompletion(
  events: LearningEvent[],
  lessonSlug: string,
): boolean {
  return events.some(
    (event) =>
      isLearnActivity(event.activity) && event.lessonSlug === lessonSlug,
  );
}

function findLearnCompletion(
  events: LearningEvent[],
  lessonSlug: string,
): LearningEvent | undefined {
  return events.find(
    (event) =>
      isLearnActivity(event.activity) && event.lessonSlug === lessonSlug,
  );
}

/**
 * Records that the learner finished the Learn slides for a lesson.
 * One Learn event per lesson. Repeats return the stored event and do not
 * add scores or extra history rows.
 */
export function recordLearnCompletion(
  input: RecordLearnCompletionInput,
): LearningEvent | null {
  const lessonSlug = input.lessonSlug.trim();
  if (lessonSlug === "") {
    return null;
  }

  const repository = input.repository ?? createLearningHistoryRepository();
  const existing = findLearnCompletion(repository.getAll(), lessonSlug);
  if (existing) {
    return existing;
  }

  const event: AggregatableLearningEvent = {
    sessionId: `${LEARN_ACTIVITY}:${lessonSlug}`,
    activity: LEARN_ACTIVITY,
    lessonSlug,
    completedAt: input.completedAt ?? Date.now(),
  };

  repository.save(event);
  return event;
}
