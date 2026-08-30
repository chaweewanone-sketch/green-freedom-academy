import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildAssessmentResult, createAssessmentSession } from "@/lib/assessment";
import {
  resolveForwardResultNextAction,
  toForwardResultNextAction,
} from "@/lib/analytics/resultNextAction";
import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import {
  MemoryLearningHistoryRepository,
  recordActivityCompletion,
} from "@/lib/history";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import { getActivityPath } from "@/lib/routes";
import {
  createQuizAttemptSnapshot,
  nextQuizAttemptKey,
  resolveQuizChoiceScore,
} from "@/lib/quiz/quizAttemptState";
import type { AggregatableLearningEvent, LearningSummary } from "@/types/analytics";
import type { AssessmentResult } from "@/types/assessment-result";
import type { AssessmentSession } from "@/types/assessment";
import type { Question } from "@/types/question";

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
  };
}

function frozenQuizSession(): AssessmentSession {
  return createAssessmentSession(presentSimpleLesson, "quiz", {
    randomize: false,
    questionCount: 10,
  });
}

function firstWrongChoiceId(question: Question): string {
  const wrong = question.choices.find(
    (choice) => choice.id !== question.correctChoiceId,
  );
  if (!wrong) {
    throw new Error("fixture: question has a distractor");
  }
  return wrong.id;
}

function applyChoice(
  snapshot: ReturnType<typeof createQuizAttemptSnapshot>,
  question: Question,
  choiceId: string,
) {
  if (snapshot.phase !== "question" || snapshot.revealed) {
    return snapshot;
  }

  const outcome = resolveQuizChoiceScore(choiceId, question.correctChoiceId);
  return {
    ...snapshot,
    selectedChoiceId: choiceId,
    revealed: true,
    correctCount: snapshot.correctCount + (outcome === "correct" ? 1 : 0),
    incorrectCount: snapshot.incorrectCount + (outcome === "incorrect" ? 1 : 0),
  };
}

function quizResultFromCounts(
  session: AssessmentSession,
  correct: number,
  incorrect: number,
  completedAt: number,
): AssessmentResult {
  return {
    ...buildAssessmentResult(session, correct, incorrect),
    completedAt,
  };
}

export function verifyRestartAttemptStateIsClean(): void {
  const attempt1 = buildAssessmentResult(frozenQuizSession(), 8, 2);
  const retry = createQuizAttemptSnapshot("intro");

  assert(attempt1.score === 8, "A: attempt 1 is 8/10");
  assert(attempt1.percentage === 80, "A: attempt 1 is 80%");
  assert(retry.phase === "intro", "B: retry returns to intro");
  assert(retry.currentIndex === 0, "B: index 0");
  assert(retry.correctCount === 0, "B: correct 0");
  assert(retry.incorrectCount === 0, "B: incorrect 0");
  assert(retry.selectedChoiceId === null, "B: selected null");
  assert(retry.revealed === false, "B: revealed false");
  assert(retry.result === null, "B: result null");
  assert(retry.hasRecordedCompletion === false, "B: completion flag false");
  assert(nextQuizAttemptKey(0) === 1, "B: restart still remounts");
}

export function verifyIntroBlocksAnswersUntilStart(): void {
  const session = frozenQuizSession();
  const question = session.questions[0];
  if (!question) {
    throw new Error("C: Q1 exists");
  }

  const intro = createQuizAttemptSnapshot("intro");
  const ignored = applyChoice(intro, question, firstWrongChoiceId(question));

  assert(ignored.phase === "intro", "C: stays on intro");
  assert(ignored.incorrectCount === 0, "C: intro cannot record an answer");
  assert(ignored.selectedChoiceId === null, "C: no selected choice");
  assert(ignored.revealed === false, "C: no reveal");
}

export function verifyStartOpensCleanQuestionOne(): void {
  const started = createQuizAttemptSnapshot("question");
  assert(started.phase === "question", "D: start enters question");
  assert(started.currentIndex === 0, "D: Question 1");
  assert(started.correctCount === 0, "D: correct 0");
  assert(started.incorrectCount === 0, "D: incorrect 0");
  assert(started.selectedChoiceId === null, "D: selected null");
  assert(started.revealed === false, "D: revealed false");
  assert(started.result === null, "D: no prior result");
}

export function verifyQ1WrongIncrementsIncorrectOnly(): void {
  const session = frozenQuizSession();
  const question = session.questions[0];
  if (!question) {
    throw new Error("B: Q1 exists");
  }

  const afterWrong = applyChoice(
    createQuizAttemptSnapshot("question"),
    question,
    firstWrongChoiceId(question),
  );

  assert(afterWrong.correctCount === 0, "E: correct stays 0");
  assert(afterWrong.incorrectCount === 1, "E: incorrect is 1");
  assert(afterWrong.revealed === true, "E: revealed after intentional answer");
  assert(afterWrong.selectedChoiceId !== question.correctChoiceId, "E: wrong pick");
}

export function verifyAttempt2ResultIgnoresAttempt1(): void {
  const session = frozenQuizSession();
  const attempt1 = buildAssessmentResult(session, 8, 2);
  const restart = createQuizAttemptSnapshot("intro");

  assert(attempt1.score === 8, "H: attempt 1 is 8/10");
  assert(attempt1.percentage === 80, "H: attempt 1 is 80%");
  assert(restart.result === null, "H: retry intro has no result");
  assert(restart.correctCount === 0, "H: retry counts start at 0");
  assert(restart.incorrectCount === 0, "H: retry incorrect starts at 0");

  const attempt2 = buildAssessmentResult(session, 3, 7);
  assert(attempt2.sessionId === session.sessionId, "H: same session identity");
  assert(attempt2.score === 3, "H: attempt 2 uses attempt 2 counts");
  assert(attempt2.score !== attempt1.score, "H: attempt 2 is not stale 8/10");
  assert(attempt2.percentage !== attempt1.percentage, "H: percentage is attempt 2");
}

export function verifyWeakAndDevelopingRestartSameSession(): void {
  const session = frozenQuizSession();
  const firstKey = 0;
  const restartKey = nextQuizAttemptKey(firstKey);

  assert(restartKey !== firstKey, "D: remount key changes");
  assert(session.questions.length === 10, "D: same 10-question session");

  const weak = resolveForwardResultNextAction({
    currentActivity: "quiz",
    currentLessonSlug: "present-simple",
    summary: emptySummary(),
    events: [
      makeEvent({
        activity: "quiz",
        lessonSlug: "present-simple",
        scorePercentage: 60,
      }),
    ],
  });
  const developing = resolveForwardResultNextAction({
    currentActivity: "quiz",
    currentLessonSlug: "present-simple",
    summary: emptySummary(),
    events: [
      makeEvent({
        activity: "quiz",
        lessonSlug: "present-simple",
        scorePercentage: 80,
      }),
    ],
  });

  assert(weak?.label === "ทำ Quiz อีกครั้ง", "D: weak label");
  assert(weak?.sameActivity === true, "D: weak restarts same activity");
  assert(developing?.label === "ฝึก Quiz", "D/A: developing label");
  assert(developing?.sameActivity === true, "A: developing restarts same activity");
}

export function verifyStrongRouteUnchanged(): void {
  const nextAction = resolveForwardResultNextAction({
    currentActivity: "quiz",
    currentLessonSlug: "present-simple",
    summary: emptySummary(),
    events: [
      makeEvent({
        activity: "quiz",
        lessonSlug: "present-simple",
        scorePercentage: 90,
      }),
    ],
  });
  const recommendation = buildLearningRecommendation(emptySummary(), [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
    }),
  ]);

  assert(nextAction?.label === "เล่น Millionaire", "E: strong label");
  assert(
    nextAction?.href === getActivityPath("present-simple", "millionaire"),
    "E: Millionaire href",
  );
  assert(nextAction?.sameActivity !== true, "E: not in-place restart");
  assert(
    toForwardResultNextAction("quiz", "present-simple", recommendation)?.label ===
      "เล่น Millionaire",
    "E: guard still forwards Millionaire",
  );
}

export function verifyHistoryWritesOncePerFinishedAttempt(): void {
  const session = frozenQuizSession();
  const repository = new MemoryLearningHistoryRepository();

  const first = recordActivityCompletion({
    result: quizResultFromCounts(session, 8, 2, 1_700_040_000_000),
    lessonSlug: session.lessonSlug,
    repository,
  });
  assert(first !== null, "I: attempt 1 writes");
  assert(repository.getAll().length === 1, "I: one event after attempt 1");

  const retry = createQuizAttemptSnapshot("intro");
  const started = createQuizAttemptSnapshot("question");
  assert(retry.hasRecordedCompletion === false, "I: retry CTA writes nothing");
  assert(started.hasRecordedCompletion === false, "I: intro Start writes nothing");
  assert(repository.getAll().length === 1, "I: retry/start do not append");

  const second = recordActivityCompletion({
    result: quizResultFromCounts(session, 3, 7, 1_700_040_000_500),
    lessonSlug: session.lessonSlug,
    repository,
  });
  assert(second !== null, "I: attempt 2 writes");
  assert(repository.getAll().length === 2, "I: one additional event");
  assert(
    repository.getAll()[0]?.sessionId === repository.getAll()[1]?.sessionId,
    "I: same sessionId is reused",
  );
  assert(
    repository.getAll()[0]?.completedAt !== repository.getAll()[1]?.completedAt,
    "I: not a stale duplicate timestamp",
  );
}

export function verifyQuizGameRemountsOnRestart(): void {
  const source = readFileSync(
    resolve(process.cwd(), "components/quiz/QuizGame.tsx"),
    "utf8",
  );
  const player = readFileSync(
    resolve(process.cwd(), "components/activities/StudentActivityPlayer.tsx"),
    "utf8",
  );

  assert(source.includes("function QuizAttempt"), "G: attempt owner extracted");
  assert(source.includes("key={attemptKey}"), "G: remount uses attempt key");
  assert(source.includes("nextQuizAttemptKey"), "G: restart increments key");
  assert(source.includes('initialPhase="intro"'), "G: retry remounts to intro");
  assert(
    !source.includes('initialPhase={attemptKey === 0 ? "intro" : "question"}'),
    "G: retry no longer opens Question 1 in the same click",
  );
  assert(source.includes("เริ่มทำแบบทดสอบ"), "G: intro Start remains");
  assert(
    !source.includes("createAssessmentSession"),
    "G: restart does not create a new session",
  );
  assert(player.includes("session={session}"), "G: player still reuses session");
  assert(!player.includes("key="), "G: player does not remount a new session");
}

export function runQuizAttemptResetVerification(): void {
  verifyRestartAttemptStateIsClean();
  verifyIntroBlocksAnswersUntilStart();
  verifyStartOpensCleanQuestionOne();
  verifyQ1WrongIncrementsIncorrectOnly();
  verifyAttempt2ResultIgnoresAttempt1();
  verifyWeakAndDevelopingRestartSameSession();
  verifyStrongRouteUnchanged();
  verifyHistoryWritesOncePerFinishedAttempt();
  verifyQuizGameRemountsOnRestart();
}
