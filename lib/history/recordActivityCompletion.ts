import { normalizeActivityResult } from "@/lib/analytics";
import type { AggregatableLearningEvent, LearningEvent } from "@/types/analytics";
import type { AssessmentResult } from "@/types/assessment-result";
import type { LearningHistoryRepository } from "@/types/history";
import type { FlashCardResult } from "@/types/recall";
import { createLearningHistoryRepository } from "./createRepository";

export type ActivityCompletionResult = AssessmentResult | FlashCardResult;

export type RecordActivityCompletionInput = {
  result: ActivityCompletionResult | null | undefined;
  lessonSlug: string;
  repository?: LearningHistoryRepository;
};

function isFlashCardResult(
  result: ActivityCompletionResult,
): result is FlashCardResult {
  return result.activity === "flash-cards" && "reviewedCards" in result;
}

function isCompletedActivityResult(
  result: ActivityCompletionResult,
  lessonSlug: string,
): boolean {
  if (lessonSlug.trim() === "") {
    return false;
  }

  if (
    result.sessionId.trim() === "" ||
    result.activity.trim() === "" ||
    !Number.isFinite(result.completedAt)
  ) {
    return false;
  }

  if (isFlashCardResult(result)) {
    return result.reviewedCards > 0 && result.reviewedCards === result.totalCards;
  }

  return true;
}

function isSameCompletion(left: LearningEvent, right: LearningEvent): boolean {
  return (
    left.sessionId === right.sessionId &&
    left.activity === right.activity &&
    left.lessonSlug === right.lessonSlug &&
    left.completedAt === right.completedAt
  );
}

export function recordActivityCompletion(
  input: RecordActivityCompletionInput,
): LearningEvent | null {
  const { result, lessonSlug } = input;

  if (!result || !isCompletedActivityResult(result, lessonSlug)) {
    return null;
  }

  const repository = input.repository ?? createLearningHistoryRepository();
  const event: AggregatableLearningEvent = normalizeActivityResult(
    result,
    lessonSlug,
  );

  const alreadySaved = repository
    .getAll()
    .some((existing) => isSameCompletion(existing, event));

  if (alreadySaved) {
    return event;
  }

  repository.save(event);
  return event;
}
