export type MillionaireAttemptPhase = "start" | "playing" | "result";

export type MillionaireAttemptSnapshot = {
  phase: MillionaireAttemptPhase;
  currentIndex: number;
  score: number;
  selectedChoiceId: string | null;
  revealed: boolean;
  hasRecordedCompletion: boolean;
};

export function createMillionaireAttemptSnapshot(
  phase: MillionaireAttemptPhase = "start",
): MillionaireAttemptSnapshot {
  return {
    phase,
    currentIndex: 0,
    score: 0,
    selectedChoiceId: null,
    revealed: false,
    hasRecordedCompletion: false,
  };
}

export function nextMillionaireAttemptKey(currentKey: number): number {
  return currentKey + 1;
}
