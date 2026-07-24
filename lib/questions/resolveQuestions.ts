import { getQuestionBank } from "@/lib/question-bank";
import type { LessonData } from "@/types/lesson";
import type { Question } from "@/types/question";
import { buildQuestionsFromLesson } from "./buildQuestions";

export function resolveQuestionsForLesson(lesson: LessonData): Question[] {
  const bank = getQuestionBank(lesson.slug);

  if (bank) {
    return bank.questions;
  }

  return buildQuestionsFromLesson(lesson);
}
