import { getActivityPath, getLessonPath } from "@/lib/routes";
import type { LearningSummary } from "@/types/analytics";
import {
  DEFAULT_RECOMMENDATION_LESSON_SLUG,
  buildLearningRecommendation,
} from "./recommendation";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function emptySummary(): LearningSummary {
  return {
    totalActivities: 0,
    quizAttempts: 0,
    millionaireAttempts: 0,
    flashCardAttempts: 0,
    averageQuizScore: 0,
    averageMillionaireScore: 0,
    flashEasy: 0,
    flashMedium: 0,
    flashHard: 0,
  };
}

function quizSummary(score: number): LearningSummary {
  return {
    ...emptySummary(),
    totalActivities: 1,
    quizAttempts: 1,
    averageQuizScore: score,
    latestActivity: "quiz",
    latestLesson: "present-simple",
  };
}

function millionaireSummary(score: number): LearningSummary {
  return {
    ...emptySummary(),
    totalActivities: 1,
    millionaireAttempts: 1,
    averageMillionaireScore: score,
    latestActivity: "millionaire",
    latestLesson: "present-simple",
  };
}

function flashSummary(
  easy: number,
  medium: number,
  hard: number,
): LearningSummary {
  return {
    ...emptySummary(),
    totalActivities: 1,
    flashCardAttempts: 1,
    flashEasy: easy,
    flashMedium: medium,
    flashHard: hard,
    latestActivity: "flash-cards",
    latestLesson: "present-simple",
  };
}

function strongHistory(): LearningSummary {
  return {
    totalActivities: 4,
    quizAttempts: 2,
    millionaireAttempts: 1,
    flashCardAttempts: 1,
    averageQuizScore: 92,
    averageMillionaireScore: 90,
    flashEasy: 8,
    flashMedium: 1,
    flashHard: 0,
    latestActivity: "millionaire",
    latestLesson: "present-simple",
  };
}

export function verifyEmptyHistoryStartsLearning(): void {
  const recommendation = buildLearningRecommendation(emptySummary());
  assert(recommendation.kind === "START", "empty: kind START");
  assert(recommendation.reasonCode === "EMPTY_HISTORY", "empty: reason");
  assert(
    recommendation.lessonSlug === DEFAULT_RECOMMENDATION_LESSON_SLUG,
    "empty: present-simple lesson",
  );
  assert(
    recommendation.href === getLessonPath(DEFAULT_RECOMMENDATION_LESSON_SLUG),
    "empty: lesson href",
  );
}

export function verifyQuizWeakRetry(): void {
  const recommendation = buildLearningRecommendation(quizSummary(50));
  assert(recommendation.kind === "RETRY", "quiz 50: RETRY");
  assert(recommendation.reasonCode === "QUIZ_WEAK", "quiz 50: reason");
  assert(recommendation.activity === "quiz", "quiz 50: activity");
  assert(
    recommendation.href === getActivityPath("present-simple", "quiz"),
    "quiz 50: href",
  );
}

export function verifyQuizDevelopingPractice(): void {
  const recommendation = buildLearningRecommendation(quizSummary(75));
  assert(recommendation.kind === "PRACTICE", "quiz 75: PRACTICE");
  assert(recommendation.reasonCode === "QUIZ_DEVELOPING", "quiz 75: reason");
  assert(recommendation.activity === "quiz", "quiz 75: activity");
}

export function verifyQuizStrongPlay(): void {
  const recommendation = buildLearningRecommendation(quizSummary(90));
  assert(recommendation.kind === "PLAY", "quiz 90: PLAY");
  assert(recommendation.reasonCode === "QUIZ_STRONG", "quiz 90: reason");
  assert(recommendation.activity === "millionaire", "quiz 90: millionaire");
  assert(
    recommendation.href === getActivityPath("present-simple", "millionaire"),
    "quiz 90: href",
  );
}

export function verifyMillionaireWeakPractice(): void {
  const recommendation = buildLearningRecommendation(millionaireSummary(60));
  assert(recommendation.kind === "PRACTICE", "millionaire 60: PRACTICE");
  assert(recommendation.reasonCode === "MILLIONAIRE_WEAK", "millionaire 60: reason");
  assert(recommendation.activity === "quiz", "millionaire 60: quiz");
}

export function verifyMillionaireDevelopingRetry(): void {
  const recommendation = buildLearningRecommendation(millionaireSummary(75));
  assert(recommendation.kind === "RETRY", "millionaire 75: RETRY");
  assert(
    recommendation.reasonCode === "MILLIONAIRE_DEVELOPING",
    "millionaire 75: reason",
  );
  assert(recommendation.activity === "millionaire", "millionaire 75: activity");
}

export function verifyMillionaireStrongContinue(): void {
  const recommendation = buildLearningRecommendation(millionaireSummary(90));
  assert(recommendation.kind === "CONTINUE", "millionaire 90: CONTINUE");
  assert(
    recommendation.reasonCode === "MILLIONAIRE_STRONG",
    "millionaire 90: reason",
  );
  assert(
    recommendation.lessonSlug === "past-simple",
    "millionaire 90: next lesson",
  );
  assert(
    recommendation.href === getLessonPath("past-simple"),
    "millionaire 90: next lesson href",
  );
  assert(recommendation.ctaLabel === "เรียนบทถัดไป", "millionaire 90: CTA");
}

export function verifyWeakFlashReview(): void {
  const recommendation = buildLearningRecommendation(flashSummary(1, 2, 3));
  assert(recommendation.kind === "REVIEW", "flash weak: REVIEW");
  assert(recommendation.reasonCode === "FLASH_WEAK", "flash weak: reason");
  assert(recommendation.activity === "flash-cards", "flash weak: activity");
}

export function verifyStrongHistoryIsStable(): void {
  const summary = strongHistory();
  const first = buildLearningRecommendation(summary);
  const second = buildLearningRecommendation(summary);

  assert(first.kind === "CONTINUE", "strong history: CONTINUE");
  assert(first.reasonCode === "MILLIONAIRE_STRONG", "strong history: latest millionaire");
  assert(
    first.href === getLessonPath("past-simple"),
    "strong history: next curriculum lesson",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "strong history: deterministic output",
  );
}

export function verifySameInputSameOutput(): void {
  const summary = quizSummary(75);
  const first = buildLearningRecommendation(summary);
  const second = buildLearningRecommendation({ ...summary });
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "same input: same recommendation",
  );
}

export function verifyRecommendationDoesNotMutateSummary(): void {
  const summary = quizSummary(50);
  const snapshot = JSON.stringify(summary);
  Object.freeze(summary);
  buildLearningRecommendation(summary);
  assert(JSON.stringify(summary) === snapshot, "must not mutate summary");
}

export function verifyMalformedInputFailsSafe(): void {
  const fromNull = buildLearningRecommendation(null);
  assert(fromNull.kind === "START", "null: START");
  assert(fromNull.reasonCode === "FALLBACK_START", "null: fallback");

  const fromEmpty = buildLearningRecommendation({});
  assert(fromEmpty.kind === "START", "empty object: START");
  assert(fromEmpty.reasonCode === "EMPTY_HISTORY", "empty object: empty history");
}

export function verifyLessonAwareHref(): void {
  const recommendation = buildLearningRecommendation({
    ...quizSummary(50),
    latestLesson: "past-simple",
  });
  assert(recommendation.lessonSlug === "past-simple", "lesson-aware slug");
  assert(
    recommendation.href === getActivityPath("past-simple", "quiz"),
    "lesson-aware href",
  );
}

export function verifyUnknownLessonFallsBack(): void {
  const recommendation = buildLearningRecommendation({
    ...quizSummary(90),
    latestLesson: "not-a-lesson",
  });
  assert(
    recommendation.lessonSlug === DEFAULT_RECOMMENDATION_LESSON_SLUG,
    "unknown lesson falls back to present-simple",
  );
}

export function runRecommendationVerification(): void {
  verifyEmptyHistoryStartsLearning();
  verifyQuizWeakRetry();
  verifyQuizDevelopingPractice();
  verifyQuizStrongPlay();
  verifyMillionaireWeakPractice();
  verifyMillionaireDevelopingRetry();
  verifyMillionaireStrongContinue();
  verifyWeakFlashReview();
  verifyStrongHistoryIsStable();
  verifySameInputSameOutput();
  verifyRecommendationDoesNotMutateSummary();
  verifyMalformedInputFailsSafe();
  verifyLessonAwareHref();
  verifyUnknownLessonFallsBack();
}
