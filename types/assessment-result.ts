import type { AssessmentActivity } from "@/types/assessment";

export interface AssessmentResult {
  sessionId: string;
  activity: AssessmentActivity;
  score: number;
  correct: number;
  incorrect: number;
  percentage: number;
  completedAt: number;
}
