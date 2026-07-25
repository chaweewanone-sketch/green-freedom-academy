import type { Question, Difficulty } from "@/types/question";

export type AssessmentActivity =
  | "millionaire"
  | "quiz"
  | "flash-cards"
  | "matching"
  | "final-test";

export interface AssessmentOptions {
  questionCount?: number;
  difficulties?: Difficulty[];
  tags?: string[];
  grammarPoints?: string[];
  randomize?: boolean;
}

export interface AssessmentSession {
  lessonSlug: string;
  activity: AssessmentActivity;
  questions: Question[];
  totalAvailable: number;
  selectedCount: number;
  createdAt: number;
  sessionId: string;
}
