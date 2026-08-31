import {
  buildLearningRecommendation,
  buildMillionaireResultRecommendation,
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
  /** True when the Result CTA retries the current activity in place. */
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

function isCurrentMillionaireResult(
  result: ResolveForwardResultNextActionInput["currentResult"],
): result is Pick<AssessmentResult, "activity" | "percentage"> {
  return (
    result !== undefined &&
    result.activity === "millionaire" &&
    Number.isFinite(result.percentage)
  );
}

function toMillionaireCurrentResultNextAction(
  currentLessonSlug: string,
  recommendation: LearningRecommendation,
): ResultNextAction | null {
  const quizHref = getActivityPath(currentLessonSlug, "quiz");
  const millionaireHref = getActivityPath(currentLessonSlug, "millionaire");

  if (recommendation.href === quizHref) {
    return asForwardAction(recommendation);
  }

  if (recommendation.href === millionaireHref) {
    return asForwardAction(recommendation, true);
  }

  if (recommendation.href === getDashboardPath()) {
    return asForwardAction(recommendation);
  }

  if (
    recommendation.href === getLessonPath(recommendation.lessonSlug) &&
    recommendation.lessonSlug !== currentLessonSlug
  ) {
    return asForwardAction(recommendation);
  }

  return null;
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
 * Result CTA guard for history-composed recommendations.
 * Quiz may surface same-activity retry. Millionaire history composition
 * still only surfaces genuine forward transitions. Current-attempt
 * Millionaire Result uses toMillionaireCurrentResultNextAction instead.
 * Flash never receives a Result nextAction.
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
 * Quiz and Millionaire Result use the current attempt percentage via
 * shared score-band helpers. Home/Journey/Resume keep historical average.
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

  if (
    input.currentActivity === "millionaire" &&
    isCurrentMillionaireResult(input.currentResult)
  ) {
    return toMillionaireCurrentResultNextAction(
      input.currentLessonSlug,
      buildMillionaireResultRecommendation(
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
