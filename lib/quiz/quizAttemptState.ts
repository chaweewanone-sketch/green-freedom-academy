export type QuizAttemptPhase = "intro" | "question" | "result";

export type QuizAttemptSnapshot = {
  phase: QuizAttemptPhase;
  currentIndex: number;
  correctCount: number;
  incorrectCount: number;
  selectedChoiceId: string | null;
  revealed: boolean;
  result: null;
  hasRecordedCompletion: boolean;
};

export function createQuizAttemptSnapshot(
  phase: QuizAttemptPhase = "intro",
): QuizAttemptSnapshot {
  return {
    phase,
    currentIndex: 0,
    correctCount: 0,
    incorrectCount: 0,
    selectedChoiceId: null,
    revealed: false,
    result: null,
    hasRecordedCompletion: false,
  };
}

export function nextQuizAttemptKey(currentKey: number): number {
  return currentKey + 1;
}

export function resolveQuizChoiceScore(
  choiceId: string,
  correctChoiceId: string,
): "correct" | "incorrect" {
  return choiceId === correctChoiceId ? "correct" : "incorrect";
}
