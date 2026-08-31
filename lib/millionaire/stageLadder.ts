export const GAME_STAGE_COUNT = 10;

export type StageOutcome = "correct" | "missed";
export type StageVisualStatus = "upcoming" | "current" | "correct" | "missed";

export type ContinueAfterFeedback =
  | { kind: "next"; index: number }
  | { kind: "result" };

export function createEmptyStageOutcomes(): StageOutcome[] {
  return [];
}

export function applyStageAnswer(
  score: number,
  outcomes: readonly StageOutcome[],
  isCorrect: boolean,
): { score: number; outcomes: StageOutcome[] } {
  return {
    score: isCorrect ? score + 1 : score,
    outcomes: [...outcomes, isCorrect ? "correct" : "missed"],
  };
}

export function resolveStageStatuses(
  total: number,
  currentIndex: number,
  outcomes: readonly StageOutcome[],
  revealed: boolean,
): StageVisualStatus[] {
  const count = Math.max(0, total);

  return Array.from({ length: count }, (_, index) => {
    const outcome = outcomes[index];

    if (index < currentIndex) {
      return outcome === "correct" ? "correct" : "missed";
    }

    if (index === currentIndex) {
      if (revealed) {
        return outcome === "correct" ? "correct" : "missed";
      }
      return "current";
    }

    return "upcoming";
  });
}

export function isFinalStage(currentIndex: number, total: number): boolean {
  return total > 0 && currentIndex === total - 1;
}

export function continueAfterFeedback(
  currentIndex: number,
  total: number,
): ContinueAfterFeedback {
  if (currentIndex >= total - 1) {
    return { kind: "result" };
  }

  return { kind: "next", index: currentIndex + 1 };
}
