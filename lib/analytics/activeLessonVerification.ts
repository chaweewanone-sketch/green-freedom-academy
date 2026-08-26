import { isLessonComplete, resolveActiveLesson } from "@/lib/analytics/activeLesson";
import { buildLearningSummaryForLesson } from "@/lib/analytics/summary";
import { getLessonPath } from "@/lib/routes";
import type { AggregatableLearningEvent, LearningSummary } from "@/types/analytics";
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

function presentCompleteEvents(
  startAt: number = 1,
): AggregatableLearningEvent[] {
  return [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: startAt,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: startAt + 1,
    }),
  ];
}

function pastCompleteEvents(startAt: number = 10): AggregatableLearningEvent[] {
  return [
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: startAt,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: startAt + 1,
    }),
  ];
}

export function verifyEmptyHistoryActivePresentSimple(): void {
  const resolved = resolveActiveLesson([]);
  const journey = buildLearningJourney(emptySummary(), []);
  assert(resolved.lessonSlug === "present-simple", "1: resolver present-simple");
  assert(!resolved.isCurriculumComplete, "1: not complete");
  assert(journey.lessonSlug === "present-simple", "1: journey present-simple");
  assert(journey.stage === "LEARN", "1: LEARN");
}

export function verifyPresentIncompleteStaysActive(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ];
  const resolved = resolveActiveLesson(events);
  const journey = buildLearningJourney(emptySummary(), events);
  assert(resolved.lessonSlug === "present-simple", "2: active present-simple");
  assert(journey.stage === "PRACTICE", "2: PRACTICE");
}

export function verifyOutOfOrderPastDoesNotAdvanceActive(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
      completedAt: 1,
    }),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 95,
      completedAt: 99,
    }),
  ];
  const resolved = resolveActiveLesson(events);
  const journey = buildLearningJourney(emptySummary(), events);
  assert(resolved.lessonSlug === "present-simple", "3: active remains Present Simple");
  assert(journey.stage === "PRACTICE", "3: Present Simple PRACTICE");
  assert(
    journey.nextAction.href !== getLessonPath("past-simple"),
    "3: does not jump to Past Simple lesson",
  );
  assert(isLessonComplete(events, "present-simple") === false, "3: Present incomplete");
}

export function verifyPresentCompletePastUntouchedIsLearn(): void {
  const events = presentCompleteEvents();
  const resolved = resolveActiveLesson(events);
  const journey = buildLearningJourney(emptySummary(), events);
  assert(resolved.lessonSlug === "past-simple", "4: active Past Simple");
  assert(journey.stage === "LEARN", "4: Past Simple LEARN");
  assert(
    journey.nextAction.label === JOURNEY_ACTION_LABELS.learn,
    "4: เริ่มเรียน",
  );
  assert(
    journey.nextAction.href === getLessonPath("past-simple"),
    "4: /lesson/past-simple",
  );
  assert(!journey.isCurriculumComplete, "4: curriculum not complete");
}

export function verifyPresentCompletePastWeakQuizIsPractice(): void {
  const events = [
    ...presentCompleteEvents(),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 50,
      completedAt: 20,
    }),
  ];
  const journey = buildLearningJourney(emptySummary(), events);
  assert(journey.lessonSlug === "past-simple", "5: active Past Simple");
  assert(journey.stage === "PRACTICE", "5: Past PRACTICE");
}

export function verifyPresentCompletePastStrongQuizIsPlay(): void {
  const events = [
    ...presentCompleteEvents(),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: 20,
    }),
  ];
  const journey = buildLearningJourney(emptySummary(), events);
  assert(journey.lessonSlug === "past-simple", "6: active Past Simple");
  assert(journey.stage === "PLAY", "6: Past PLAY without Millionaire");
}

export function verifyBothLessonsComplete(): void {
  const events = [...presentCompleteEvents(), ...pastCompleteEvents()];
  const resolved = resolveActiveLesson(events);
  const journey = buildLearningJourney(emptySummary(), events);
  assert(resolved.isCurriculumComplete, "7: resolver curriculum complete");
  assert(journey.isCurriculumComplete, "7: journey curriculum complete");
  assert(journey.lessonSlug === "past-simple", "7: final lesson");
  assert(journey.stage === "COMPLETE", "7: COMPLETE");
}

export function verifyUnknownLessonEventsIgnored(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "not-a-real-lesson",
      scorePercentage: 100,
      completedAt: 50,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "not-a-real-lesson",
      scorePercentage: 100,
      completedAt: 51,
    }),
  ];
  const resolved = resolveActiveLesson(events);
  const journey = buildLearningJourney(emptySummary(), events);
  assert(resolved.lessonSlug === "present-simple", "8: unknown ignored");
  assert(journey.stage === "LEARN", "8: first lesson LEARN");
  assert(
    !journey.nextAction.href.includes("not-a-real-lesson"),
    "8: no invalid route",
  );
}

export function verifyHistoryOrderDoesNotChangeActiveLesson(): void {
  const presentThenPast = [
    ...presentCompleteEvents(1),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 50,
      completedAt: 3,
    }),
  ];
  const pastThenPresent = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 50,
      completedAt: 1,
    }),
    ...presentCompleteEvents(10),
  ];
  const first = resolveActiveLesson(presentThenPast);
  const second = resolveActiveLesson(pastThenPresent);
  assert(first.lessonSlug === "past-simple", "9: present-first still Past active");
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "9: timestamp order does not change active lesson",
  );
}

export function verifySameHistorySameActiveAndJourney(): void {
  const events = [
    ...presentCompleteEvents(),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 50,
      completedAt: 20,
    }),
  ];
  const copy = events.map((event) => ({ ...event }));
  const firstResolved = resolveActiveLesson(events);
  const secondResolved = resolveActiveLesson(copy);
  const firstJourney = buildLearningJourney(emptySummary(), events);
  const secondJourney = buildLearningJourney(emptySummary(), copy);
  assert(
    JSON.stringify(firstResolved) === JSON.stringify(secondResolved),
    "10: same active lesson",
  );
  assert(
    JSON.stringify(firstJourney) === JSON.stringify(secondJourney),
    "10: same journey",
  );
}

export function verifyResolverDoesNotMutateHistory(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 95,
      completedAt: 2,
    }),
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
      completedAt: 1,
    }),
  ];
  const snapshot = JSON.stringify(events);
  Object.freeze(events);
  events.forEach((event) => Object.freeze(event));
  resolveActiveLesson(events);
  buildLearningJourney(emptySummary(), events);
  assert(JSON.stringify(events) === snapshot, "11: history not mutated");
}

export function verifyCrossLessonScoresDoNotMix(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 40,
      completedAt: 1,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "past-simple",
      scorePercentage: 95,
      completedAt: 2,
    }),
  ];
  const presentSummary = buildLearningSummaryForLesson(events, "present-simple");
  const pastSummary = buildLearningSummaryForLesson(events, "past-simple");
  assert(presentSummary.averageQuizScore === 40, "12: Present quiz 40");
  assert(presentSummary.averageMillionaireScore === 0, "12: Present has no Millionaire");
  assert(presentSummary.quizAttempts === 1, "12: Present one quiz");
  assert(pastSummary.averageMillionaireScore === 95, "12: Past Millionaire 95");
  assert(pastSummary.averageQuizScore === 0, "12: Past has no quiz");
  assert(pastSummary.millionaireAttempts === 1, "12: Past one Millionaire");

  const journey = buildLearningJourney(emptySummary(), events);
  assert(journey.lessonSlug === "present-simple", "12: active Present Simple");
  assert(journey.stage === "PRACTICE", "12: Present weak quiz not mixed with Past Millionaire");
}

export function runActiveLessonVerification(): void {
  verifyEmptyHistoryActivePresentSimple();
  verifyPresentIncompleteStaysActive();
  verifyOutOfOrderPastDoesNotAdvanceActive();
  verifyPresentCompletePastUntouchedIsLearn();
  verifyPresentCompletePastWeakQuizIsPractice();
  verifyPresentCompletePastStrongQuizIsPlay();
  verifyBothLessonsComplete();
  verifyUnknownLessonEventsIgnored();
  verifyHistoryOrderDoesNotChangeActiveLesson();
  verifySameHistorySameActiveAndJourney();
  verifyResolverDoesNotMutateHistory();
  verifyCrossLessonScoresDoNotMix();
}
