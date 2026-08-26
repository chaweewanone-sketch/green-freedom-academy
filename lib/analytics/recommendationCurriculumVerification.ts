import { resolveActiveLesson } from "@/lib/analytics/activeLesson";
import { buildLearningSummaryForLesson } from "@/lib/analytics/summary";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import type { AggregatableLearningEvent, LearningSummary } from "@/types/analytics";
import { buildLearningRecommendation } from "./recommendation";

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

export function verifyEmptyStartsPresentSimple(): void {
  const recommendation = buildLearningRecommendation(emptySummary(), []);
  assert(recommendation.kind === "START", "1: START");
  assert(recommendation.lessonSlug === "present-simple", "1: present-simple");
  assert(
    recommendation.href === getLessonPath("present-simple"),
    "1: present-simple route",
  );
}

export function verifyPresentWeakQuizRetry(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.kind === "RETRY", "2: RETRY");
  assert(recommendation.reasonCode === "QUIZ_WEAK", "2: QUIZ_WEAK");
  assert(recommendation.lessonSlug === "present-simple", "2: present-simple");
  assert(
    recommendation.href === getActivityPath("present-simple", "quiz"),
    "2: present-simple quiz",
  );
}

export function verifyPresentMediumQuizPractice(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 75,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.kind === "PRACTICE", "3: PRACTICE");
  assert(recommendation.reasonCode === "QUIZ_DEVELOPING", "3: QUIZ_DEVELOPING");
  assert(recommendation.lessonSlug === "present-simple", "3: present-simple");
}

export function verifyPresentStrongQuizPlay(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.kind === "PLAY", "4: PLAY");
  assert(recommendation.activity === "millionaire", "4: millionaire");
  assert(
    recommendation.href === getActivityPath("present-simple", "millionaire"),
    "4: present-simple millionaire",
  );
}

export function verifyPresentWeakMillionairePractice(): void {
  const events = [
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 60,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.kind === "PRACTICE", "5: PRACTICE");
  assert(recommendation.reasonCode === "MILLIONAIRE_WEAK", "5: MILLIONAIRE_WEAK");
  assert(
    recommendation.href === getActivityPath("present-simple", "quiz"),
    "5: present-simple quiz",
  );
}

export function verifyPresentMediumMillionaireRetry(): void {
  const events = [
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 75,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.kind === "RETRY", "6: RETRY");
  assert(
    recommendation.reasonCode === "MILLIONAIRE_DEVELOPING",
    "6: MILLIONAIRE_DEVELOPING",
  );
  assert(
    recommendation.href === getActivityPath("present-simple", "millionaire"),
    "6: present-simple millionaire",
  );
}

export function verifyPresentStrongMillionaireContinuesToPast(): void {
  const events = presentCompleteEvents();
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.kind === "CONTINUE", "7: CONTINUE");
  assert(recommendation.ctaLabel === "เรียนบทถัดไป", "7: เรียนบทถัดไป");
  assert(recommendation.lessonSlug === "past-simple", "7: past-simple");
  assert(
    recommendation.href === getLessonPath("past-simple"),
    "7: /lesson/past-simple",
  );
}

export function verifyOutOfOrderPastDoesNotRedirect(): void {
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
      scorePercentage: 100,
      completedAt: 99,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.lessonSlug === "present-simple", "8: stays Present Simple");
  assert(recommendation.reasonCode === "QUIZ_WEAK", "8: Present 50% not Past 100%");
  assert(
    recommendation.href === getActivityPath("present-simple", "quiz"),
    "8: present-simple quiz",
  );
}

export function verifyPresentCompletePastWeakQuiz(): void {
  const events = [
    ...presentCompleteEvents(),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 50,
      completedAt: 20,
    }),
  ];
  const resolved = resolveActiveLesson(events);
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(resolved.lessonSlug === "past-simple", "9: active Past Simple");
  assert(recommendation.lessonSlug === "past-simple", "9: recommends Past Simple");
  assert(recommendation.kind === "RETRY", "9: weak Past Quiz RETRY");
  assert(
    recommendation.href === getActivityPath("past-simple", "quiz"),
    "9: past-simple quiz",
  );
}

export function verifyPresentCompletePastStrongQuizPlay(): void {
  const events = [
    ...presentCompleteEvents(),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: 20,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.lessonSlug === "past-simple", "10: Past Simple");
  assert(recommendation.kind === "PLAY", "10: PLAY");
  assert(
    recommendation.href === getActivityPath("past-simple", "millionaire"),
    "10: past-simple millionaire",
  );
}

export function verifyBothLessonsCompleteDashboard(): void {
  const events = [...presentCompleteEvents(), ...pastCompleteEvents()];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.kind === "CONTINUE", "11: CONTINUE");
  assert(recommendation.ctaLabel === "ดูสรุปการเรียน", "11: dashboard CTA");
  assert(
    recommendation.href === getDashboardPath(),
    "11: /dashboard",
  );
}

export function verifyInactiveFlashDoesNotOverride(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
      completedAt: 2,
    }),
    makeEvent({
      activity: "flash-cards",
      lessonSlug: "past-simple",
      completedAt: 3,
      flashEasy: 0,
      flashMedium: 4,
      flashHard: 4,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.lessonSlug === "present-simple", "12: Present Simple");
  assert(recommendation.reasonCode === "QUIZ_WEAK", "12: Past flash ignored");
  assert(recommendation.activity === "quiz", "12: quiz not flash-cards");
}

export function verifyActiveFlashOverride(): void {
  const events = [
    ...presentCompleteEvents(1),
    makeEvent({
      activity: "flash-cards",
      lessonSlug: "present-simple",
      completedAt: 3,
      flashEasy: 1,
      flashMedium: 2,
      flashHard: 3,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.lessonSlug === "present-simple", "13: still Present Simple");
  assert(recommendation.kind === "REVIEW", "13: REVIEW");
  assert(recommendation.reasonCode === "FLASH_WEAK", "13: FLASH_WEAK");
  assert(
    recommendation.href === getActivityPath("present-simple", "flash-cards"),
    "13: present-simple flash-cards",
  );
}

export function verifyCrossLessonScoresIsolated(): void {
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
      scorePercentage: 100,
      completedAt: 2,
    }),
  ];
  const present = buildLearningSummaryForLesson(events, "present-simple");
  const past = buildLearningSummaryForLesson(events, "past-simple");
  assert(present.averageQuizScore === 50, "14: Present 50");
  assert(past.averageQuizScore === 100, "14: Past 100");
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  assert(recommendation.reasonCode === "QUIZ_WEAK", "14: uses 50 not blended 75");
  assert(recommendation.lessonSlug === "present-simple", "14: Present Simple");
}

export function verifyHistoryOrderDoesNotChangeRecommendation(): void {
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
  const first = buildLearningRecommendation(emptySummary(), presentThenPast);
  const second = buildLearningRecommendation(emptySummary(), pastThenPresent);
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "15: timestamp order does not change recommendation",
  );
  assert(first.lessonSlug === "past-simple", "15: Past Simple");
  assert(first.reasonCode === "QUIZ_WEAK", "15: Past weak quiz");
}

export function verifySameInputSameRecommendation(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 75,
    }),
  ];
  const copy = events.map((event) => ({ ...event }));
  const first = buildLearningRecommendation(emptySummary(), events);
  const second = buildLearningRecommendation(emptySummary(), copy);
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "16: same input same recommendation",
  );
}

export function verifyRecommendationDoesNotMutateEvents(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 100,
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
  buildLearningRecommendation(emptySummary(), events);
  assert(JSON.stringify(events) === snapshot, "17: events not mutated");
}

export function runRecommendationCurriculumVerification(): void {
  verifyEmptyStartsPresentSimple();
  verifyPresentWeakQuizRetry();
  verifyPresentMediumQuizPractice();
  verifyPresentStrongQuizPlay();
  verifyPresentWeakMillionairePractice();
  verifyPresentMediumMillionaireRetry();
  verifyPresentStrongMillionaireContinuesToPast();
  verifyOutOfOrderPastDoesNotRedirect();
  verifyPresentCompletePastWeakQuiz();
  verifyPresentCompletePastStrongQuizPlay();
  verifyBothLessonsCompleteDashboard();
  verifyInactiveFlashDoesNotOverride();
  verifyActiveFlashOverride();
  verifyCrossLessonScoresIsolated();
  verifyHistoryOrderDoesNotChangeRecommendation();
  verifySameInputSameRecommendation();
  verifyRecommendationDoesNotMutateEvents();
}
