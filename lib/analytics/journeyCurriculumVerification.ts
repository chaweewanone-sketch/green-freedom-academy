import type { AggregatableLearningEvent, LearningSummary } from "@/types/analytics";
import {
  getCurriculumLessons,
  getFirstCurriculumLesson,
  getNextCurriculumLesson,
  isFinalCurriculumLesson,
} from "@/lib/lessons";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import {
  JOURNEY_ACTION_LABELS,
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

function makeEvent(
  overrides: Partial<AggregatableLearningEvent> &
    Pick<AggregatableLearningEvent, "activity" | "lessonSlug">,
): AggregatableLearningEvent {
  return {
    sessionId: overrides.sessionId ?? "session",
    completedAt: overrides.completedAt ?? 1,
    activity: overrides.activity,
    lessonSlug: overrides.lessonSlug,
    scorePercentage: overrides.scorePercentage,
    flashEasy: overrides.flashEasy,
    flashMedium: overrides.flashMedium,
    flashHard: overrides.flashHard,
  };
}

function firstLessonSlug(): string {
  const first = getFirstCurriculumLesson();
  assert(Boolean(first), "curriculum has a first lesson");
  return first?.slug ?? "present-simple";
}

export function verifyCurriculumOrder(): void {
  const lessons = getCurriculumLessons();
  assert(lessons.length >= 2, "curriculum has at least two lessons");
  assert(lessons[0]?.slug === "present-simple", "first lesson is Present Simple");
  assert(lessons[1]?.slug === "past-simple", "second lesson is Past Simple");
  assert(
    getNextCurriculumLesson("present-simple")?.slug === "past-simple",
    "next after Present Simple is Past Simple",
  );
  assert(
    getNextCurriculumLesson("past-simple") === null,
    "Past Simple has no invented next lesson",
  );
  assert(isFinalCurriculumLesson("past-simple"), "Past Simple is currently final");
  assert(
    !isFinalCurriculumLesson("unknown-lesson"),
    "unknown slug is not treated as final",
  );
  assert(
    getNextCurriculumLesson("unknown-lesson") === null,
    "unknown slug has no next lesson",
  );
}

export function verifyEmptyHistoryUsesFirstLesson(): void {
  const firstSlug = firstLessonSlug();
  const journey = buildLearningJourney(emptySummary(), []);
  assert(journey.lessonSlug === firstSlug, "case 1: first lesson");
  assert(journey.stage === "LEARN", "case 1: LEARN");
  assert(journey.nextAction.label === JOURNEY_ACTION_LABELS.learn, "case 1: CTA");
  assert(
    journey.nextAction.href === getLessonPath(firstSlug),
    "case 1: first lesson route",
  );
  assert(!journey.isCurriculumComplete, "case 1: curriculum not complete");
  assert(!journey.nextLessonSlug, "case 1: no next lesson yet");
}

export function verifyWeakPresentSimpleQuizIsPractice(): void {
  const journey = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ]);
  assert(journey.lessonSlug === "present-simple", "case 2: Present Simple");
  assert(journey.stage === "PRACTICE", "case 2: PRACTICE");
  assert(
    journey.nextAction.href === getActivityPath("present-simple", "quiz"),
    "case 2: present-simple quiz route",
  );
}

export function verifyStrongPresentSimpleQuizIsPlay(): void {
  const journey = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
    }),
  ]);
  assert(journey.lessonSlug === "present-simple", "case 3: Present Simple");
  assert(journey.stage === "PLAY", "case 3: PLAY");
  assert(
    journey.nextAction.href === getActivityPath("present-simple", "millionaire"),
    "case 3: present-simple millionaire route",
  );
}

export function verifyWeakPresentSimpleMillionaireIsReview(): void {
  const journey = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 60,
    }),
  ]);
  assert(journey.lessonSlug === "present-simple", "case 4: Present Simple");
  assert(journey.stage === "REVIEW", "case 4: REVIEW");
  assert(
    journey.nextAction.href === getActivityPath("present-simple", "quiz"),
    "case 4: present-simple quiz review route",
  );
}

export function verifyPresentSimpleCompleteNavigatesToPastSimple(): void {
  const journey = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 1,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 2,
    }),
  ]);
  assert(journey.lessonSlug === "past-simple", "case 5: active is Past Simple");
  assert(journey.stage === "LEARN", "case 5: Past Simple LEARN");
  assert(!journey.isCurriculumComplete, "case 5: more lessons remain");
  assert(
    journey.nextAction.label === "ดูผลการเรียน",
    "case 5: ดูผลการเรียน",
  );
  assert(
    journey.nextAction.href === getDashboardPath(),
    "case 5: /dashboard not Past Simple launch",
  );
}

export function verifyPastSimpleStartUsesPastSimpleRoutes(): void {
  const journey = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 50,
    }),
  ]);
  assert(
    journey.lessonSlug === "present-simple",
    "case 6: out-of-order Past activity does not become active",
  );
  assert(journey.stage === "LEARN", "case 6: Present Simple still LEARN");
  assert(
    journey.nextAction.href === getLessonPath("present-simple"),
    "case 6: present-simple lesson route",
  );
}

export function verifyFinalLessonCompleteHasSafeCta(): void {
  const journey = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 1,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 2,
    }),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: 3,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: 4,
    }),
  ]);
  assert(journey.lessonSlug === "past-simple", "case 7: Past Simple");
  assert(journey.stage === "COMPLETE", "case 7: COMPLETE");
  assert(!journey.nextLessonSlug, "case 7: no invented next lesson");
  assert(journey.isCurriculumComplete, "case 7: curriculum complete");
  assert(
    journey.nextAction.label === JOURNEY_ACTION_LABELS.complete,
    "case 7: dashboard CTA label",
  );
  assert(
    journey.nextAction.href === getDashboardPath(),
    "case 7: dashboard route",
  );
}

export function verifyUnknownLessonSlugFailsSafe(): void {
  const firstSlug = firstLessonSlug();
  const fromEvents = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "quiz",
      lessonSlug: "not-a-real-lesson",
      scorePercentage: 95,
    }),
  ]);
  assert(fromEvents.stage === "LEARN", "case 8 events: LEARN");
  assert(fromEvents.lessonSlug === firstSlug, "case 8 events: first lesson");
  assert(
    fromEvents.nextAction.href === getLessonPath(firstSlug),
    "case 8 events: valid first-lesson route",
  );
  assert(
    !fromEvents.nextAction.href.includes("not-a-real-lesson"),
    "case 8 events: no invalid route",
  );

  const fromSummary = buildLearningJourney({
    ...emptySummary(),
    totalActivities: 1,
    quizAttempts: 1,
    averageQuizScore: 95,
    latestLesson: "not-a-real-lesson",
    latestActivity: "quiz",
  });
  assert(fromSummary.stage === "LEARN", "case 8 summary: LEARN");
  assert(fromSummary.lessonSlug === firstSlug, "case 8 summary: first lesson");
  assert(
    fromSummary.nextAction.href === getLessonPath(firstSlug),
    "case 8 summary: valid first-lesson route",
  );
}

export function verifyFlashOverrideIsPerLesson(): void {
  const presentSimpleOverride = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 1,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 2,
    }),
    makeEvent({
      activity: "flash-cards",
      lessonSlug: "present-simple",
      completedAt: 3,
      flashEasy: 1,
      flashMedium: 2,
      flashHard: 3,
    }),
  ]);
  assert(presentSimpleOverride.stage === "REVIEW", "case 9: REVIEW");
  assert(
    presentSimpleOverride.reasonCode === "FLASH_WEAK_OVERRIDE",
    "case 9: flash override",
  );
  assert(
    presentSimpleOverride.nextAction.href ===
      getActivityPath("present-simple", "flash-cards"),
    "case 9: present-simple flash route",
  );
  assert(
    !presentSimpleOverride.nextLessonSlug,
    "case 9: flash override blocks next-lesson CTA",
  );

  const pastSimpleOverride = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 1,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 2,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: 3,
    }),
    makeEvent({
      activity: "flash-cards",
      lessonSlug: "past-simple",
      completedAt: 4,
      flashEasy: 0,
      flashMedium: 3,
      flashHard: 3,
    }),
  ]);
  assert(pastSimpleOverride.lessonSlug === "past-simple", "case 9b: Past Simple");
  assert(pastSimpleOverride.stage === "REVIEW", "case 9b: REVIEW");
  assert(
    pastSimpleOverride.nextAction.href === getDashboardPath(),
    "case 9b: Past Simple flash not launchable",
  );
}

export function verifyLessonScoresAreNotMixed(): void {
  const latestPresentSimple = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "millionaire",
      lessonSlug: "past-simple",
      scorePercentage: 95,
      completedAt: 1,
    }),
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
      completedAt: 2,
    }),
  ]);
  assert(
    latestPresentSimple.lessonSlug === "present-simple",
    "case 10: current is Present Simple",
  );
  assert(
    latestPresentSimple.stage === "PRACTICE",
    "case 10: weak Present Simple quiz is PRACTICE",
  );
  assert(
    latestPresentSimple.nextAction.href ===
      getActivityPath("present-simple", "quiz"),
    "case 10: present-simple quiz route",
  );

  const latestPastSimple = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 95,
      completedAt: 1,
    }),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 40,
      completedAt: 2,
    }),
  ]);
  assert(
    latestPastSimple.lessonSlug === "past-simple",
    "case 10b: current is Past Simple",
  );
  assert(
    latestPastSimple.stage === "PRACTICE",
    "case 10b: weak Past Simple quiz is PRACTICE",
  );
  assert(
    latestPastSimple.nextAction.href === getDashboardPath(),
    "case 10b: Past Simple quiz not launchable",
  );

  const otherLessonFlash = buildLearningJourney(emptySummary(), [
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 2,
    }),
    makeEvent({
      activity: "flash-cards",
      lessonSlug: "past-simple",
      completedAt: 1,
      flashEasy: 0,
      flashMedium: 4,
      flashHard: 4,
    }),
  ]);
  assert(
    otherLessonFlash.lessonSlug === "past-simple",
    "case 10c: active advances to Past Simple after Present completes",
  );
  assert(
    otherLessonFlash.stage === "REVIEW",
    "case 10c: Past Simple flash is evaluated without Present Simple scores",
  );
  assert(
    otherLessonFlash.reasonCode === "FLASH_WEAK_OVERRIDE",
    "case 10c: Past Simple flash override",
  );
}

export function runJourneyCurriculumVerification(): void {
  verifyCurriculumOrder();
  verifyEmptyHistoryUsesFirstLesson();
  verifyWeakPresentSimpleQuizIsPractice();
  verifyStrongPresentSimpleQuizIsPlay();
  verifyWeakPresentSimpleMillionaireIsReview();
  verifyPresentSimpleCompleteNavigatesToPastSimple();
  verifyPastSimpleStartUsesPastSimpleRoutes();
  verifyFinalLessonCompleteHasSafeCta();
  verifyUnknownLessonSlugFailsSafe();
  verifyFlashOverrideIsPerLesson();
  verifyLessonScoresAreNotMixed();
}
