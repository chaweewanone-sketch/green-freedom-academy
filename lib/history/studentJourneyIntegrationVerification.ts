import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveActiveLesson } from "@/lib/analytics/activeLesson";
import { buildCurriculumProgress } from "@/lib/analytics/curriculumProgress";
import { buildLearningJourney } from "@/lib/analytics/journey";
import { buildLessonEntry } from "@/lib/analytics/lessonEntry";
import {
  JOURNEY_ACTION_LABELS,
  JOURNEY_PROGRESS,
  JOURNEY_THRESHOLDS,
  evaluateLessonJourney,
  isLessonComplete,
} from "@/lib/analytics/lessonProgress";
import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildStudentLearningHome } from "@/lib/analytics/studentHome";
import { buildLearningSummary, buildLearningSummaryForLesson } from "@/lib/analytics/summary";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import {
  MemoryLearningHistoryRepository,
  loadDashboardLearningState,
  recordActivityCompletion,
} from "@/lib/history";
import { runQuizDistributionVerification } from "@/lib/question-bank/quizDistributionVerification";
import type {
  AggregatableLearningEvent,
  CurriculumLessonStatus,
  LearningSummary,
} from "@/types/analytics";
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

function assessmentResult(
  overrides: Partial<AssessmentResult> & Pick<AssessmentResult, "activity">,
): AssessmentResult {
  return {
    sessionId: overrides.sessionId ?? "journey_session",
    activity: overrides.activity,
    score: overrides.score ?? 9,
    correct: overrides.correct ?? 9,
    incorrect: overrides.incorrect ?? 1,
    percentage: overrides.percentage ?? 90,
    completedAt: overrides.completedAt ?? 1_700_031_000_000,
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

type SurfaceSnapshot = {
  home: ReturnType<typeof buildStudentLearningHome>;
  presentEntry: ReturnType<typeof buildLessonEntry>;
  pastEntry: ReturnType<typeof buildLessonEntry>;
  curriculum: ReturnType<typeof buildCurriculumProgress>;
  journey: ReturnType<typeof buildLearningJourney>;
  recommendation: ReturnType<typeof buildLearningRecommendation>;
  resume: ReturnType<typeof buildResumeLearning>;
  active: ReturnType<typeof resolveActiveLesson>;
  summary: LearningSummary;
};

function snapshotSurfaces(events: AggregatableLearningEvent[]): SurfaceSnapshot {
  const summary = buildLearningSummary(events);
  return {
    home: buildStudentLearningHome(summary, events),
    presentEntry: buildLessonEntry("present-simple", events),
    pastEntry: buildLessonEntry("past-simple", events),
    curriculum: buildCurriculumProgress(events),
    journey: buildLearningJourney(summary, events),
    recommendation: buildLearningRecommendation(summary, events),
    resume: buildResumeLearning(summary, events),
    active: resolveActiveLesson(events),
    summary,
  };
}

/**
 * Home, Lesson Entry, Curriculum, Dashboard engines, and Recommendation
 * must agree on which lesson is active/complete. Labels may differ;
 * contradictory lesson targets must not.
 */
function assertCrossSurfaceConsistency(
  events: AggregatableLearningEvent[],
  message: string,
): SurfaceSnapshot {
  const surfaces = snapshotSurfaces(events);
  const {
    home,
    presentEntry,
    pastEntry,
    curriculum,
    journey,
    recommendation,
    resume,
    active,
  } = surfaces;

  const presentRow = curriculum.lessons.find(
    (lesson) => lesson.lessonSlug === "present-simple",
  );
  const pastRow = curriculum.lessons.find(
    (lesson) => lesson.lessonSlug === "past-simple",
  );

  if (!presentRow || !pastRow) {
    throw new Error(`${message}: Present and Past curriculum rows`);
  }

  if (active.isCurriculumComplete) {
    assert(home.activeLesson === null, `${message}: home has no fake next lesson`);
    assert(curriculum.isCurriculumComplete, `${message}: curriculum complete`);
    assert(curriculum.activeLessonSlug === undefined, `${message}: no active slug`);
    assert(presentRow.status === "COMPLETE", `${message}: Present COMPLETE`);
    assert(pastRow.status === "COMPLETE", `${message}: Past COMPLETE`);
    assert(presentEntry.isComplete, `${message}: Present entry complete`);
    assert(pastEntry.isComplete, `${message}: Past entry complete`);
    assert(!presentEntry.isActiveLesson, `${message}: Present not active`);
    assert(!pastEntry.isActiveLesson, `${message}: Past not active`);
    assert(resume.action.actionType === "SUMMARY", `${message}: resume SUMMARY`);
    assert(resume.action.href === getDashboardPath(), `${message}: resume dashboard`);
    assert(
      recommendation.href === getDashboardPath(),
      `${message}: recommendation dashboard`,
    );
    return surfaces;
  }

  assert(
    home.activeLesson?.lessonSlug === active.lessonSlug,
    `${message}: home active matches resolver`,
  );
  assert(
    curriculum.activeLessonSlug === active.lessonSlug,
    `${message}: curriculum active matches resolver`,
  );
  assert(
    journey.lessonSlug === active.lessonSlug,
    `${message}: journey active matches resolver`,
  );
  assert(
    recommendation.lessonSlug === active.lessonSlug,
    `${message}: recommendation active matches resolver`,
  );
  assert(
    resume.action.lessonSlug === active.lessonSlug,
    `${message}: resume active matches resolver`,
  );
  assert(
    home.resumeLearning.action.href === resume.action.href,
    `${message}: home resume href`,
  );
  assert(
    home.resumeLearning.action.lessonSlug === resume.action.lessonSlug,
    `${message}: home resume lesson`,
  );

  assert(
    presentEntry.isActiveLesson === (presentRow.status === "ACTIVE"),
    `${message}: Present entry vs curriculum ACTIVE`,
  );
  assert(
    presentEntry.isComplete === (presentRow.status === "COMPLETE"),
    `${message}: Present entry vs curriculum COMPLETE`,
  );
  assert(
    pastEntry.isActiveLesson === (pastRow.status === "ACTIVE"),
    `${message}: Past entry vs curriculum ACTIVE`,
  );
  assert(
    pastEntry.isComplete === (pastRow.status === "COMPLETE"),
    `${message}: Past entry vs curriculum COMPLETE`,
  );
  assert(
    presentEntry.activeLessonSlug === active.lessonSlug,
    `${message}: Present entry reports same active lesson`,
  );
  assert(
    pastEntry.activeLessonSlug === active.lessonSlug,
    `${message}: Past entry reports same active lesson`,
  );

  const activeRow = curriculum.lessons.find(
    (lesson) => lesson.lessonSlug === active.lessonSlug,
  );
  assert(activeRow?.status === "ACTIVE", `${message}: active row is ACTIVE`);

  if (presentRow.status === "COMPLETE") {
    assert(
      isLessonComplete(events, "present-simple"),
      `${message}: Present COMPLETE uses shared evaluator`,
    );
  }

  if (pastRow.status === "COMPLETE") {
    assert(
      isLessonComplete(events, "past-simple"),
      `${message}: Past COMPLETE uses shared evaluator`,
    );
  }

  return surfaces;
}

export function verifyBrandNewStudent(): void {
  const events: AggregatableLearningEvent[] = [];
  const surfaces = assertCrossSurfaceConsistency(events, "A");

  assert(surfaces.active.lessonSlug === "present-simple", "A: Present active");
  assert(!surfaces.active.isCurriculumComplete, "A: curriculum not complete");
  assert(surfaces.presentEntry.stage === "LEARN", "A: entry LEARN");
  assert(surfaces.journey.stage === "LEARN", "A: journey LEARN");
  assert(
    surfaces.presentEntry.nextAction.label === JOURNEY_ACTION_LABELS.learn,
    "A: เริ่มเรียน",
  );
  assert(
    surfaces.home.resumeLearning.action.href === getLessonPath("present-simple"),
    "A: next action Present lesson",
  );
  assert(surfaces.summary.totalActivities === 0, "A: no fake activities");
  assert(surfaces.home.latestActivity === undefined, "A: no fake latest");
  assert(surfaces.curriculum.completedLessons === 0, "A: 0 complete");
  assert(surfaces.presentEntry.progressPercent === JOURNEY_PROGRESS.learn, "A: learn %");
  assert(surfaces.pastEntry.progressPercent === 0, "A: Past no fake %");
  assert(surfaces.pastEntry.noticeKind === "out-of-order", "A: Past out-of-order");
}

export function verifyLearnCompletedDoesNotInventProgress(): void {
  // Visiting Learn without recording still creates no event. Persisted Learn
  // completion is Sprint 32 (`recordLearnCompletion`). Flash-only history
  // still uses existing FALLBACK_LEARN policy.
  const events: AggregatableLearningEvent[] = [];
  const before = JSON.stringify(events);
  const surfaces = assertCrossSurfaceConsistency(events, "B");

  assert(surfaces.active.lessonSlug === "present-simple", "B: Present still active");
  assert(surfaces.presentEntry.stage === "LEARN", "B: still LEARN");
  assert(
    surfaces.journey.nextAction.href === getLessonPath("present-simple"),
    "B: next action stays on Present lesson",
  );
  assert(JSON.stringify(events) === before, "B: history unchanged");
  assert(surfaces.summary.totalActivities === 0, "B: no invented Learn event");

  const fallbackLearn = [
    makeEvent({
      activity: "flash-cards",
      lessonSlug: "present-simple",
      flashEasy: 4,
      flashMedium: 0,
      flashHard: 0,
    }),
  ];
  const fallbackSurfaces = assertCrossSurfaceConsistency(fallbackLearn, "B.fallback");
  const lessonSummary = buildLearningSummaryForLesson(
    fallbackLearn,
    "present-simple",
  );
  const path = evaluateLessonJourney(lessonSummary, "present-simple");
  assert(path.stage === "LEARN", "B: flash-only stays LEARN under existing policy");
  assert(path.reasonCode === "FALLBACK_LEARN", "B: FALLBACK_LEARN");
  assert(
    fallbackSurfaces.active.lessonSlug === "present-simple",
    "B: Present remains active",
  );
  assert(fallbackLearn.length === 1, "B: flash history preserved");
}

export function verifyQuizCompletedOnce(): void {
  const repository = new MemoryLearningHistoryRepository();
  const result = assessmentResult({
    sessionId: "present_quiz_1",
    activity: "quiz",
    percentage: 90,
    completedAt: 1_700_031_100_000,
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

  const loaded = loadDashboardLearningState(repository);
  assert(loaded.events.length === 1, "C: stored once");
  assert(loaded.summary.quizAttempts === 1, "C: analytics one quiz");
  assert(loaded.summary.averageQuizScore === 90, "C: score 90");
  assert(loaded.summary.latestActivity === "quiz", "C: latest quiz");
  assert(loaded.summary.latestLesson === "present-simple", "C: Present latest");

  const surfaces = assertCrossSurfaceConsistency(loaded.events, "C");
  assert(surfaces.active.lessonSlug === "present-simple", "C: Present still active");
  assert(surfaces.journey.stage === "PLAY", "C: strong quiz → PLAY");
  assert(
    surfaces.home.resumeLearning.action.href ===
      getActivityPath("present-simple", "millionaire"),
    "C: next Millionaire",
  );
  assert(
    surfaces.home.resumeLearning.action.label ===
      JOURNEY_ACTION_LABELS.playMillionaire,
    "C: Resume เล่น Millionaire",
  );
  assert(surfaces.presentEntry.noticeKind === "active", "C: Present entry active");
  assert(!surfaces.presentEntry.isComplete, "C: quiz alone is not lesson complete");
}

export function verifyMillionaireCompleted(): void {
  const repository = new MemoryLearningHistoryRepository();
  recordActivityCompletion({
    result: assessmentResult({
      sessionId: "present_quiz_1",
      activity: "quiz",
      percentage: 90,
      completedAt: 1_700_031_100_000,
    }),
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: assessmentResult({
      sessionId: "present_millionaire_1",
      activity: "millionaire",
      percentage: 80,
      completedAt: 1_700_031_200_000,
    }),
    lessonSlug: "present-simple",
    repository,
  });

  const loaded = loadDashboardLearningState(repository);
  assert(loaded.events.length === 2, "D: quiz + millionaire");
  assert(loaded.summary.millionaireAttempts === 1, "D: one millionaire");
  assert(loaded.summary.averageMillionaireScore === 80, "D: score unchanged");

  const surfaces = assertCrossSurfaceConsistency(loaded.events, "D");
  assert(surfaces.active.lessonSlug === "present-simple", "D: Present still active");
  assert(
    loaded.summary.averageMillionaireScore < JOURNEY_THRESHOLDS.millionaireStrong,
    "D: below complete threshold",
  );
  assert(surfaces.journey.stage === "PLAY", "D: developing millionaire stays PLAY");
  assert(
    surfaces.home.resumeLearning.action.href ===
      getActivityPath("present-simple", "millionaire"),
    "D: retry Millionaire",
  );
  assert(!isLessonComplete(loaded.events, "present-simple"), "D: not complete yet");
}

export function verifyLessonCompletionAdvancesCurriculum(): void {
  const repository = new MemoryLearningHistoryRepository();
  recordActivityCompletion({
    result: assessmentResult({
      sessionId: "min_millionaire",
      activity: "millionaire",
      percentage: JOURNEY_THRESHOLDS.millionaireStrong,
      completedAt: 1_700_031_300_000,
    }),
    lessonSlug: "present-simple",
    repository,
  });

  const minimum = loadDashboardLearningState(repository);
  assert(
    isLessonComplete(minimum.events, "present-simple"),
    "E: existing policy completes on strong Millionaire",
  );

  const typical = presentCompleteEvents();
  const surfaces = assertCrossSurfaceConsistency(typical, "E");

  assert(surfaces.presentEntry.isComplete, "E: Present complete");
  assert(!surfaces.presentEntry.isActiveLesson, "E: Present no longer active");
  assert(surfaces.pastEntry.isActiveLesson, "E: Past active");
  assert(surfaces.pastEntry.stage === "LEARN", "E: Past LEARN");
  assert(surfaces.home.activeLesson?.lessonSlug === "past-simple", "E: home Past");
  assert(surfaces.curriculum.completedLessons === 1, "E: one lesson complete");
  assert(
    surfaces.presentEntry.nextAction.href === getDashboardPath(),
    "E: Present entry completion CTA",
  );
  assert(
    surfaces.home.resumeLearning.action.href === getDashboardPath(),
    "E: home resume dashboard",
  );
  assert(
    surfaces.presentEntry.noticeKind === "complete",
    "E: Present remains reviewable as complete",
  );
}

export function verifyReturningStudent(): void {
  const events = [
    ...presentCompleteEvents(1),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: 20,
    }),
  ];
  const surfaces = assertCrossSurfaceConsistency(events, "F");

  assert(surfaces.home.activeLesson?.lessonSlug === "past-simple", "F: home Past");
  assert(surfaces.pastEntry.isActiveLesson, "F: Past entry active");
  assert(surfaces.pastEntry.hasLessonHistory, "F: Past has own progress");
  assert(surfaces.pastEntry.stage === "PLAY", "F: Past Quiz → PLAY");
  assert(
    surfaces.pastEntry.nextAction.href ===
      getActivityPath("past-simple", "millionaire"),
    "F: Past Millionaire",
  );
  assert(surfaces.presentEntry.isComplete, "F: Present still complete");
  assert(surfaces.summary.totalActivities === 3, "F: dashboard history has both lessons");
  assert(surfaces.curriculum.lessons[0]?.lessonSlug === "present-simple", "F: order Present");
  assert(surfaces.curriculum.lessons[1]?.lessonSlug === "past-simple", "F: order Past");

  const presentOnly = buildLearningSummaryForLesson(events, "present-simple");
  const pastOnly = buildLearningSummaryForLesson(events, "past-simple");
  assert(presentOnly.quizAttempts === 1, "F: Present quiz stays on Present");
  assert(presentOnly.millionaireAttempts === 1, "F: Present millionaire stays");
  assert(pastOnly.quizAttempts === 1, "F: Past quiz isolated");
  assert(pastOnly.millionaireAttempts === 0, "F: Past has no millionaire leak");
}

export function verifyOutOfOrderAccessUnchanged(): void {
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
  const surfaces = assertCrossSurfaceConsistency(events, "G");

  assert(surfaces.active.lessonSlug === "present-simple", "G: active Present");
  assert(!isLessonComplete(events, "present-simple"), "G: Present not complete");
  assert(surfaces.curriculum.completedLessons === 0, "G: no fake Past advancement");
  assert(surfaces.pastEntry.isLockedInCurriculum, "G: Past locked display");
  assert(surfaces.pastEntry.noticeKind === "out-of-order", "G: warning");
  assert(
    surfaces.pastEntry.nextAction.href === getLessonPath("present-simple"),
    "G: CTA returns to active lesson",
  );
  assert(surfaces.pastEntry.hasLessonHistory, "G: stored Past progress kept");
  assert(
    surfaces.home.resumeLearning.action.href ===
      getActivityPath("present-simple", "quiz"),
    "G: home still Present Quiz",
  );
}

export function verifyReloadHydration(): void {
  const repository = new MemoryLearningHistoryRepository();
  const quiz = assessmentResult({
    sessionId: "hydrate_quiz",
    activity: "quiz",
    percentage: 88,
    completedAt: 1_700_031_400_000,
  });

  recordActivityCompletion({
    result: quiz,
    lessonSlug: "present-simple",
    repository,
  });

  const first = loadDashboardLearningState(repository);
  const second = loadDashboardLearningState(repository);
  assert(first.events.length === 1, "H: first load one event");
  assert(second.events.length === 1, "H: reload still one");
  assert(JSON.stringify(first) === JSON.stringify(second), "H: deterministic load");

  const firstSurfaces = snapshotSurfaces(first.events);
  const secondSurfaces = snapshotSurfaces(second.events);
  assert(
    JSON.stringify(firstSurfaces.home) === JSON.stringify(secondSurfaces.home),
    "H: home deterministic",
  );
  assert(
    JSON.stringify(firstSurfaces.presentEntry) ===
      JSON.stringify(secondSurfaces.presentEntry),
    "H: lesson entry deterministic",
  );
  assert(
    JSON.stringify(firstSurfaces.curriculum) ===
      JSON.stringify(secondSurfaces.curriculum),
    "H: curriculum deterministic",
  );

  recordActivityCompletion({
    result: quiz,
    lessonSlug: "present-simple",
    repository,
  });
  assert(repository.getAll().length === 1, "H: hydration/resave does not duplicate");
}

export function verifyHistoryIntegrity(): void {
  const repository = new MemoryLearningHistoryRepository();
  const quiz = assessmentResult({
    sessionId: "integrity_quiz",
    activity: "quiz",
    percentage: 70,
    completedAt: 10,
  });

  recordActivityCompletion({
    result: quiz,
    lessonSlug: "present-simple",
    repository,
  });
  const snapshot = JSON.stringify(repository.getAll());

  const loaded = loadDashboardLearningState(repository);
  snapshotSurfaces(loaded.events);
  buildLearningSummary(loaded.events);
  buildLearningSummary(loaded.events);

  assert(JSON.stringify(repository.getAll()) === snapshot, "integrity: reads do not mutate");
  assert(repository.getByLesson("past-simple").length === 0, "integrity: no lesson leak");
  assert(repository.getByLesson("present-simple").length === 1, "integrity: Present isolated");
  assert(repository.getByActivity("millionaire").length === 0, "integrity: activity isolated");

  recordActivityCompletion({
    result: assessmentResult({
      sessionId: "integrity_quiz",
      activity: "quiz",
      percentage: 70,
      completedAt: 11,
    }),
    lessonSlug: "present-simple",
    repository,
  });
  assert(repository.getAll().length === 2, "integrity: retry with new completedAt");

  const ordered = repository.getLatest();
  assert(ordered[0]?.completedAt === 11, "integrity: latest first");
  assert(ordered[1]?.completedAt === 10, "integrity: earlier second");
}

export function verifyRenderingAndNavigationDoNotCreateEvents(): void {
  const repository = new MemoryLearningHistoryRepository();
  loadDashboardLearningState(repository);
  snapshotSurfaces([]);
  buildStudentLearningHome(emptySummary(), []);
  buildLessonEntry("present-simple", []);
  buildLessonEntry("past-simple", []);
  assert(repository.getAll().length === 0, "nav: empty load creates nothing");
}

export function verifyAnalyticsEnginesStayStorageFree(): void {
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
    assert(!source.includes("localStorage"), `storage: ${file} no localStorage`);
    assert(
      !source.includes("LearningHistoryRepository"),
      `storage: ${file} no repository`,
    );
  }
}

export function verifyUiBoundariesDoNotPersistOnRender(): void {
  const files: Record<string, string> = {
    companion: "components/classroom-companion/ClassroomCompanion.tsx",
    home: "components/student/StudentLearningHomeView.tsx",
    entry: "components/classroom-companion/LessonEntryView.tsx",
    dashboard: "components/dashboard/DashboardHistoryView.tsx",
  };

  const companion = readFileSync(resolve(process.cwd(), files.companion), "utf8");
  assert(
    !companion.includes("localStorage"),
    "ui: companion does not touch localStorage",
  );
  assert(
    !companion.includes("recordActivityCompletion"),
    "ui: companion does not use activity recorder",
  );
  assert(
    companion.includes("recordLearnCompletion"),
    "ui: companion records Learn through history helper",
  );

  for (const [label, relative] of Object.entries(files)) {
    if (label === "companion") {
      continue;
    }
    const source = readFileSync(resolve(process.cwd(), relative), "utf8");
    assert(
      source.includes("loadDashboardLearningState"),
      `ui: ${label} reads history after mount`,
    );
    assert(
      !source.includes("recordActivityCompletion"),
      `ui: ${label} does not record on render`,
    );
  }
}

export function verifyQuizDistributionRegression(): void {
  runQuizDistributionVerification();
}

export function verifyCurriculumStatusLabelsStayDistinct(): void {
  const complete = presentCompleteEvents();
  const empty = snapshotSurfaces([]);
  const done = snapshotSurfaces(complete);

  const statuses = (snapshot: SurfaceSnapshot): CurriculumLessonStatus[] =>
    snapshot.curriculum.lessons.map((lesson) => lesson.status);

  assert(
    JSON.stringify(statuses(empty)) === JSON.stringify(["ACTIVE", "LOCKED"]),
    "status: empty Present ACTIVE Past LOCKED",
  );
  assert(
    JSON.stringify(statuses(done)) === JSON.stringify(["COMPLETE", "ACTIVE"]),
    "status: complete Present COMPLETE Past ACTIVE",
  );
}

export function runStudentJourneyIntegrationVerification(): void {
  verifyBrandNewStudent();
  verifyLearnCompletedDoesNotInventProgress();
  verifyQuizCompletedOnce();
  verifyMillionaireCompleted();
  verifyLessonCompletionAdvancesCurriculum();
  verifyReturningStudent();
  verifyOutOfOrderAccessUnchanged();
  verifyReloadHydration();
  verifyHistoryIntegrity();
  verifyRenderingAndNavigationDoNotCreateEvents();
  verifyAnalyticsEnginesStayStorageFree();
  verifyUiBoundariesDoNotPersistOnRender();
  verifyCurriculumStatusLabelsStayDistinct();
  verifyQuizDistributionRegression();
}
