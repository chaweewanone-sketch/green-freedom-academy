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
  if (snapshot.revealed) {
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
  const restart = createQuizAttemptSnapshot("question");
  assert(restart.phase === "question", "A: phase is question");
  assert(restart.currentIndex === 0, "A: index 0");
  assert(restart.correctCount === 0, "A: correct 0");
  assert(restart.incorrectCount === 0, "A: incorrect 0");
  assert(restart.selectedChoiceId === null, "A: selected null");
  assert(restart.revealed === false, "A: revealed false");
  assert(restart.result === null, "A: result null");
  assert(restart.hasRecordedCompletion === false, "A: completion flag false");
  assert(nextQuizAttemptKey(0) === 1, "A: restart increments attempt key");
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

  assert(afterWrong.correctCount === 0, "B: correct stays 0");
  assert(afterWrong.incorrectCount === 1, "B: incorrect is 1");
  assert(afterWrong.revealed === true, "B: revealed after intentional answer");
  assert(afterWrong.selectedChoiceId !== question.correctChoiceId, "B: wrong pick");
}

export function verifyAttempt2ResultIgnoresAttempt1(): void {
  const session = frozenQuizSession();
  const attempt1 = buildAssessmentResult(session, 8, 2);
  const restart = createQuizAttemptSnapshot("question");

  assert(attempt1.score === 8, "C: attempt 1 is 8/10");
  assert(attempt1.percentage === 80, "C: attempt 1 is 80%");
  assert(restart.result === null, "C: remounted attempt has no result");
  assert(restart.correctCount === 0, "C: remounted counts start at 0");
  assert(restart.incorrectCount === 0, "C: remounted incorrect starts at 0");

  const attempt2 = buildAssessmentResult(session, 3, 7);
  assert(attempt2.sessionId === session.sessionId, "C: same session identity");
  assert(attempt2.score === 3, "C: attempt 2 uses attempt 2 counts");
  assert(attempt2.score !== attempt1.score, "C: attempt 2 is not stale 8/10");
  assert(attempt2.percentage !== attempt1.percentage, "C: percentage is attempt 2");
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
  assert(first !== null, "F: attempt 1 writes");
  assert(repository.getAll().length === 1, "F: one event after attempt 1");

  const restart = createQuizAttemptSnapshot("question");
  assert(restart.hasRecordedCompletion === false, "F: restart writes nothing");
  assert(repository.getAll().length === 1, "F: restart does not append");

  const second = recordActivityCompletion({
    result: quizResultFromCounts(session, 3, 7, 1_700_040_000_500),
    lessonSlug: session.lessonSlug,
    repository,
  });
  assert(second !== null, "F: attempt 2 writes");
  assert(repository.getAll().length === 2, "F: one additional event");
  assert(
    repository.getAll()[0]?.sessionId === repository.getAll()[1]?.sessionId,
    "F: same sessionId is reused",
  );
  assert(
    repository.getAll()[0]?.completedAt !== repository.getAll()[1]?.completedAt,
    "F: not a stale duplicate timestamp",
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
  assert(
    source.includes('initialPhase={attemptKey === 0 ? "intro" : "question"}'),
    "G: remount starts at question 1",
  );
  assert(
    source.includes("choiceInputArmed"),
    "G: remounted choices wait for the restart click to finish",
  );
  assert(
    !source.includes("createAssessmentSession"),
    "G: restart does not create a new session",
  );
  assert(player.includes("session={session}"), "G: player still reuses session");
  assert(!player.includes("key="), "G: player does not remount a new session");
}

export function runQuizAttemptResetVerification(): void {
  verifyRestartAttemptStateIsClean();
  verifyQ1WrongIncrementsIncorrectOnly();
  verifyAttempt2ResultIgnoresAttempt1();
  verifyWeakAndDevelopingRestartSameSession();
  verifyStrongRouteUnchanged();
  verifyHistoryWritesOncePerFinishedAttempt();
  verifyQuizGameRemountsOnRestart();
}
