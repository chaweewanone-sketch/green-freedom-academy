import { ACTIVITY_DEFAULTS, buildAssessmentResult, createAssessmentSession } from "@/lib/assessment";
import { JOURNEY_ACTION_LABELS, JOURNEY_THRESHOLDS, evaluateLessonJourney, isLessonComplete } from "@/lib/analytics/lessonProgress";
import { buildLearningJourney } from "@/lib/analytics/journey";
import { buildLessonEntry } from "@/lib/analytics/lessonEntry";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildStudentLearningHome } from "@/lib/analytics/studentHome";
import { buildLearningSummary } from "@/lib/analytics/summary";
import { resolveActiveLesson } from "@/lib/analytics/activeLesson";
import { getLessonBySlug } from "@/lib/lessons";
import { getActivityPath, getLessonPath } from "@/lib/routes";
import {
  MemoryLearningHistoryRepository,
  recordActivityCompletion,
  recordLearnCompletion,
} from "@/lib/history";
import {
  countCorrectPositions,
  isNearBalanced,
} from "@/lib/question-bank/quizDistributionVerification";
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

function requirePresentSimpleLesson() {
  const lesson = getLessonBySlug("present-simple");
  if (!lesson) {
    throw new Error("present-simple lesson exists");
  }
  return lesson;
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

export function verifyDefaultQuizLengthIsTen(): void {
  assert(ACTIVITY_DEFAULTS.quiz.questionCount === 10, "A: default 10");
  assert(ACTIVITY_DEFAULTS.millionaire.questionCount === 10, "A: millionaire unchanged");
  assert(ACTIVITY_DEFAULTS["flash-cards"].questionCount === 20, "A: flash unchanged");

  const lesson = requirePresentSimpleLesson();
  const session = createAssessmentSession(lesson, "quiz");
  assert(session.selectedCount === 10, "A: selectedCount 10");
  assert(session.questions.length === 10, "A: 10 questions");
}

export function verifyTenQuestionAnswerDistribution(): void {
  const lesson = requirePresentSimpleLesson();
  const session = createAssessmentSession(lesson, "quiz", {
    questionCount: 10,
    randomize: false,
  });
  const counts = countCorrectPositions(session.questions);
  const values = [counts.A, counts.B, counts.C, counts.D];

  assert(session.questions.length === 10, "B: 10 questions");
  assert(values.every((value) => value > 0), "B: A/B/C/D all occur");
  assert(isNearBalanced(counts, 10), `B: max-min <= 1 ${JSON.stringify(counts)}`);
  assert(
    JSON.stringify([...values].sort((a, b) => b - a)) === JSON.stringify([3, 3, 2, 2]),
    `B: 3/3/2/2 ${JSON.stringify(counts)}`,
  );
}

export function verifyTenQuestionScoring(): void {
  const lesson = requirePresentSimpleLesson();
  const session = createAssessmentSession(lesson, "quiz", {
    questionCount: 10,
    randomize: false,
  });

  const zero = buildAssessmentResult(session, 0, 10);
  const seven = buildAssessmentResult(session, 7, 3);
  const eight = buildAssessmentResult(session, 8, 2);
  const ten = buildAssessmentResult(session, 10, 0);

  assert(zero.percentage === 0, "C: 0/10 = 0%");
  assert(seven.percentage === 70, "C: 7/10 = 70%");
  assert(eight.percentage === 80, "C: 8/10 = 80%");
  assert(ten.percentage === 100, "C: 10/10 = 100%");
}

export function verifyPercentageThresholdSemantics(): void {
  const lesson = requirePresentSimpleLesson();
  const session = createAssessmentSession(lesson, "quiz", {
    questionCount: 10,
    randomize: false,
  });
  const six = buildAssessmentResult(session, 6, 4);
  const seven = buildAssessmentResult(session, 7, 3);
  const eight = buildAssessmentResult(session, 8, 2);
  const nine = buildAssessmentResult(session, 9, 1);

  assert(six.percentage === 60, "D: 6/10 = 60%");
  assert(six.percentage < JOURNEY_THRESHOLDS.quizReview, "D: 60% is below 70");
  assert(seven.percentage === JOURNEY_THRESHOLDS.quizReview, "D: 70% is review boundary");
  assert(
    eight.percentage >= JOURNEY_THRESHOLDS.quizReview &&
      eight.percentage < JOURNEY_THRESHOLDS.quizStrong,
    "D: 80% stays developing",
  );
  assert(nine.percentage >= JOURNEY_THRESHOLDS.quizStrong, "D: 90% is strong");

  function journeyFor(result: AssessmentResult) {
    const summary: LearningSummary = {
      ...emptySummary(),
      totalActivities: 1,
      quizAttempts: 1,
      averageQuizScore: result.percentage,
      latestActivity: "quiz",
      latestLesson: "present-simple",
    };
    return evaluateLessonJourney(summary, "present-simple");
  }

  assert(journeyFor(six).reasonCode === "QUIZ_WEAK", "D: 60% QUIZ_WEAK");
  assert(journeyFor(seven).reasonCode === "QUIZ_DEVELOPING", "D: 70% QUIZ_DEVELOPING");
  assert(journeyFor(eight).reasonCode === "QUIZ_DEVELOPING", "D: 80% QUIZ_DEVELOPING");
  assert(journeyFor(nine).reasonCode === "QUIZ_STRONG", "D: 90% QUIZ_STRONG");
}

export function verifyTenQuestionRetry(): void {
  const lesson = requirePresentSimpleLesson();
  const firstSession = createAssessmentSession(lesson, "quiz", {
    questionCount: 10,
    randomize: false,
  });
  const firstResult = buildAssessmentResult(firstSession, 7, 3);
  const repository = new MemoryLearningHistoryRepository();

  recordActivityCompletion({
    result: firstResult,
    lessonSlug: "present-simple",
    repository,
  });

  const retrySession = createAssessmentSession(lesson, "quiz");
  assert(retrySession.questions.length === 10, "E: retry still 10");
  const retryResult = {
    ...buildAssessmentResult(retrySession, 8, 2),
    completedAt: firstResult.completedAt + 1,
    sessionId: "quiz_retry_2",
  };

  recordActivityCompletion({
    result: retryResult,
    lessonSlug: "present-simple",
    repository,
  });

  const events = repository.getAll();
  assert(events.length === 2, "E: two attempts");
  assert(firstResult.percentage === 70, "E: first 70%");
  assert(retryResult.percentage === 80, "E: retry 80%");
}

export function verifyOldTwentyQuestionHistoryReadable(): void {
  const lesson = requirePresentSimpleLesson();
  const oldSession = createAssessmentSession(lesson, "quiz", {
    questionCount: 20,
    randomize: false,
  });
  assert(oldSession.questions.length === 20, "F: explicit 20 still available");
  const oldResult = buildAssessmentResult(oldSession, 15, 5);
  assert(oldResult.percentage === 75, "F: 15/20 = 75%");

  const repository = new MemoryLearningHistoryRepository();
  recordActivityCompletion({
    result: oldResult,
    lessonSlug: "present-simple",
    repository,
  });

  const stored = repository.getAll() as AggregatableLearningEvent[];
  const summary = buildLearningSummary(stored);
  assert(stored.length === 1, "F: one event");
  assert(summary.quizAttempts === 1, "F: readable");
  assert(summary.averageQuizScore === 75, "F: stored percentage, no migration");
  assert(summary.totalActivities === 1, "F: no reset");
}

export function verifySprint33LearnToPractice(): void {
  const emptyHome = buildStudentLearningHome(emptySummary(), []);
  assert(
    emptyHome.resumeLearning.action.href === getLessonPath("present-simple"),
    "G: empty Learn",
  );
  assert(
    emptyHome.resumeLearning.action.label === JOURNEY_ACTION_LABELS.learn,
    "G: เริ่มเรียน",
  );

  const repository = new MemoryLearningHistoryRepository();
  recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 1,
  });
  const afterLearn = repository.getAll() as AggregatableLearningEvent[];
  const home = buildStudentLearningHome(buildLearningSummary(afterLearn), afterLearn);
  const entry = buildLessonEntry("present-simple", afterLearn);
  const resume = buildResumeLearning(emptySummary(), afterLearn);

  assert(
    home.resumeLearning.action.href === getActivityPath("present-simple", "quiz"),
    "G: after Learn → Quiz",
  );
  assert(home.resumeLearning.action.label === JOURNEY_ACTION_LABELS.practiceQuiz, "G: ทำ Quiz");
  assert(entry.nextAction.href === getActivityPath("present-simple", "quiz"), "G: entry Quiz");
  assert(resume.action.href === getActivityPath("present-simple", "quiz"), "G: resume Quiz");

  const afterQuiz = [
    ...afterLearn,
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 2,
    }),
  ];
  const quizJourney = buildLearningJourney(emptySummary(), afterQuiz);
  assert(quizJourney.stage === "PLAY", "G: strong quiz still PLAY");
  assert(
    quizJourney.nextAction.href === getActivityPath("present-simple", "millionaire"),
    "G: next Millionaire",
  );
}

export function verifyMillionaireDefaultUnchanged(): void {
  assert(ACTIVITY_DEFAULTS.millionaire.questionCount === 10, "H: millionaire 10");
  const lesson = requirePresentSimpleLesson();
  const session = createAssessmentSession(lesson, "millionaire");
  assert(session.questions.length === 10, "H: millionaire session 10");
}

export function verifyFlashCardsDefaultUnchanged(): void {
  assert(ACTIVITY_DEFAULTS["flash-cards"].questionCount === 20, "I: flash 20");
}

export function verifyCompletePolicyUnchanged(): void {
  const learnOnly = [
    makeEvent({ activity: "learn", lessonSlug: "present-simple", completedAt: 1 }),
  ];
  assert(!isLessonComplete(learnOnly, "present-simple"), "J: learn not COMPLETE");

  const complete = [
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
  assert(isLessonComplete(complete, "present-simple"), "J: strong Millionaire COMPLETE");
}

export function verifyOutOfOrderUnchanged(): void {
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
  const pastEntry = buildLessonEntry("past-simple", events);

  assert(active.lessonSlug === "present-simple", "K: Present active");
  assert(home.resumeLearning.action.lessonSlug === "present-simple", "K: home Present");
  assert(pastEntry.noticeKind === "out-of-order", "K: Past warning");
}

export function runQuizPracticeLengthVerification(): void {
  verifyDefaultQuizLengthIsTen();
  verifyTenQuestionAnswerDistribution();
  verifyTenQuestionScoring();
  verifyPercentageThresholdSemantics();
  verifyTenQuestionRetry();
  verifyOldTwentyQuestionHistoryReadable();
  verifySprint33LearnToPractice();
  verifyMillionaireDefaultUnchanged();
  verifyFlashCardsDefaultUnchanged();
  verifyCompletePolicyUnchanged();
  verifyOutOfOrderUnchanged();
}
