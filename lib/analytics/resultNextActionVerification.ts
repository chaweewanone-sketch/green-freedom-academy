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
  currentResult?: AssessmentResult,
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
    currentResult:
      currentResult?.activity === "quiz" ||
      currentResult?.activity === "millionaire"
        ? {
            activity: currentResult.activity,
            percentage: currentResult.percentage,
          }
        : undefined,
  });
}

function quizCurrentResult(percentage: number): AssessmentResult {
  const score = Math.round(percentage / 10);
  return assessmentResult({
    activity: "quiz",
    percentage,
    score,
    correct: score,
    incorrect: 10 - score,
  });
}

function nextActionFromCurrentQuiz(
  currentPercentage: number,
  historyPercentages: number[] = [],
) {
  const events = historyPercentages.map((scorePercentage, index) =>
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage,
      completedAt: index + 1,
    }),
  );

  return resolveForwardResultNextAction({
    currentActivity: "quiz",
    currentLessonSlug: "present-simple",
    summary: emptySummary(),
    events,
    currentResult: quizCurrentResult(currentPercentage),
  });
}

export function verifyQuiz60GuidesRetry(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 60,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  const nextAction = nextActionFromEvents("quiz", "present-simple", events);
  const journey = evaluateLessonJourney(
    buildLearningSummary(events),
    "present-simple",
  );

  assert(nextAction !== null, "A: Result nextAction present");
  assert(nextAction?.label === "ทำ Quiz อีกครั้ง", "A: ทำ Quiz อีกครั้ง");
  assert(
    nextAction?.href === getActivityPath("present-simple", "quiz"),
    "A: same Quiz href",
  );
  assert(nextAction?.sameActivity === true, "A: same-activity restart");
  assert(recommendation.ctaLabel === nextAction?.label, "A: label from engine");
  assert(journey.stage === "PRACTICE", "A: journey stays PRACTICE");
}

export function verifyQuiz80GuidesPractice(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 80,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  const nextAction = persistThenResolve("quiz", "present-simple", [
    assessmentResult({
      activity: "quiz",
      percentage: 80,
      score: 8,
      correct: 8,
      incorrect: 2,
    }),
  ]);
  const journey = evaluateLessonJourney(
    buildLearningSummary(events),
    "present-simple",
  );

  assert(nextAction !== null, "B: Result nextAction present");
  assert(nextAction?.label === "ฝึก Quiz", "B: ฝึก Quiz");
  assert(
    nextAction?.href === getActivityPath("present-simple", "quiz"),
    "B: same Quiz href",
  );
  assert(nextAction?.sameActivity === true, "B: same-activity restart");
  assert(recommendation.ctaLabel === "ฝึก Quiz", "B: engine developing label");
  assert(journey.stage === "PRACTICE", "B: journey stays PRACTICE");
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
  assert(nextAction?.sameActivity !== true, "C: routed, not restart");
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
  assert(!source.includes("scorePercentage"), "policy: does not inspect history scores");
  assert(
    !source.includes("developingMin") && !source.includes("strongMin"),
    "policy: no local score bands",
  );
  assert(
    source.includes("buildQuizScoreRecommendation"),
    "policy: quiz Result reuses score-band helper",
  );
  assert(
    source.includes("buildMillionaireResultRecommendation"),
    "policy: Millionaire Result reuses score-band helper",
  );
  assert(
    source.includes("buildLearningRecommendation"),
    "policy: history path still reuses recommendation",
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

export function verifyQuizGuidedResultUi(): void {
  const actions = readFileSync(
    resolve(process.cwd(), "components/activities/ActivityResultActions.tsx"),
    "utf8",
  );
  const quiz = readFileSync(
    resolve(process.cwd(), "components/quiz/QuizGame.tsx"),
    "utf8",
  );
  const millionaire = readFileSync(
    resolve(process.cwd(), "components/millionaire/ResultPanel.tsx"),
    "utf8",
  );

  assert(quiz.includes("guided"), "ui: Quiz uses guided Result actions");
  assert(millionaire.includes("guided"), "ui: Millionaire Result is guided");
  assert(actions.includes("sameActivity"), "ui: restart uses engine sameActivity");
  assert(actions.includes("onRestart"), "ui: same-activity binds onRestart");
  assert(actions.includes("กลับไปบทเรียน"), "ui: lesson secondary remains");
  assert(actions.includes("กลับหน้าหลักนักเรียน"), "ui: home secondary remains");
}

export function verifyCurrentQuizResultIgnoresHistoryAverage(): void {
  const isolated60 = nextActionFromCurrentQuiz(60);
  const isolated80 = nextActionFromCurrentQuiz(80);
  const isolated90 = nextActionFromCurrentQuiz(90);
  const history80Then90 = nextActionFromCurrentQuiz(90, [80, 80]);
  const history90Then60 = nextActionFromCurrentQuiz(60, [90]);
  const history60Then90 = nextActionFromCurrentQuiz(90, [60]);
  const history90Then80 = nextActionFromCurrentQuiz(80, [90, 90]);

  assert(isolated60?.label === "ทำ Quiz อีกครั้ง", "A: current 60");
  assert(isolated60?.sameActivity === true, "A: 60 retries Quiz");
  assert(isolated80?.label === "ฝึก Quiz", "B: current 80");
  assert(isolated80?.sameActivity === true, "B: 80 retries Quiz");
  assert(isolated90?.label === "เล่น Millionaire", "C: current 90");
  assert(
    isolated90?.href === getActivityPath("present-simple", "millionaire"),
    "C: 90 routes to Millionaire",
  );
  assert(isolated90?.sameActivity !== true, "C: 90 is not retry");
  assert(history80Then90?.label === "เล่น Millionaire", "D: 80,80 then 90");
  assert(history90Then60?.label === "ทำ Quiz อีกครั้ง", "E: 90 then 60");
  assert(history60Then90?.label === "เล่น Millionaire", "F: 60 then 90");
  assert(history90Then80?.label === "ฝึก Quiz", "G: 90,90 then 80");

  const persisted = persistThenResolve(
    "quiz",
    "present-simple",
    [
      assessmentResult({
        activity: "quiz",
        sessionId: "hist_80a",
        percentage: 80,
        score: 8,
        correct: 8,
        incorrect: 2,
        completedAt: 1,
      }),
      assessmentResult({
        activity: "quiz",
        sessionId: "hist_80b",
        percentage: 80,
        score: 8,
        correct: 8,
        incorrect: 2,
        completedAt: 2,
      }),
      quizCurrentResult(90),
    ],
    quizCurrentResult(90),
  );
  assert(persisted?.label === "เล่น Millionaire", "D: persist still uses current 90");
}

export function verifyHomeJourneyResumeKeepQuizAverage(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 80,
      completedAt: 1,
    }),
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 80,
      completedAt: 2,
    }),
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 3,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  const journey = evaluateLessonJourney(
    buildLearningSummary(events),
    "present-simple",
  );
  const resume = buildResumeLearning(emptySummary(), events);

  assert(recommendation.ctaLabel === "ฝึก Quiz", "I: Home average stays developing");
  assert(journey.stage === "PRACTICE", "I: Journey stays PRACTICE");
  assert(
    resume.action.href === getActivityPath("present-simple", "quiz"),
    "I: Resume still points at Quiz from average",
  );
  assert(resume.action.actionType === "PRACTICE", "I: Resume type stays PRACTICE");
}

export function verifyQuizRetryClearsParentNextAction(): void {
  const player = readFileSync(
    resolve(process.cwd(), "components/activities/StudentActivityPlayer.tsx"),
    "utf8",
  );
  const quiz = readFileSync(
    resolve(process.cwd(), "components/quiz/QuizGame.tsx"),
    "utf8",
  );
  const millionaire = readFileSync(
    resolve(process.cwd(), "components/millionaire/MillionaireGame.tsx"),
    "utf8",
  );

  assert(player.includes("onRestartAttempt={handleRestartAttempt}"), "H: player binds restart");
  assert(player.includes("setResultNextAction(null)"), "H: restart clears nextAction");
  assert(quiz.includes("onRestartAttempt"), "H: QuizGame notifies parent");
  assert(quiz.includes('initialPhase="intro"'), "J: Quiz intro retry boundary remains");
  assert(millionaire.includes("onRestartAttempt"), "41: Millionaire notifies parent");
  assert(millionaire.includes('createMillionaireAttemptSnapshot("start")'), "41: replay remounts intro");
}

function nextActionFromCurrentMillionaire(
  currentPercentage: number,
  historyPercentages: number[] = [],
  lessonSlug = "present-simple",
) {
  const events = historyPercentages.map((scorePercentage, index) =>
    makeEvent({
      activity: "millionaire",
      lessonSlug,
      scorePercentage,
      completedAt: index + 1,
    }),
  );

  return resolveForwardResultNextAction({
    currentActivity: "millionaire",
    currentLessonSlug: lessonSlug,
    summary: emptySummary(),
    events,
    currentResult: {
      activity: "millionaire",
      percentage: currentPercentage,
    },
  });
}

export function verifyMillionaireCurrentResultBands(): void {
  const quizHref = getActivityPath("present-simple", "quiz");
  const millionaireHref = getActivityPath("present-simple", "millionaire");
  const pastLesson = getLessonPath("past-simple");

  for (const percentage of [0, 59, 69]) {
    const action = nextActionFromCurrentMillionaire(percentage);
    assert(action?.label === "ฝึก Quiz อีกครั้ง", `${percentage}: weak label`);
    assert(action?.href === quizHref, `${percentage}: Quiz href`);
    assert(action?.sameActivity !== true, `${percentage}: weak is a route`);
  }

  for (const percentage of [70, 80, 84]) {
    const action = nextActionFromCurrentMillionaire(percentage);
    assert(action?.label === "เล่น Millionaire อีกครั้ง", `${percentage}: developing label`);
    assert(action?.href === millionaireHref, `${percentage}: Millionaire href`);
    assert(action?.sameActivity === true, `${percentage}: developing replays`);
  }

  for (const percentage of [85, 90, 100]) {
    const action = nextActionFromCurrentMillionaire(percentage);
    assert(action?.label === JOURNEY_ACTION_LABELS.nextLesson, `${percentage}: next lesson`);
    assert(action?.href === pastLesson, `${percentage}: Past Simple`);
    assert(action?.sameActivity !== true, `${percentage}: strong is a route`);
  }

  const complete = nextActionFromCurrentMillionaire(90, [], "past-simple");
  assert(complete?.label === JOURNEY_ACTION_LABELS.complete, "past 90: dashboard label");
  assert(complete?.href === getDashboardPath(), "past 90: /dashboard");
}

export function verifyMillionaireCurrentResultIgnoresHistory(): void {
  const history90Current60 = nextActionFromCurrentMillionaire(60, [90]);
  const history50Current90 = nextActionFromCurrentMillionaire(90, [50]);
  const history90Current80 = nextActionFromCurrentMillionaire(80, [90]);

  assert(history90Current60?.label === "ฝึก Quiz อีกครั้ง", "A: current 60 beats avg 90");
  assert(history50Current90?.label === JOURNEY_ACTION_LABELS.nextLesson, "B: current 90 beats avg 50");
  assert(history90Current80?.label === "เล่น Millionaire อีกครั้ง", "C: current 80 beats avg 90");
}

export function runResultNextActionVerification(): void {
  verifyQuiz60GuidesRetry();
  verifyQuiz80GuidesPractice();
  verifyQuiz90GuidesMillionaire();
  verifyQuiz100GuidesMillionaire();
  verifyStrongMillionaireGuidesNextLesson();
  verifyCurriculumCompleteMillionaireGuidesDashboard();
  verifyDevelopingMillionaireKeepsGenericResult();
  verifyWeakMillionaireKeepsGenericResult();
  verifyFlashNeverReceivesNextAction();
  verifyHelperDoesNotDuplicateThresholds();
  verifyResultUiDoesNotEncodeScorePolicy();
  verifyQuizGuidedResultUi();
  verifyCurrentQuizResultIgnoresHistoryAverage();
  verifyHomeJourneyResumeKeepQuizAverage();
  verifyQuizRetryClearsParentNextAction();
  verifyMillionaireCurrentResultBands();
  verifyMillionaireCurrentResultIgnoresHistory();
}
