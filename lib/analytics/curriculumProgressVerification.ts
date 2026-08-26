import { buildCurriculumProgress } from "@/lib/analytics/curriculumProgress";
import { JOURNEY_PROGRESS } from "@/lib/analytics/lessonProgress";
import { buildLearningSummaryForLesson } from "@/lib/analytics/summary";
import type { AggregatableLearningEvent } from "@/types/analytics";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
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

export function verifyEmptyHistoryStatuses(): void {
  const progress = buildCurriculumProgress([]);
  assert(progress.lessons.length === 2, "1: two curriculum lessons");
  assert(progress.lessons[0]?.lessonSlug === "present-simple", "1: first Present Simple");
  assert(progress.lessons[0]?.status === "ACTIVE", "1: Present ACTIVE");
  assert(progress.lessons[0]?.stage === "LEARN", "1: Present LEARN");
  assert(
    progress.lessons[0]?.progressPercent === JOURNEY_PROGRESS.learn,
    "1: Present initial 20%",
  );
  assert(progress.lessons[1]?.lessonSlug === "past-simple", "1: second Past Simple");
  assert(progress.lessons[1]?.status === "LOCKED", "1: Past LOCKED");
  assert(progress.lessons[1]?.progressPercent === 0, "1: Past 0%");
  assert(progress.completedLessons === 0, "1: 0 complete");
  assert(progress.totalLessons === 2, "1: 2 total");
  assert(progress.activeLessonSlug === "present-simple", "1: active Present Simple");
  assert(!progress.isCurriculumComplete, "1: not complete");
}

export function verifyPresentIncomplete(): void {
  const progress = buildCurriculumProgress([
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ]);
  assert(progress.lessons[0]?.status === "ACTIVE", "2: Present ACTIVE");
  assert(progress.lessons[0]?.stage === "PRACTICE", "2: Present PRACTICE");
  assert(progress.lessons[1]?.status === "LOCKED", "2: Past LOCKED");
  assert(progress.completedLessons === 0, "2: 0/2");
}

export function verifyPresentCompletePastActive(): void {
  const progress = buildCurriculumProgress(presentCompleteEvents());
  assert(progress.lessons[0]?.status === "COMPLETE", "3: Present COMPLETE");
  assert(progress.lessons[0]?.progressPercent === 100, "3: Present 100%");
  assert(progress.lessons[1]?.status === "ACTIVE", "3: Past ACTIVE");
  assert(progress.lessons[1]?.stage === "LEARN", "3: Past LEARN");
  assert(
    progress.lessons[1]?.progressPercent === JOURNEY_PROGRESS.learn,
    "3: Past initial 20%",
  );
  assert(progress.completedLessons === 1, "3: 1/2");
  assert(progress.activeLessonSlug === "past-simple", "3: active Past Simple");
}

export function verifyEarlyPastHistoryDoesNotUnlock(): void {
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
  const progress = buildCurriculumProgress(events);
  assert(progress.lessons[0]?.status === "ACTIVE", "4: Present ACTIVE");
  assert(progress.lessons[1]?.status === "LOCKED", "4: Past still LOCKED");
  assert(progress.lessons[1]?.progressPercent === 0, "4: Past display 0% while locked");
  assert(events.length === 2, "4: Past events still stored");
}

export function verifyPastPreexistingProgressWhenActive(): void {
  const events = [
    ...presentCompleteEvents(),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 50,
      completedAt: 20,
    }),
  ];
  const progress = buildCurriculumProgress(events);
  assert(progress.lessons[1]?.status === "ACTIVE", "5: Past ACTIVE");
  assert(progress.lessons[1]?.stage === "PRACTICE", "5: Past PRACTICE");
  assert(
    progress.lessons[1]?.progressPercent === JOURNEY_PROGRESS.quizWeak,
    "5: Past 40%",
  );
}

export function verifyBothComplete(): void {
  const progress = buildCurriculumProgress([
    ...presentCompleteEvents(),
    ...pastCompleteEvents(),
  ]);
  assert(progress.lessons[0]?.status === "COMPLETE", "6: Present COMPLETE");
  assert(progress.lessons[1]?.status === "COMPLETE", "6: Past COMPLETE");
  assert(progress.completedLessons === 2, "6: 2/2");
  assert(progress.overallProgressPercent === 100, "6: overall 100");
  assert(progress.isCurriculumComplete, "6: curriculum complete");
  assert(progress.activeLessonSlug === undefined, "6: no active lesson");
}

export function verifyOverallProgressAverage(): void {
  const empty = buildCurriculumProgress([]);
  assert(
    empty.overallProgressPercent ===
      Math.round((JOURNEY_PROGRESS.learn + 0) / 2),
    "7: empty average (20+0)/2 = 10",
  );

  const presentComplete = buildCurriculumProgress(presentCompleteEvents());
  assert(
    presentComplete.overallProgressPercent ===
      Math.round((100 + JOURNEY_PROGRESS.learn) / 2),
    "7: present complete average (100+20)/2 = 60",
  );

  const both = buildCurriculumProgress([
    ...presentCompleteEvents(),
    ...pastCompleteEvents(),
  ]);
  assert(both.overallProgressPercent === 100, "7: both complete 100");
}

export function verifyCompletedCount(): void {
  assert(buildCurriculumProgress([]).completedLessons === 0, "8: empty 0");
  assert(
    buildCurriculumProgress(presentCompleteEvents()).completedLessons === 1,
    "8: one complete",
  );
  assert(
    buildCurriculumProgress([
      ...presentCompleteEvents(),
      ...pastCompleteEvents(),
    ]).completedLessons === 2,
    "8: two complete",
  );
}

export function verifyActiveLessonHighlightSource(): void {
  const empty = buildCurriculumProgress([]);
  assert(empty.activeLessonSlug === "present-simple", "9: empty active");
  const afterPresent = buildCurriculumProgress(presentCompleteEvents());
  assert(afterPresent.activeLessonSlug === "past-simple", "9: after present");
}

export function verifyCurriculumOrderPreserved(): void {
  const progress = buildCurriculumProgress(pastCompleteEvents());
  assert(progress.lessons[0]?.lessonSlug === "present-simple", "10: first Present");
  assert(progress.lessons[1]?.lessonSlug === "past-simple", "10: second Past");
}

export function verifyUnknownLessonSafe(): void {
  const progress = buildCurriculumProgress([
    makeEvent({
      activity: "quiz",
      lessonSlug: "not-a-real-lesson",
      scorePercentage: 100,
    }),
  ]);
  assert(progress.lessons.length === 2, "11: no fake lesson card");
  assert(
    progress.lessons.every(
      (lesson) =>
        lesson.lessonSlug === "present-simple" ||
        lesson.lessonSlug === "past-simple",
    ),
    "11: only curriculum slugs",
  );
  assert(progress.completedLessons === 0, "11: unknown does not complete");
  assert(progress.activeLessonSlug === "present-simple", "11: still Present");
}

export function verifyHistoryOrderIndependence(): void {
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
  const first = buildCurriculumProgress(presentThenPast);
  const second = buildCurriculumProgress(pastThenPresent);
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "12: order independent",
  );
}

export function verifyCrossLessonIsolation(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
      completedAt: 1,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "past-simple",
      scorePercentage: 95,
      completedAt: 2,
    }),
  ];
  const present = buildLearningSummaryForLesson(events, "present-simple");
  const past = buildLearningSummaryForLesson(events, "past-simple");
  assert(present.averageQuizScore === 50, "13: Present quiz 50");
  assert(present.averageMillionaireScore === 0, "13: Present no Millionaire");
  assert(past.averageMillionaireScore === 95, "13: Past Millionaire 95");
  assert(past.averageQuizScore === 0, "13: Past no quiz");

  const progress = buildCurriculumProgress(events);
  assert(progress.lessons[0]?.stage === "PRACTICE", "13: Present PRACTICE from 50");
  assert(progress.lessons[1]?.status === "LOCKED", "13: Past locked despite 95");
  assert(progress.lessons[1]?.progressPercent === 0, "13: locked Past 0");
}

export function verifySameInputSameOutput(): void {
  const events = presentCompleteEvents();
  const copy = events.map((event) => ({ ...event }));
  const first = buildCurriculumProgress(events);
  const second = buildCurriculumProgress(copy);
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "14: same input same output",
  );
}

export function verifyNoMutation(): void {
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
  buildCurriculumProgress(events);
  assert(JSON.stringify(events) === snapshot, "15: history not mutated");
}

export function runCurriculumProgressVerification(): void {
  verifyEmptyHistoryStatuses();
  verifyPresentIncomplete();
  verifyPresentCompletePastActive();
  verifyEarlyPastHistoryDoesNotUnlock();
  verifyPastPreexistingProgressWhenActive();
  verifyBothComplete();
  verifyOverallProgressAverage();
  verifyCompletedCount();
  verifyActiveLessonHighlightSource();
  verifyCurriculumOrderPreserved();
  verifyUnknownLessonSafe();
  verifyHistoryOrderIndependence();
  verifyCrossLessonIsolation();
  verifySameInputSameOutput();
  verifyNoMutation();
}
