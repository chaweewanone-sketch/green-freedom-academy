import {
  buildLearningRecommendation,
  buildQuizScoreRecommendation,
} from "@/lib/analytics/recommendation";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import type {
  AggregatableLearningEvent,
  LearningRecommendation,
} from "@/types/analytics";
import type { AssessmentResult } from "@/types/assessment-result";

export type ResultNextAction = {
  label: string;
  href: string;
  /** True when the engine recommends retrying the current Quiz in place. */
  sameActivity?: boolean;
};

export type ResolveForwardResultNextActionInput = {
  currentActivity: string;
  currentLessonSlug: string;
  summary: unknown;
  events?: AggregatableLearningEvent[];
  currentResult?: Pick<AssessmentResult, "activity" | "percentage">;
};

function isCurrentQuizResult(
  result: ResolveForwardResultNextActionInput["currentResult"],
): result is Pick<AssessmentResult, "activity" | "percentage"> {
  return (
    result !== undefined &&
    result.activity === "quiz" &&
    Number.isFinite(result.percentage)
  );
}

function asForwardAction(
  recommendation: LearningRecommendation,
  sameActivity = false,
): ResultNextAction {
  return {
    label: recommendation.ctaLabel,
    href: recommendation.href,
    ...(sameActivity ? { sameActivity: true } : {}),
  };
}

/**
 * Result CTA guard.
 * Quiz may surface the engine retry/practice CTA on the same activity.
 * Millionaire still only surfaces genuine forward transitions.
 * Does not score activities. Flash never receives a Result nextAction.
 */
export function toForwardResultNextAction(
  currentActivity: string,
  currentLessonSlug: string,
  recommendation: LearningRecommendation,
): ResultNextAction | null {
  if (currentActivity === "flash-cards") {
    return null;
  }

  const currentActivityHref = getActivityPath(
    currentLessonSlug,
    currentActivity,
  );

  if (currentActivity === "quiz") {
    if (
      recommendation.href ===
      getActivityPath(currentLessonSlug, "millionaire")
    ) {
      return asForwardAction(recommendation);
    }

    if (recommendation.href === currentActivityHref) {
      return asForwardAction(recommendation, true);
    }

    return null;
  }

  if (recommendation.href === currentActivityHref) {
    return null;
  }

  if (currentActivity === "millionaire") {
    if (recommendation.href === getDashboardPath()) {
      return asForwardAction(recommendation);
    }

    if (
      recommendation.href === getActivityPath(currentLessonSlug, "quiz")
    ) {
      return null;
    }

    if (
      recommendation.href === getLessonPath(recommendation.lessonSlug) &&
      recommendation.lessonSlug !== currentLessonSlug
    ) {
      return asForwardAction(recommendation);
    }

    return null;
  }

  return null;
}

/**
 * Compose Result nextAction after persist.
 * Quiz Result uses the current attempt percentage via the shared
 * score-band helper. Home/Journey/Resume keep historical average.
 * Millionaire Result still uses the canonical history recommendation.
 */
export function resolveForwardResultNextAction(
  input: ResolveForwardResultNextActionInput,
): ResultNextAction | null {
  if (input.currentActivity === "flash-cards") {
    return null;
  }

  if (input.currentActivity === "quiz" && isCurrentQuizResult(input.currentResult)) {
    return toForwardResultNextAction(
      input.currentActivity,
      input.currentLessonSlug,
      buildQuizScoreRecommendation(
        input.currentResult.percentage,
        input.currentLessonSlug,
      ),
    );
  }

  const recommendation = buildLearningRecommendation(
    input.summary,
    input.events,
  );

  return toForwardResultNextAction(
    input.currentActivity,
    input.currentLessonSlug,
    recommendation,
  );
}
