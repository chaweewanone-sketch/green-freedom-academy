import { getActivityPath } from "@/lib/activities";
import { getLessonPath } from "@/lib/lessons";
import type { LearningSummary } from "@/types/analytics";
import {
  DEFAULT_JOURNEY_LESSON_SLUG,
  JOURNEY_PROGRESS,
  buildLearningJourney,
} from "./journey";

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

function completeWithFlash(
  easy: number,
  medium: number,
  hard: number,
): LearningSummary {
  return {
    totalActivities: 3,
    quizAttempts: 1,
    millionaireAttempts: 1,
    flashCardAttempts: 1,
    averageQuizScore: 90,
    averageMillionaireScore: 90,
    flashEasy: easy,
    flashMedium: medium,
    flashHard: hard,
    latestActivity: "flash-cards",
    latestLesson: "present-simple",
  };
}

export function verifyEmptyHistoryIsLearn(): void {
  const journey = buildLearningJourney(emptySummary());
  assert(journey.stage === "LEARN", "empty: LEARN");
  assert(journey.reasonCode === "EMPTY_HISTORY", "empty: reason");
  assert(journey.progressPercent === JOURNEY_PROGRESS.learn, "empty: 20%");
  assert(
    journey.nextHref === getLessonPath(DEFAULT_JOURNEY_LESSON_SLUG),
    "empty: lesson href",
  );
}

export function verifyQuizWeakIsPractice(): void {
  const journey = buildLearningJourney(quizSummary(50));
  assert(journey.stage === "PRACTICE", "quiz 50: PRACTICE");
  assert(journey.reasonCode === "QUIZ_WEAK", "quiz 50: reason");
  assert(journey.progressPercent === JOURNEY_PROGRESS.quizWeak, "quiz 50: 40%");
  assert(
    journey.nextHref === getActivityPath("present-simple", "quiz"),
    "quiz 50: quiz href",
  );
}

export function verifyQuizDevelopingIsPractice(): void {
  const journey = buildLearningJourney(quizSummary(75));
  assert(journey.stage === "PRACTICE", "quiz 75: PRACTICE");
  assert(journey.reasonCode === "QUIZ_DEVELOPING", "quiz 75: reason");
  assert(
    journey.progressPercent === JOURNEY_PROGRESS.quizDeveloping,
    "quiz 75: 50%",
  );
}

export function verifyQuizStrongWithoutMillionaireIsPlay(): void {
  const journey = buildLearningJourney(quizSummary(90));
  assert(journey.stage === "PLAY", "quiz 90: PLAY");
  assert(journey.reasonCode === "QUIZ_STRONG", "quiz 90: reason");
  assert(
    journey.progressPercent === JOURNEY_PROGRESS.quizStrongPlay,
    "quiz 90: 70%",
  );
  assert(
    journey.nextHref === getActivityPath("present-simple", "millionaire"),
    "quiz 90: millionaire href",
  );
}

export function verifyMillionaireWeakIsReview(): void {
  const journey = buildLearningJourney(millionaireSummary(60));
  assert(journey.stage === "REVIEW", "millionaire 60: REVIEW");
  assert(journey.reasonCode === "MILLIONAIRE_WEAK", "millionaire 60: reason");
  assert(
    journey.progressPercent === JOURNEY_PROGRESS.millionaireWeak,
    "millionaire 60: 75%",
  );
}

export function verifyMillionaireDevelopingIsPlay(): void {
  const journey = buildLearningJourney(millionaireSummary(75));
  assert(journey.stage === "PLAY", "millionaire 75: PLAY");
  assert(
    journey.reasonCode === "MILLIONAIRE_DEVELOPING",
    "millionaire 75: reason",
  );
  assert(
    journey.progressPercent === JOURNEY_PROGRESS.millionaireDeveloping,
    "millionaire 75: 85%",
  );
}

export function verifyMillionaireStrongIsComplete(): void {
  const journey = buildLearningJourney(millionaireSummary(90));
  assert(journey.stage === "COMPLETE", "millionaire 90: COMPLETE");
  assert(journey.reasonCode === "MILLIONAIRE_STRONG", "millionaire 90: reason");
  assert(
    journey.progressPercent === JOURNEY_PROGRESS.complete,
    "millionaire 90: 100%",
  );
}

export function verifyWeakFlashOverridesComplete(): void {
  const journey = buildLearningJourney(completeWithFlash(1, 2, 3));
  assert(journey.stage === "REVIEW", "flash override: REVIEW");
  assert(journey.reasonCode === "FLASH_WEAK_OVERRIDE", "flash override: reason");
  assert(
    journey.nextHref === getActivityPath("present-simple", "flash-cards"),
    "flash override: flash href",
  );
}

export function verifyStrongHistoryIsStable(): void {
  const summary = completeWithFlash(8, 1, 0);
  const first = buildLearningJourney(summary);
  const second = buildLearningJourney(summary);
  assert(first.stage === "COMPLETE", "strong history: COMPLETE");
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "strong history: deterministic",
  );
}

export function verifySameInputSameOutput(): void {
  const summary = quizSummary(75);
  const first = buildLearningJourney(summary);
  const second = buildLearningJourney({ ...summary });
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "same input: same journey",
  );
}

export function verifyJourneyDoesNotMutateSummary(): void {
  const summary = quizSummary(50);
  const snapshot = JSON.stringify(summary);
  Object.freeze(summary);
  buildLearningJourney(summary);
  assert(JSON.stringify(summary) === snapshot, "must not mutate summary");
}

export function verifyMalformedInputFailsSafe(): void {
  const fromNull = buildLearningJourney(null);
  assert(fromNull.stage === "LEARN", "null: LEARN");
  assert(fromNull.reasonCode === "FALLBACK_LEARN", "null: fallback");

  const fromEmpty = buildLearningJourney({});
  assert(fromEmpty.stage === "LEARN", "empty object: LEARN");
  assert(fromEmpty.reasonCode === "EMPTY_HISTORY", "empty object: empty history");
}

export function verifyLessonAwareHref(): void {
  const journey = buildLearningJourney({
    ...quizSummary(90),
    latestLesson: "past-simple",
  });
  assert(journey.lessonSlug === "past-simple", "lesson-aware slug");
  assert(
    journey.nextHref === getActivityPath("past-simple", "millionaire"),
    "lesson-aware href",
  );
}

export function runJourneyVerification(): void {
  verifyEmptyHistoryIsLearn();
  verifyQuizWeakIsPractice();
  verifyQuizDevelopingIsPractice();
  verifyQuizStrongWithoutMillionaireIsPlay();
  verifyMillionaireWeakIsReview();
  verifyMillionaireDevelopingIsPlay();
  verifyMillionaireStrongIsComplete();
  verifyWeakFlashOverridesComplete();
  verifyStrongHistoryIsStable();
  verifySameInputSameOutput();
  verifyJourneyDoesNotMutateSummary();
  verifyMalformedInputFailsSafe();
  verifyLessonAwareHref();
}
