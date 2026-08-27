import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveActiveLesson } from "@/lib/analytics/activeLesson";
import { buildCurriculumProgress } from "@/lib/analytics/curriculumProgress";
import { buildLearningJourney } from "@/lib/analytics/journey";
import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildStudentLearningHome } from "@/lib/analytics/studentHome";
import { buildLearningSummary } from "@/lib/analytics/summary";
import { getActivityPath, getDashboardPath, getLessonPath, getStudentPath } from "@/lib/routes";
import { hasLesson } from "@/lib/lessons";
import {
  MemoryLearningHistoryRepository,
  loadDashboardLearningState,
  recordActivityCompletion,
} from "@/lib/history";
import type { AggregatableLearningEvent, LearningSummary } from "@/types/analytics";
import type { AssessmentResult } from "@/types/assessment-result";

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

function quizResult(
  overrides: Partial<AssessmentResult> = {},
): AssessmentResult {
  return {
    sessionId: "integration_quiz_1",
    activity: "quiz",
    score: 5,
    correct: 5,
    incorrect: 5,
    percentage: 50,
    completedAt: 1_700_029_000_000,
    ...overrides,
  };
}

function assertActiveLessonAligned(
  events: AggregatableLearningEvent[],
  message: string,
): void {
  const summary = emptySummary();
  const active = resolveActiveLesson(events);
  const journey = buildLearningJourney(summary, events);
  const recommendation = buildLearningRecommendation(summary, events);
  const resume = buildResumeLearning(summary, events);

  if (active.isCurriculumComplete) {
    assert(resume.action.actionType === "SUMMARY", `${message}: resume SUMMARY`);
    assert(resume.action.href === getDashboardPath(), `${message}: resume dashboard`);
    assert(
      recommendation.href === getDashboardPath(),
      `${message}: recommendation dashboard`,
    );
    return;
  }

  assert(journey.lessonSlug === active.lessonSlug, `${message}: journey lesson`);
  assert(
    recommendation.lessonSlug === active.lessonSlug,
    `${message}: recommendation lesson`,
  );
  assert(resume.action.lessonSlug === active.lessonSlug, `${message}: resume lesson`);
  assert(resume.action.href === recommendation.href, `${message}: resume href`);
}

export function verifyEmptyStudentHome(): void {
  const model = buildStudentLearningHome(emptySummary(), []);
  assert(model.resumeLearning.title === "เริ่มการเรียนรู้", "1: start heading");
  assert(model.resumeLearning.action.label === "เริ่มเรียน", "1: start CTA");
  assert(
    model.resumeLearning.action.href === getLessonPath("present-simple"),
    "1: Present lesson",
  );
  assert(model.latestActivity === undefined, "1: no fake latest");
  assert(!model.hasHistory, "1: empty");
}

export function verifyEmptyDashboardSummary(): void {
  const summary = buildLearningSummary([]);
  const progress = buildCurriculumProgress([]);
  assert(summary.totalActivities === 0, "2: no activities");
  assert(summary.latestActivity === undefined, "2: no latest activity");
  assert(progress.completedLessons === 0, "2: 0 complete");
  assert(progress.totalLessons === 2, "2: 2 lessons");
}

export function verifyQuizCompletionCreatesOneEvent(): void {
  const repository = new MemoryLearningHistoryRepository();
  recordActivityCompletion({
    result: quizResult(),
    lessonSlug: "present-simple",
    repository,
  });
  assert(repository.getAll().length === 1, "3: one event");
}

export function verifyRerenderDoesNotDuplicate(): void {
  const repository = new MemoryLearningHistoryRepository();
  const result = quizResult();
  recordActivityCompletion({
    result,
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result,
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result,
    lessonSlug: "present-simple",
    repository,
  });
  assert(repository.getAll().length === 1, "4: rerender same result");
}

export function verifyRefreshDoesNotDuplicate(): void {
  const repository = new MemoryLearningHistoryRepository();
  const result = quizResult();
  recordActivityCompletion({
    result,
    lessonSlug: "present-simple",
    repository,
  });
  const afterFirst = loadDashboardLearningState(repository);
  recordActivityCompletion({
    result,
    lessonSlug: "present-simple",
    repository,
  });
  const afterReload = loadDashboardLearningState(repository);
  assert(afterFirst.events.length === 1, "5: persisted one");
  assert(afterReload.events.length === 1, "5: reload still one");
}

export function verifySecondAttemptCreatesNewEvent(): void {
  const repository = new MemoryLearningHistoryRepository();
  recordActivityCompletion({
    result: quizResult({ completedAt: 1_700_029_000_000 }),
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: quizResult({ completedAt: 1_700_029_000_500 }),
    lessonSlug: "present-simple",
    repository,
  });
  assert(repository.getAll().length === 2, "6: second genuine attempt");
}

export function verifyOutOfOrderPastDoesNotAdvanceActiveLesson(): void {
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
  const active = resolveActiveLesson(events);
  const home = buildStudentLearningHome(emptySummary(), events);
  assert(active.lessonSlug === "present-simple", "7: active Present");
  assert(home.resumeLearning.action.lessonSlug === "present-simple", "7: resume Present");
  assert(
    home.resumeLearning.action.href === getActivityPath("present-simple", "quiz"),
    "7: not hijacked by Past",
  );
}

export function verifyPresentCompletionAdvancesToPast(): void {
  const events = presentCompleteEvents();
  const home = buildStudentLearningHome(emptySummary(), events);
  assert(home.resumeLearning.action.lessonSlug === "past-simple", "8: Past");
  assert(home.activeLesson?.lessonSlug === "past-simple", "8: active Past");
  assert(
    home.resumeLearning.action.href === getLessonPath("past-simple"),
    "8: Past lesson",
  );
}

export function verifyPreexistingPastProgressReused(): void {
  const events = [
    ...presentCompleteEvents(),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: 20,
    }),
  ];
  const home = buildStudentLearningHome(emptySummary(), events);
  assert(home.resumeLearning.action.lessonSlug === "past-simple", "9: Past");
  assert(
    home.resumeLearning.action.href ===
      getActivityPath("past-simple", "millionaire"),
    "9: reuses Past Quiz",
  );
}

export function verifyCurriculumCompleteSummaryAction(): void {
  const events = [...presentCompleteEvents(), ...pastCompleteEvents()];
  const home = buildStudentLearningHome(emptySummary(), events);
  assert(home.resumeLearning.action.actionType === "SUMMARY", "10: SUMMARY");
  assert(home.resumeLearning.action.href === getDashboardPath(), "10: dashboard");
  assert(home.activeLesson === null, "10: no fake next");
}

export function verifyJourneyRecommendationResumeAlignment(): void {
  const cases: AggregatableLearningEvent[][] = [
    [],
    [
      makeEvent({
        activity: "quiz",
        lessonSlug: "present-simple",
        scorePercentage: 50,
      }),
    ],
    [
      makeEvent({
        activity: "quiz",
        lessonSlug: "present-simple",
        scorePercentage: 90,
      }),
    ],
    [
      makeEvent({
        activity: "millionaire",
        lessonSlug: "present-simple",
        scorePercentage: 60,
      }),
    ],
    [
      makeEvent({
        activity: "millionaire",
        lessonSlug: "present-simple",
        scorePercentage: 75,
      }),
    ],
    [
      ...presentCompleteEvents(),
      makeEvent({
        activity: "flash-cards",
        lessonSlug: "present-simple",
        completedAt: 3,
        flashEasy: 1,
        flashMedium: 2,
        flashHard: 3,
      }),
    ],
    presentCompleteEvents(),
    [
      ...presentCompleteEvents(),
      makeEvent({
        activity: "quiz",
        lessonSlug: "past-simple",
        scorePercentage: 90,
        completedAt: 20,
      }),
    ],
    [...presentCompleteEvents(), ...pastCompleteEvents()],
  ];

  cases.forEach((events, index) => {
    assertActiveLessonAligned(events, `11.${index + 1}`);
  });
}

export function verifyRouteHelpersProduceExistingRoutes(): void {
  assert(getStudentPath() === "/student", "12: /student");
  assert(getDashboardPath() === "/dashboard", "12: /dashboard");
  assert(hasLesson("present-simple"), "12: Present exists");
  assert(hasLesson("past-simple"), "12: Past exists");
  assert(
    getLessonPath("present-simple") === "/lesson/present-simple",
    "12: Present lesson path",
  );
  assert(getLessonPath("past-simple") === "/lesson/past-simple", "12: Past lesson path");

  const activities = ["quiz", "millionaire", "flash-cards"] as const;
  for (const slug of ["present-simple", "past-simple"] as const) {
    for (const activity of activities) {
      assert(
        getActivityPath(slug, activity) ===
          `/lesson/${slug}/activity/${activity}`,
        `12: ${slug} ${activity}`,
      );
    }
  }
}

export function verifyUnknownLessonSafe(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "not-a-real-lesson",
      scorePercentage: 100,
    }),
  ];
  const home = buildStudentLearningHome(emptySummary(), events);
  assert(home.resumeLearning.action.lessonSlug === "present-simple", "13: Present");
  assert(
    !home.resumeLearning.action.href.includes("not-a-real-lesson"),
    "13: no fake route",
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
  const first = buildStudentLearningHome(emptySummary(), presentThenPast);
  const second = buildStudentLearningHome(emptySummary(), pastThenPresent);
  assert(
    JSON.stringify(first.resumeLearning) === JSON.stringify(second.resumeLearning),
    "14: order independent resume",
  );
}

export function verifyHistoryNotMutated(): void {
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
  buildStudentLearningHome(emptySummary(), events);
  buildLearningJourney(emptySummary(), events);
  buildLearningRecommendation(emptySummary(), events);
  buildResumeLearning(emptySummary(), events);
  buildCurriculumProgress(events);
  assert(JSON.stringify(events) === snapshot, "15: history not mutated");
}

export function verifyNoSampleReseedingOnLoad(): void {
  const repository = new MemoryLearningHistoryRepository();
  const loaded = loadDashboardLearningState(repository);
  assert(loaded.events.length === 0, "16: empty load");
  assert(loaded.summary.totalActivities === 0, "16: empty summary");
}

export function verifyAnalyticsEnginesHaveNoStorage(): void {
  const analyticsDir = resolve(process.cwd(), "lib/analytics");
  const files = readdirSync(analyticsDir).filter(
    (name) => name.endsWith(".ts") && !name.endsWith("Verification.ts"),
  );
  const policyFiles = files.filter(
    (name) =>
      name !== "sample-data.ts" &&
      name !== "index.ts" &&
      name !== "summary.ts",
  );

  for (const file of policyFiles) {
    const source = readFileSync(resolve(analyticsDir, file), "utf8");
    assert(!source.includes("localStorage"), `17/18: ${file} no localStorage`);
    assert(
      !source.includes("LearningHistoryRepository"),
      `19: ${file} no repository`,
    );
    assert(!source.includes("window."), `17: ${file} SSR-safe`);
  }
}

export function verifyDeterministicOutputs(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 75,
    }),
  ];
  const copy = events.map((event) => ({ ...event }));
  const firstHome = buildStudentLearningHome(emptySummary(), events);
  const secondHome = buildStudentLearningHome(emptySummary(), copy);
  const firstResume = buildResumeLearning(emptySummary(), events);
  const secondResume = buildResumeLearning(emptySummary(), copy);
  assert(
    JSON.stringify(firstHome) === JSON.stringify(secondHome),
    "20: home deterministic",
  );
  assert(
    JSON.stringify(firstResume) === JSON.stringify(secondResume),
    "20: resume deterministic",
  );
}

export function runFlowIntegrationVerification(): void {
  verifyEmptyStudentHome();
  verifyEmptyDashboardSummary();
  verifyQuizCompletionCreatesOneEvent();
  verifyRerenderDoesNotDuplicate();
  verifyRefreshDoesNotDuplicate();
  verifySecondAttemptCreatesNewEvent();
  verifyOutOfOrderPastDoesNotAdvanceActiveLesson();
  verifyPresentCompletionAdvancesToPast();
  verifyPreexistingPastProgressReused();
  verifyCurriculumCompleteSummaryAction();
  verifyJourneyRecommendationResumeAlignment();
  verifyRouteHelpersProduceExistingRoutes();
  verifyUnknownLessonSafe();
  verifyHistoryOrderIndependence();
  verifyHistoryNotMutated();
  verifyNoSampleReseedingOnLoad();
  verifyAnalyticsEnginesHaveNoStorage();
  verifyDeterministicOutputs();
}
