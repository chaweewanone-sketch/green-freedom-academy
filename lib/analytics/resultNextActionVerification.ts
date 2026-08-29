import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  JOURNEY_ACTION_LABELS,
  evaluateLessonJourney,
  isLessonComplete,
} from "@/lib/analytics/lessonProgress";
import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import {
  resolveForwardResultNextAction,
  toForwardResultNextAction,
} from "@/lib/analytics/resultNextAction";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildLearningSummary } from "@/lib/analytics/summary";
import {
  MemoryLearningHistoryRepository,
  loadDashboardLearningState,
  recordActivityCompletion,
} from "@/lib/history";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import type {
  AggregatableLearningEvent,
  LearningSummary,
} from "@/types/analytics";
import type { AssessmentResult } from "@/types/assessment-result";
import type { FlashCardResult } from "@/types/recall";

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
    sessionId: overrides.sessionId ?? "result_session",
    activity: overrides.activity,
    score: overrides.score ?? 9,
    correct: overrides.correct ?? 9,
    incorrect: overrides.incorrect ?? 1,
    percentage: overrides.percentage ?? 90,
    completedAt: overrides.completedAt ?? 1_700_036_000_000,
  };
}

function nextActionFromEvents(
  currentActivity: string,
  currentLessonSlug: string,
  events: AggregatableLearningEvent[],
) {
  return resolveForwardResultNextAction({
    currentActivity,
    currentLessonSlug,
    summary: emptySummary(),
    events,
  });
}

function persistThenResolve(
  currentActivity: string,
  currentLessonSlug: string,
  results: AssessmentResult[],
) {
  const repository = new MemoryLearningHistoryRepository();

  for (const result of results) {
    recordActivityCompletion({
      result,
      lessonSlug: currentLessonSlug,
      repository,
    });
  }

  const state = loadDashboardLearningState(repository);
  return resolveForwardResultNextAction({
    currentActivity,
    currentLessonSlug,
    summary: state.summary,
    events: state.events,
  });
}

export function verifyQuiz60KeepsGenericResult(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 60,
    }),
  ];
  const nextAction = nextActionFromEvents("quiz", "present-simple", events);
  const journey = evaluateLessonJourney(
    buildLearningSummary(events),
    "present-simple",
  );

  assert(nextAction === null, "A: no Result nextAction");
  assert(journey.stage === "PRACTICE", "A: journey stays PRACTICE");
  assert(
    journey.nextAction.href === getActivityPath("present-simple", "quiz"),
    "A: journey stays Quiz",
  );
}

export function verifyQuiz75KeepsGenericResult(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 75,
    }),
  ];
  const nextAction = nextActionFromEvents("quiz", "present-simple", events);

  assert(nextAction === null, "B: no Result nextAction");
  assert(
    evaluateLessonJourney(buildLearningSummary(events), "present-simple")
      .stage === "PRACTICE",
    "B: journey stays PRACTICE",
  );
}

export function verifyQuiz90GuidesMillionaire(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
    }),
  ];
  const nextAction = persistThenResolve("quiz", "present-simple", [
    assessmentResult({
      activity: "quiz",
      percentage: 90,
      score: 9,
      correct: 9,
      incorrect: 1,
    }),
  ]);
  const resume = buildResumeLearning(emptySummary(), events);

  assert(nextAction !== null, "C: Result nextAction present");
  assert(nextAction?.label === "เล่น Millionaire", "C: เล่น Millionaire");
  assert(
    nextAction?.href === getActivityPath("present-simple", "millionaire"),
    "C: Millionaire href",
  );
  assert(resume.action.label === "เล่น Millionaire", "C: Resume label");
  assert(
    resume.action.href === getActivityPath("present-simple", "millionaire"),
    "C: Resume href",
  );
}

export function verifyQuiz100GuidesMillionaire(): void {
  const nextAction = nextActionFromEvents("quiz", "present-simple", [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 100,
    }),
  ]);

  assert(nextAction?.label === "เล่น Millionaire", "D: เล่น Millionaire");
  assert(
    nextAction?.href === getActivityPath("present-simple", "millionaire"),
    "D: Millionaire href",
  );
}

export function verifyStrongMillionaireGuidesNextLesson(): void {
  const events = [
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
  ];
  const nextAction = nextActionFromEvents(
    "millionaire",
    "present-simple",
    events,
  );

  assert(isLessonComplete(events, "present-simple"), "E: Present complete");
  assert(nextAction?.label === JOURNEY_ACTION_LABELS.nextLesson, "E: เรียนบทถัดไป");
  assert(nextAction?.href === getLessonPath("past-simple"), "E: Past lesson");
}

export function verifyCurriculumCompleteMillionaireGuidesDashboard(): void {
  const events = [
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
  ];
  const nextAction = nextActionFromEvents("millionaire", "past-simple", events);

  assert(isLessonComplete(events, "past-simple"), "E.dash: Past complete");
  assert(
    nextAction?.label === JOURNEY_ACTION_LABELS.complete,
    "E.dash: ดูสรุปการเรียน",
  );
  assert(nextAction?.href === getDashboardPath(), "E.dash: /dashboard");
}

export function verifyDevelopingMillionaireKeepsGenericResult(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 1,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 75,
      completedAt: 2,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  const nextAction = nextActionFromEvents(
    "millionaire",
    "present-simple",
    events,
  );

  assert(
    recommendation.href === getActivityPath("present-simple", "millionaire"),
    "F: Rec stays Millionaire",
  );
  assert(nextAction === null, "F: no duplicate same-activity nextAction");
  assert(!isLessonComplete(events, "present-simple"), "F: not complete");
}

export function verifyWeakMillionaireKeepsGenericResult(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 1,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 60,
      completedAt: 2,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  const nextAction = nextActionFromEvents(
    "millionaire",
    "present-simple",
    events,
  );

  assert(
    recommendation.href === getActivityPath("present-simple", "quiz"),
    "G: Rec may point back to Quiz",
  );
  assert(nextAction === null, "G: Sprint 36 does not surface Quiz-backtrack");
  assert(
    toForwardResultNextAction("millionaire", "present-simple", recommendation) ===
      null,
    "G: guard classifies Quiz-backtrack as non-forward",
  );
}

export function verifyFlashNeverReceivesNextAction(): void {
  const weakFlash = [
    makeEvent({
      activity: "flash-cards",
      lessonSlug: "present-simple",
      flashEasy: 1,
      flashMedium: 2,
      flashHard: 3,
    }),
  ];
  const strongFlash = [
    makeEvent({
      activity: "flash-cards",
      lessonSlug: "present-simple",
      flashEasy: 8,
      flashMedium: 1,
      flashHard: 0,
    }),
  ];

  assert(
    nextActionFromEvents("flash-cards", "present-simple", weakFlash) === null,
    "H: weak Flash no nextAction",
  );
  assert(
    nextActionFromEvents("flash-cards", "present-simple", strongFlash) === null,
    "H: strong Flash no nextAction",
  );

  const repository = new MemoryLearningHistoryRepository();
  const flashResult: FlashCardResult = {
    sessionId: "flash_1",
    activity: "flash-cards",
    reviewedCards: 4,
    totalCards: 4,
    easy: 4,
    medium: 0,
    hard: 0,
    reviews: [],
    completedAt: 1_700_036_100_000,
  };
  recordActivityCompletion({
    result: flashResult,
    lessonSlug: "present-simple",
    repository,
  });
  const state = loadDashboardLearningState(repository);
  assert(
    resolveForwardResultNextAction({
      currentActivity: "flash-cards",
      currentLessonSlug: "present-simple",
      summary: state.summary,
      events: state.events,
    }) === null,
    "H: persisted Flash still has no nextAction",
  );
}

export function verifyHelperDoesNotDuplicateThresholds(): void {
  const source = readFileSync(
    resolve(process.cwd(), "lib/analytics/resultNextAction.ts"),
    "utf8",
  );
  assert(!source.includes("JOURNEY_THRESHOLDS"), "policy: no journey thresholds");
  assert(
    !source.includes("RECOMMENDATION_THRESHOLDS"),
    "policy: no recommendation thresholds",
  );
  assert(!source.includes("scorePercentage"), "policy: does not inspect scores");
  assert(!source.includes("percentage"), "policy: does not inspect percentage");
  assert(
    source.includes("buildLearningRecommendation"),
    "policy: reuses recommendation",
  );
}

export function verifyResultUiDoesNotEncodeScorePolicy(): void {
  const files = [
    "components/activities/ActivityResultActions.tsx",
    "components/activities/StudentActivityPlayer.tsx",
    "components/quiz/QuizGame.tsx",
    "components/millionaire/ResultPanel.tsx",
    "components/millionaire/MillionaireGame.tsx",
    "components/flash-cards/FlashCardsGame.tsx",
  ];

  for (const relative of files) {
    const source = readFileSync(resolve(process.cwd(), relative), "utf8");
    assert(!source.includes("JOURNEY_THRESHOLDS"), `${relative}: no thresholds`);
    assert(
      !source.includes("RECOMMENDATION_THRESHOLDS"),
      `${relative}: no rec thresholds`,
    );
    assert(!source.includes("quizStrong"), `${relative}: no quizStrong`);
    assert(!source.includes("strongMin"), `${relative}: no strongMin`);
  }

  const flashSource = readFileSync(
    resolve(process.cwd(), "components/flash-cards/FlashCardsGame.tsx"),
    "utf8",
  );
  assert(
    !flashSource.includes("nextAction"),
    "H: Flash does not pass nextAction",
  );
  assert(
    !flashSource.includes("resolveForwardResultNextAction"),
    "H: Flash does not compose nextAction",
  );

  const quizSource = readFileSync(
    resolve(process.cwd(), "components/quiz/QuizGame.tsx"),
    "utf8",
  );
  assert(
    !quizSource.includes("resolveForwardResultNextAction"),
    "quiz: does not load recommendation itself",
  );
}

export function runResultNextActionVerification(): void {
  verifyQuiz60KeepsGenericResult();
  verifyQuiz75KeepsGenericResult();
  verifyQuiz90GuidesMillionaire();
  verifyQuiz100GuidesMillionaire();
  verifyStrongMillionaireGuidesNextLesson();
  verifyCurriculumCompleteMillionaireGuidesDashboard();
  verifyDevelopingMillionaireKeepsGenericResult();
  verifyWeakMillionaireKeepsGenericResult();
  verifyFlashNeverReceivesNextAction();
  verifyHelperDoesNotDuplicateThresholds();
  verifyResultUiDoesNotEncodeScorePolicy();
}
