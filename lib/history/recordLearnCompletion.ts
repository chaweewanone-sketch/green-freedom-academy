import type { AggregatableLearningEvent, LearningEvent } from "@/types/analytics";
import type { LearningHistoryRepository } from "@/types/history";
import { createLearningHistoryRepository } from "./createRepository";
import {
  LEARN_ACTIVITY,
  buildLearnSessionId,
  findCurrentLearnCompletion,
  getLessonContentVersion,
  hasHistoricalLearnCompletion,
  isLearnActivity,
  isPositiveInteger,
} from "./learnVersion";

export {
  LEARN_ACTIVITY,
  findCurrentLearnCompletion,
  findHistoricalLearnCompletion,
  getEffectiveLearnVersion,
  getLessonContentVersion,
  hasCurrentLearnCompletion,
  hasHistoricalLearnCompletion,
  isLearnActivity,
} from "./learnVersion";

export type RecordLearnCompletionInput = {
  lessonSlug: string;
  repository?: LearningHistoryRepository;
  completedAt?: number;
  lessonContentVersion?: number;
};

/**
 * Historical completion: any Learn event exists for the lesson slug.
 * Kept as the existing helper name so prior callers stay unambiguous.
 */
export function hasLearnCompletion(
  events: LearningEvent[],
  lessonSlug: string,
): boolean {
  return hasHistoricalLearnCompletion(events, lessonSlug);
}

/**
 * Records Learn completion for the lesson's current contentVersion
 * (or an explicit version). Idempotent per lessonSlug + version.
 * A newer version writes a new event and does not erase older ones.
 *
 * New writes use sessionId `learn:${slug}:v${version}`. Historical
 * `learn:${slug}` rows stay readable and are not renamed.
 */
export function recordLearnCompletion(
  input: RecordLearnCompletionInput,
): LearningEvent | null {
  const lessonSlug = input.lessonSlug.trim();
  if (lessonSlug === "") {
    return null;
  }

  const contentVersion = isPositiveInteger(input.lessonContentVersion)
    ? input.lessonContentVersion
    : getLessonContentVersion(lessonSlug);

  const repository = input.repository ?? createLearningHistoryRepository();
  const existing = findCurrentLearnCompletion(
    repository.getAll(),
    lessonSlug,
    contentVersion,
  );
  if (existing) {
    return existing;
  }

  const event: AggregatableLearningEvent = {
    sessionId: buildLearnSessionId(lessonSlug, contentVersion),
    activity: LEARN_ACTIVITY,
    lessonSlug,
    completedAt: input.completedAt ?? Date.now(),
    lessonContentVersion: contentVersion,
  };

  repository.save(event);
  return event;
}
