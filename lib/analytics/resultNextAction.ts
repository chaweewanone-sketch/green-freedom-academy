import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import type {
  AggregatableLearningEvent,
  LearningRecommendation,
} from "@/types/analytics";

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
};

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
 * Compose Result nextAction from the canonical recommendation engine
 * after the activity result has already been persisted.
 */
export function resolveForwardResultNextAction(
  input: ResolveForwardResultNextActionInput,
): ResultNextAction | null {
  if (input.currentActivity === "flash-cards") {
    return null;
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
