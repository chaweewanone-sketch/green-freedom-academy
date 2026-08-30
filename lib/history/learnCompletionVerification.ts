import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveActiveLesson } from "@/lib/analytics/activeLesson";
import { buildCurriculumProgress } from "@/lib/analytics/curriculumProgress";
import { buildLearningJourney } from "@/lib/analytics/journey";
import { buildLessonEntry } from "@/lib/analytics/lessonEntry";
import {
  JOURNEY_ACTION_LABELS,
  evaluateLessonJourney,
  isLessonComplete,
} from "@/lib/analytics/lessonProgress";
import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildStudentLearningHome } from "@/lib/analytics/studentHome";
import {
  buildLearningSummary,
  buildLearningSummaryForLesson,
} from "@/lib/analytics/summary";
import { getActivityPath, getLessonPath } from "@/lib/routes";
import {
  LEARN_ACTIVITY,
  MemoryLearningHistoryRepository,
  hasLearnCompletion,
  loadDashboardLearningState,
  recordActivityCompletion,
  recordLearnCompletion,
} from "@/lib/history";
import { runQuizDistributionVerification } from "@/lib/question-bank/quizDistributionVerification";
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

function assessmentResult(
  overrides: Partial<AssessmentResult> & Pick<AssessmentResult, "activity">,
): AssessmentResult {
  return {
    sessionId: overrides.sessionId ?? "learn_flow_session",
    activity: overrides.activity,
    score: overrides.score ?? 9,
    correct: overrides.correct ?? 9,
    incorrect: overrides.incorrect ?? 1,
    percentage: overrides.percentage ?? 90,
    completedAt: overrides.completedAt ?? 1_700_032_000_000,
  };
}

function presentCompleteEvents(
  startAt: number = 10,
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

function assertHomeAndEntryAgree(
  events: AggregatableLearningEvent[],
  message: string,
): void {
  const summary = buildLearningSummary(events);
  const home = buildStudentLearningHome(summary, events);
  const presentEntry = buildLessonEntry("present-simple", events);
  const curriculum = buildCurriculumProgress(events);
  const journey = buildLearningJourney(summary, events);
  const recommendation = buildLearningRecommendation(summary, events);
  const resume = buildResumeLearning(summary, events);
  const active = resolveActiveLesson(events);

  assert(
    home.activeLesson?.lessonSlug === active.lessonSlug,
    `${message}: home active`,
  );
  assert(
    presentEntry.activeLessonSlug === active.lessonSlug,
    `${message}: entry active`,
  );
  assert(
    curriculum.activeLessonSlug === active.lessonSlug,
    `${message}: curriculum active`,
  );
  assert(journey.lessonSlug === active.lessonSlug, `${message}: journey active`);
  assert(
    recommendation.lessonSlug === active.lessonSlug,
    `${message}: recommendation active`,
  );
  assert(
    resume.action.lessonSlug === active.lessonSlug,
    `${message}: resume active`,
  );
  assert(
    home.resumeLearning.action.href === presentEntry.nextAction.href,
    `${message}: home and Present entry next href`,
  );
}

export function verifyEmptyHistoryStartsAtLearn(): void {
  const events: AggregatableLearningEvent[] = [];
  const summary = buildLearningSummary(events);
  const journey = evaluateLessonJourney(summary, "present-simple");
  const home = buildStudentLearningHome(summary, events);
  const entry = buildLessonEntry("present-simple", events);

  assert(journey.stage === "LEARN", "A: LEARN");
  assert(journey.reasonCode === "EMPTY_HISTORY", "A: EMPTY_HISTORY");
  assert(entry.stage === "LEARN", "A: entry LEARN");
  assert(
    home.resumeLearning.action.href === getLessonPath("present-simple"),
    "A: start Present",
  );
  assert(summary.totalActivities === 0, "A: empty");
  assert(!hasLearnCompletion(events, "present-simple"), "A: no learn event");
}

export function verifyLearnCompletionWritesHistory(): void {
  const repository = new MemoryLearningHistoryRepository();
  const saved = recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 1_700_032_100_000,
  });

  assert(saved !== null, "B: saved");
  assert(saved?.activity === LEARN_ACTIVITY, "B: activity learn");
  assert(saved?.lessonSlug === "present-simple", "B: Present");
  assert(saved?.completedAt === 1_700_032_100_000, "B: timestamp");
  assert(
    !("scorePercentage" in (saved as AggregatableLearningEvent)) ||
      (saved as AggregatableLearningEvent).scorePercentage === undefined,
    "B: no fake score",
  );

  const events = repository.getAll();
  assert(events.length === 1, "B: one event");
  assert(hasLearnCompletion(events, "present-simple"), "B: recognized");
  assert(
    events[0]?.sessionId === `${LEARN_ACTIVITY}:present-simple:v2`,
    "B: session",
  );
  assert(events[0]?.lessonContentVersion === 2, "B: current version written");
}

export function verifyReloadRecognizesLearn(): void {
  const repository = new MemoryLearningHistoryRepository();
  recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 1_700_032_100_000,
  });

  const first = loadDashboardLearningState(repository);
  const second = loadDashboardLearningState(repository);
  assert(hasLearnCompletion(first.events, "present-simple"), "C: first load");
  assert(hasLearnCompletion(second.events, "present-simple"), "C: reload");
  assert(JSON.stringify(first) === JSON.stringify(second), "C: deterministic");
  assert(first.summary.latestActivity === LEARN_ACTIVITY, "C: latest learn");
  assert(first.summary.quizAttempts === 0, "C: no fake quiz");
  assert(first.summary.millionaireAttempts === 0, "C: no fake millionaire");

  const firstJourney = buildLearningJourney(first.summary, first.events);
  const secondJourney = buildLearningJourney(second.summary, second.events);
  assert(firstJourney.stage === "PRACTICE", "C: still PRACTICE");
  assert(
    firstJourney.nextAction.href === getActivityPath("present-simple", "quiz"),
    "C: still Quiz",
  );
  assert(
    JSON.stringify(firstJourney.nextAction) ===
      JSON.stringify(secondJourney.nextAction),
    "C: next action stable",
  );
  assert(first.events.length === 1, "C: no duplicate learn event");
}

export function verifyHomeAndEntryAgreeAfterLearn(): void {
  const repository = new MemoryLearningHistoryRepository();
  recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 1_700_032_100_000,
  });
  const { events, summary } = loadDashboardLearningState(repository);
  assertHomeAndEntryAgree(events, "D");

  const home = buildStudentLearningHome(summary, events);
  const entry = buildLessonEntry("present-simple", events);
  const lessonSummary = buildLearningSummaryForLesson(events, "present-simple");
  const path = evaluateLessonJourney(lessonSummary, "present-simple");
  const quizHref = getActivityPath("present-simple", "quiz");

  assert(path.stage === "PRACTICE", "D: Learn complete → PRACTICE");
  assert(path.reasonCode === "LEARN_COMPLETE", "D: LEARN_COMPLETE");
  assert(home.activeLesson?.lessonSlug === "present-simple", "D: home Present");
  assert(home.activeLesson?.stage === "PRACTICE", "D: home PRACTICE");
  assert(entry.isActiveLesson, "D: entry Present active");
  assert(entry.stage === "PRACTICE", "D: entry PRACTICE");
  assert(!entry.isComplete, "D: not lesson COMPLETE");
  assert(home.hasHistory, "D: home has history");
  assert(entry.hasLessonHistory, "D: entry has history");
  assert(summary.averageQuizScore === 0, "D: no fabricated quiz score");
  assert(
    home.resumeLearning.action.label === JOURNEY_ACTION_LABELS.practiceQuiz,
    "D: Home CTA ทำ Quiz",
  );
  assert(home.resumeLearning.action.href === quizHref, "D: Home Quiz href");
  assert(entry.nextAction.label === JOURNEY_ACTION_LABELS.practiceQuiz, "D: entry CTA");
  assert(entry.nextAction.href === quizHref, "D: entry Quiz href");
  assert(path.nextAction.href === quizHref, "D: journey Quiz href");
}

export function verifyFlashOnlyDoesNotAdvanceToQuiz(): void {
  const events = [
    makeEvent({
      activity: "flash-cards",
      lessonSlug: "present-simple",
      flashEasy: 4,
      flashMedium: 0,
      flashHard: 0,
    }),
  ];
  const summary = buildLearningSummary(events);
  const path = evaluateLessonJourney(
    buildLearningSummaryForLesson(events, "present-simple"),
    "present-simple",
  );
  const home = buildStudentLearningHome(summary, events);
  const entry = buildLessonEntry("present-simple", events);
  const recommendation = buildLearningRecommendation(summary, events);

  assert(!hasLearnCompletion(events, "present-simple"), "E-flash: no learn event");
  assert(path.stage === "LEARN", "E-flash: stays LEARN");
  assert(path.reasonCode === "FALLBACK_LEARN", "E-flash: FALLBACK_LEARN");
  assert(
    path.nextAction.href === getLessonPath("present-simple"),
    "E-flash: lesson href not Quiz",
  );
  assert(
    home.resumeLearning.action.href !==
      getActivityPath("present-simple", "quiz"),
    "E-flash: home not Quiz",
  );
  assert(
    entry.nextAction.href !== getActivityPath("present-simple", "quiz"),
    "E-flash: entry not Quiz",
  );
  assert(recommendation.reasonCode !== "LEARN_COMPLETE", "E-flash: not LEARN_COMPLETE");
}

export function verifyRepeatedLearnDoesNotInflate(): void {
  const repository = new MemoryLearningHistoryRepository();
  const first = recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 1_700_032_100_000,
  });
  const second = recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 1_700_032_999_000,
  });
  const third = recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
  });

  assert(repository.getAll().length === 1, "E: still one event");
  assert(first?.completedAt === second?.completedAt, "E: original timestamp kept");
  assert(first?.sessionId === third?.sessionId, "E: same session identity");
  const summary = buildLearningSummary(repository.getAll());
  assert(summary.totalActivities === 1, "E: analytics not inflated");
  assert(summary.averageQuizScore === 0, "E: no quiz score");
  assert(summary.averageMillionaireScore === 0, "E: no millionaire score");
  const journey = buildLearningJourney(summary, repository.getAll() as AggregatableLearningEvent[]);
  assert(journey.stage === "PRACTICE", "E: still PRACTICE");
  assert(
    journey.nextAction.href === getActivityPath("present-simple", "quiz"),
    "E: still Quiz",
  );
}

export function verifyQuizStillWorksAfterLearn(): void {
  const repository = new MemoryLearningHistoryRepository();
  recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 1,
  });
  recordActivityCompletion({
    result: assessmentResult({
      sessionId: "after_learn_quiz",
      activity: "quiz",
      percentage: 90,
      completedAt: 2,
    }),
    lessonSlug: "present-simple",
    repository,
  });

  const { events, summary } = loadDashboardLearningState(repository);
  assert(events.length === 2, "F: learn + quiz");
  assert(summary.quizAttempts === 1, "F: one quiz");
  assert(summary.averageQuizScore === 90, "F: quiz score unchanged");
  const journey = buildLearningJourney(emptySummary(), events);
  assert(journey.stage === "PLAY", "F: strong quiz still PLAY");
  assert(
    journey.nextAction.href === getActivityPath("present-simple", "millionaire"),
    "F: next Millionaire",
  );
}

export function verifyMillionaireStillWorksAfterLearn(): void {
  const repository = new MemoryLearningHistoryRepository();
  recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 1,
  });
  recordActivityCompletion({
    result: assessmentResult({
      sessionId: "after_learn_quiz",
      activity: "quiz",
      percentage: 90,
      completedAt: 2,
    }),
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: assessmentResult({
      sessionId: "after_learn_millionaire",
      activity: "millionaire",
      percentage: 80,
      completedAt: 3,
    }),
    lessonSlug: "present-simple",
    repository,
  });

  const { events, summary } = loadDashboardLearningState(repository);
  assert(summary.millionaireAttempts === 1, "G: one millionaire");
  assert(summary.averageMillionaireScore === 80, "G: score unchanged");
  const journey = buildLearningJourney(emptySummary(), events);
  assert(journey.stage === "PLAY", "G: developing millionaire stays PLAY");
  assert(!isLessonComplete(events, "present-simple"), "G: not complete yet");
}

export function verifyLessonCompletePolicyUnchanged(): void {
  const learnOnly = [
    makeEvent({
      activity: LEARN_ACTIVITY,
      lessonSlug: "present-simple",
      completedAt: 1,
    }),
  ];
  assert(
    !isLessonComplete(learnOnly, "present-simple"),
    "H: Learn alone is not COMPLETE",
  );

  const typical = [
    makeEvent({
      activity: LEARN_ACTIVITY,
      lessonSlug: "present-simple",
      completedAt: 1,
    }),
    ...presentCompleteEvents(2),
  ];
  assert(isLessonComplete(typical, "present-simple"), "H: strong Millionaire still COMPLETE");

  const surfacesHome = buildStudentLearningHome(emptySummary(), typical);
  assert(
    surfacesHome.activeLesson?.lessonSlug === "past-simple",
    "H: Past becomes active",
  );
}

export function verifyOutOfOrderLearnUnchanged(): void {
  const repository = new MemoryLearningHistoryRepository();
  recordLearnCompletion({
    lessonSlug: "past-simple",
    repository,
    completedAt: 50,
  });
  const { events } = loadDashboardLearningState(repository);
  const active = resolveActiveLesson(events);
  const home = buildStudentLearningHome(emptySummary(), events);
  const pastEntry = buildLessonEntry("past-simple", events);
  const curriculum = buildCurriculumProgress(events);

  assert(active.lessonSlug === "present-simple", "I: Present still active");
  assert(curriculum.completedLessons === 0, "I: no fake advancement");
  assert(pastEntry.isLockedInCurriculum, "I: Past locked display");
  assert(pastEntry.noticeKind === "out-of-order", "I: warning");
  assert(
    pastEntry.nextAction.href === getLessonPath("present-simple"),
    "I: CTA returns to Present",
  );
  assert(
    home.resumeLearning.action.lessonSlug === "present-simple",
    "I: home Present",
  );
  assert(hasLearnCompletion(events, "past-simple"), "I: Past learn kept");
}

export function verifyQuizDistributionStillPasses(): void {
  runQuizDistributionVerification();
}

export function verifyDashboardReadsLearnWithoutScoring(): void {
  const repository = new MemoryLearningHistoryRepository();
  recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 1_700_032_100_000,
  });
  const { summary, events } = loadDashboardLearningState(repository);
  const recommendation = buildLearningRecommendation(summary, events);
  const resume = buildResumeLearning(summary, events);
  const curriculum = buildCurriculumProgress(events);

  assert(summary.totalActivities === 1, "dashboard: one activity");
  assert(summary.latestActivity === LEARN_ACTIVITY, "dashboard: latest learn");
  assert(summary.averageQuizScore === 0, "dashboard: no quiz score");
  assert(curriculum.lessons[0]?.status === "ACTIVE", "dashboard: Present ACTIVE");
  assert(curriculum.lessons[0]?.stage === "PRACTICE", "dashboard: Present PRACTICE");
  assert(recommendation.lessonSlug === "present-simple", "dashboard: rec Present");
  assert(
    recommendation.href === getActivityPath("present-simple", "quiz"),
    "dashboard: rec Quiz",
  );
  assert(recommendation.ctaLabel === JOURNEY_ACTION_LABELS.practiceQuiz, "dashboard: ทำ Quiz");
  assert(resume.action.lessonSlug === "present-simple", "dashboard: resume Present");
  assert(
    resume.action.href === getActivityPath("present-simple", "quiz"),
    "dashboard: resume Quiz",
  );
  assert(resume.action.label === JOURNEY_ACTION_LABELS.practiceQuiz, "dashboard: resume CTA");
}

export function verifyInvalidLearnIsIgnored(): void {
  const repository = new MemoryLearningHistoryRepository();
  const skipped = recordLearnCompletion({
    lessonSlug: "   ",
    repository,
  });
  assert(skipped === null, "invalid: empty slug");
  assert(repository.getAll().length === 0, "invalid: nothing stored");
}

export function verifyCompanionDoesNotTouchLocalStorage(): void {
  const source = readFileSync(
    resolve(process.cwd(), "components/classroom-companion/ClassroomCompanion.tsx"),
    "utf8",
  );
  assert(!source.includes("localStorage"), "ui: no direct localStorage");
  assert(source.includes("recordLearnCompletion"), "ui: uses history helper");
}

export function runLearnCompletionVerification(): void {
  verifyEmptyHistoryStartsAtLearn();
  verifyLearnCompletionWritesHistory();
  verifyReloadRecognizesLearn();
  verifyHomeAndEntryAgreeAfterLearn();
  verifyFlashOnlyDoesNotAdvanceToQuiz();
  verifyRepeatedLearnDoesNotInflate();
  verifyQuizStillWorksAfterLearn();
  verifyMillionaireStillWorksAfterLearn();
  verifyLessonCompletePolicyUnchanged();
  verifyOutOfOrderLearnUnchanged();
  verifyQuizDistributionStillPasses();
  verifyDashboardReadsLearnWithoutScoring();
  verifyInvalidLearnIsIgnored();
  verifyCompanionDoesNotTouchLocalStorage();
}
