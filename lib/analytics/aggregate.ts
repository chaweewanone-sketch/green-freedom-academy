import type { AssessmentResult } from "@/types/assessment-result";
import type { AggregatableLearningEvent } from "@/types/analytics";
import type { FlashCardResult } from "@/types/recall";

export function normalizeAssessmentResult(
  result: AssessmentResult,
  lessonSlug: string,
): AggregatableLearningEvent {
  return {
    sessionId: result.sessionId,
    activity: result.activity,
    lessonSlug,
    completedAt: result.completedAt,
    scorePercentage: result.percentage,
  };
}

export function normalizeFlashCardResult(
  result: FlashCardResult,
  lessonSlug: string,
): AggregatableLearningEvent {
  return {
    sessionId: result.sessionId,
    activity: result.activity,
    lessonSlug,
    completedAt: result.completedAt,
    flashEasy: result.easy,
    flashMedium: result.medium,
    flashHard: result.hard,
  };
}

export function normalizeActivityResult(
  result: AssessmentResult | FlashCardResult,
  lessonSlug: string,
): AggregatableLearningEvent {
  if (result.activity === "flash-cards") {
    return normalizeFlashCardResult(result as FlashCardResult, lessonSlug);
  }

  return normalizeAssessmentResult(result as AssessmentResult, lessonSlug);
}
