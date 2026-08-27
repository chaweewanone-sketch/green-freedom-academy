import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JOURNEY_ACTION_LABELS, JOURNEY_PROGRESS } from "@/lib/analytics/lessonProgress";
import { buildLessonEntry } from "@/lib/analytics/lessonEntry";
import { buildResumeLearning, isKnownResumeHref } from "@/lib/analytics/resumeLearning";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import type { AggregatableLearningEvent, LearningSummary } from "@/types/analytics";

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

export function verifyEmptyPresentActiveLearn(): void {
  const entry = buildLessonEntry("present-simple", []);
  assert(entry.isActiveLesson, "1: Present active");
  assert(entry.stage === "LEARN", "1: LEARN");
  assert(entry.progressPercent === JOURNEY_PROGRESS.learn, "1: initial %");
  assert(entry.nextAction.label === JOURNEY_ACTION_LABELS.learn, "1: เริ่มเรียน");
  assert(
    entry.nextAction.href === getLessonPath("present-simple"),
    "1: Present path",
  );
  assert(entry.noticeKind === "active", "1: active notice");
}

export function verifyEmptyPastDirectEntryWarning(): void {
  const entry = buildLessonEntry("past-simple", []);
  assert(!entry.isActiveLesson, "2: Past not active");
  assert(entry.isLockedInCurriculum, "2: locked display");
  assert(entry.noticeKind === "out-of-order", "2: warning");
  assert(entry.progressPercent === 0, "2: no fake percent");
  assert(!entry.hasLessonHistory, "2: no history");
  assert(entry.activeLessonSlug === "present-simple", "2: Present current");
  assert(
    entry.nextAction.href === getLessonPath("present-simple"),
    "2: back to Present",
  );
  assert(entry.nextAction.label.includes("Present Simple"), "2: back label");
}

export function verifyWeakPresentQuizPractice(): void {
  const entry = buildLessonEntry("present-simple", [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ]);
  assert(entry.isActiveLesson, "3: active");
  assert(entry.stage === "PRACTICE", "3: PRACTICE");
  assert(entry.nextAction.actionType === "PRACTICE", "3: PRACTICE action");
  assert(
    entry.nextAction.href === getActivityPath("present-simple", "quiz"),
    "3: Present Quiz",
  );
}

export function verifyStrongPresentQuizPlay(): void {
  const entry = buildLessonEntry("present-simple", [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
    }),
  ]);
  assert(entry.isActiveLesson, "4: active");
  assert(entry.stage === "PLAY", "4: PLAY");
  assert(
    entry.nextAction.href === getActivityPath("present-simple", "millionaire"),
    "4: Present Millionaire",
  );
}

export function verifyWeakPresentMillionaireReview(): void {
  const entry = buildLessonEntry("present-simple", [
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 60,
    }),
  ]);
  assert(entry.isActiveLesson, "5: active");
  assert(entry.stage === "REVIEW", "5: REVIEW");
  assert(
    entry.nextAction.href === getActivityPath("present-simple", "quiz"),
    "5: review Quiz",
  );
}

export function verifyPresentCompleteNextPast(): void {
  const entry = buildLessonEntry("present-simple", presentCompleteEvents());
  const resume = buildResumeLearning(emptySummary(), presentCompleteEvents());
  assert(entry.isComplete, "6: complete");
  assert(!entry.isActiveLesson, "6: no longer active");
  assert(entry.notice === "เรียนจบบทนี้แล้ว", "6: complete copy");
  assert(entry.nextAction.actionType === "NEXT_LESSON", "6: NEXT_LESSON");
  assert(entry.nextAction.href === getLessonPath("past-simple"), "6: Past");
  assert(entry.nextAction.href === resume.action.href, "6: resume reused");
}

export function verifyPastActiveLearnAfterPresentComplete(): void {
  const entry = buildLessonEntry("past-simple", presentCompleteEvents());
  assert(entry.isActiveLesson, "7: Past active");
  assert(entry.stage === "LEARN", "7: LEARN");
  assert(!entry.hasLessonHistory, "7: no Past history");
  assert(
    entry.nextAction.href === getLessonPath("past-simple"),
    "7: Past lesson",
  );
}

export function verifyPastPreexistingProgressReused(): void {
  const events = [
    ...presentCompleteEvents(),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: 20,
    }),
  ];
  const entry = buildLessonEntry("past-simple", events);
  assert(entry.isActiveLesson, "8: Past active");
  assert(entry.hasLessonHistory, "8: stored progress");
  assert(entry.stage === "PLAY", "8: PLAY from Past Quiz");
  assert(
    entry.nextAction.href === getActivityPath("past-simple", "millionaire"),
    "8: Past Millionaire",
  );
}

export function verifyOutOfOrderPastDoesNotChangeActive(): void {
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
  const present = buildLessonEntry("present-simple", events);
  const past = buildLessonEntry("past-simple", events);
  assert(present.isActiveLesson, "9: Present still active");
  assert(
    present.nextAction.href === getActivityPath("present-simple", "quiz"),
    "9: Present Quiz",
  );
  assert(!past.isActiveLesson, "9: Past not active");
  assert(past.isLockedInCurriculum, "9: Past locked display");
  assert(past.hasLessonHistory, "9: Past history kept");
  assert(
    past.nextAction.href === getLessonPath("present-simple"),
    "9: return to Present",
  );
}

export function verifyCompletedLessonReplayAvailable(): void {
  const entry = buildLessonEntry("present-simple", presentCompleteEvents());
  assert(entry.isComplete, "10: complete");
  assert(entry.nextAction.href.length > 0, "10: CTA remains");
  assert(
    isKnownResumeHref(getActivityPath("present-simple", "quiz"), "present-simple"),
    "10: quiz route still valid",
  );
}

export function verifyFinalCurriculumCompleteSummary(): void {
  const events = [...presentCompleteEvents(), ...pastCompleteEvents()];
  const present = buildLessonEntry("present-simple", events);
  const past = buildLessonEntry("past-simple", events);
  assert(present.isComplete, "11: Present complete");
  assert(past.isComplete, "11: Past complete");
  assert(present.nextAction.actionType === "SUMMARY", "11: Present summary");
  assert(past.nextAction.actionType === "SUMMARY", "11: Past summary");
  assert(present.nextAction.href === getDashboardPath(), "11: dashboard");
  assert(past.nextAction.href === getDashboardPath(), "11: dashboard");
}

export function verifyUnknownLessonSafe(): void {
  const entry = buildLessonEntry("not-a-real-lesson", [
    makeEvent({
      activity: "quiz",
      lessonSlug: "not-a-real-lesson",
      scorePercentage: 100,
    }),
  ]);
  assert(!entry.isActiveLesson, "12: not active");
  assert(
    !entry.nextAction.href.includes("not-a-real-lesson"),
    "12: no fake route",
  );
  assert(
    entry.nextAction.href === getLessonPath("present-simple"),
    "12: fallback Present",
  );
}

export function verifyRouteHelpersReused(): void {
  const cases = [
    buildLessonEntry("present-simple", []),
    buildLessonEntry(
      "present-simple",
      [
        makeEvent({
          activity: "quiz",
          lessonSlug: "present-simple",
          scorePercentage: 90,
        }),
      ],
    ),
    buildLessonEntry("present-simple", presentCompleteEvents()),
    buildLessonEntry("past-simple", [
      ...presentCompleteEvents(),
      ...pastCompleteEvents(),
    ]),
  ];

  for (const entry of cases) {
    const slug =
      entry.nextAction.actionType === "SUMMARY"
        ? entry.lessonSlug
        : entry.nextAction.href.includes("past-simple")
          ? "past-simple"
          : "present-simple";
    assert(
      isKnownResumeHref(entry.nextAction.href, slug) ||
        entry.nextAction.href === getDashboardPath(),
      `13: known href ${entry.nextAction.href}`,
    );
  }
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
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 100,
      completedAt: 2,
    }),
  ];
  const present = buildLessonEntry("present-simple", events);
  assert(
    present.nextAction.href === getActivityPath("present-simple", "quiz"),
    "14: uses Present 50 not Past 100",
  );
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
  const first = buildLessonEntry("past-simple", presentThenPast);
  const second = buildLessonEntry("past-simple", pastThenPresent);
  assert(JSON.stringify(first) === JSON.stringify(second), "15: order independent");
}

export function verifyDeterministicOutput(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 75,
    }),
  ];
  const copy = events.map((event) => ({ ...event }));
  const first = buildLessonEntry("present-simple", events);
  const second = buildLessonEntry("present-simple", copy);
  assert(JSON.stringify(first) === JSON.stringify(second), "16: same input");
}

export function verifyInputsNotMutated(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ];
  const snapshot = JSON.stringify(events);
  Object.freeze(events);
  events.forEach((event) => Object.freeze(event));
  buildLessonEntry("present-simple", events);
  assert(JSON.stringify(events) === snapshot, "17: history not mutated");
}

export function verifyNoDirectStorageDependencies(): void {
  const source = readFileSync(
    resolve(process.cwd(), "lib/analytics/lessonEntry.ts"),
    "utf8",
  );
  assert(!source.includes("localStorage"), "18/19: no localStorage");
  assert(!source.includes("window."), "18: SSR-safe");
  assert(!source.includes("LearningHistoryRepository"), "20: no repository");
  assert(!source.includes("createLearningHistoryRepository"), "20: no factory");
}

export function runLessonEntryVerification(): void {
  verifyEmptyPresentActiveLearn();
  verifyEmptyPastDirectEntryWarning();
  verifyWeakPresentQuizPractice();
  verifyStrongPresentQuizPlay();
  verifyWeakPresentMillionaireReview();
  verifyPresentCompleteNextPast();
  verifyPastActiveLearnAfterPresentComplete();
  verifyPastPreexistingProgressReused();
  verifyOutOfOrderPastDoesNotChangeActive();
  verifyCompletedLessonReplayAvailable();
  verifyFinalCurriculumCompleteSummary();
  verifyUnknownLessonSafe();
  verifyRouteHelpersReused();
  verifyCrossLessonIsolation();
  verifyHistoryOrderIndependence();
  verifyDeterministicOutput();
  verifyInputsNotMutated();
  verifyNoDirectStorageDependencies();
}
