import type { Difficulty, Question, QuestionChoice } from "@/types/question";

type QuestionInput = {
  prompt: string;
  correct: string;
  distractors: string[];
  explanation: string;
  difficulty: Difficulty;
  grammarPoint: string;
  tags: string[];
};

export function createBankQuestion(
  lessonSlug: string,
  index: number,
  input: QuestionInput,
): Question {
  const correctChoiceId = `${lessonSlug}-bank-q${index}-correct`;
  const choices: QuestionChoice[] = [
    { id: correctChoiceId, text: input.correct },
    ...input.distractors.map((text, distractorIndex) => ({
      id: `${lessonSlug}-bank-q${index}-d${distractorIndex}`,
      text,
    })),
  ];

  return {
    id: `${lessonSlug}-bank-question-${index}`,
    prompt: input.prompt,
    choices,
    correctChoiceId,
    explanation: input.explanation,
    difficulty: input.difficulty,
    grammarPoint: input.grammarPoint,
    tags: input.tags,
  };
}

export function createBankQuestions(
  lessonSlug: string,
  inputs: QuestionInput[],
): Question[] {
  return inputs.map((input, index) => createBankQuestion(lessonSlug, index, input));
}
