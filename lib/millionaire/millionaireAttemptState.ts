import {
  createEmptyStageOutcomes,
  type StageOutcome,
} from "@/lib/millionaire/stageLadder";

export type MillionaireAttemptPhase = "start" | "playing" | "result";

export type MillionaireAttemptSnapshot = {
  phase: MillionaireAttemptPhase;
  currentIndex: number;
  score: number;
  selectedChoiceId: string | null;
  revealed: boolean;
  hasRecordedCompletion: boolean;
  stageOutcomes: StageOutcome[];
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
    stageOutcomes: createEmptyStageOutcomes(),
  };
}

export function nextMillionaireAttemptKey(currentKey: number): number {
  return currentKey + 1;
}
