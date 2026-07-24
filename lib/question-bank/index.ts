import { pastSimpleQuestionBank } from "./past-simple";
import { presentSimpleQuestionBank } from "./present-simple";
import type { QuestionBank } from "@/types/question-bank";

const QUESTION_BANKS: Record<string, QuestionBank> = {
  [presentSimpleQuestionBank.lessonSlug]: presentSimpleQuestionBank,
  [pastSimpleQuestionBank.lessonSlug]: pastSimpleQuestionBank,
};

export function getQuestionBank(lessonSlug: string): QuestionBank | null {
  return QUESTION_BANKS[lessonSlug] ?? null;
}

export function getQuestionBankSize(lessonSlug: string): number {
  return getQuestionBank(lessonSlug)?.questions.length ?? 0;
}

export type { QuestionBank } from "@/types/question-bank";
