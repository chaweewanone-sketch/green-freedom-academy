import type { AssessmentSession } from "@/types/assessment";
import type { AssessmentResult } from "@/types/assessment-result";

export function buildAssessmentResult(
  session: AssessmentSession,
  correct: number,
  incorrect: number,
): AssessmentResult {
  const total = correct + incorrect;

  return {
    sessionId: session.sessionId,
    activity: session.activity,
    score: correct,
    correct,
    incorrect,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    completedAt: Date.now(),
  };
}
