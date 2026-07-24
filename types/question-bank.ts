import type { Question } from "@/types/question";

export interface QuestionBank {
  lessonSlug: string;
  questions: Question[];
}
