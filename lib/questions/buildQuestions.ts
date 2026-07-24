import type { LessonData } from "@/types/lesson";
import type { Difficulty, Question, QuestionChoice } from "@/types/question";

const FALLBACK_DISTRACTORS = [
  "Subject + Verb 2",
  "Subject + be + Verb-ing",
  "Subject + will + Verb 1",
];

function getDifficulty(stepIndex: number, totalSteps: number): Difficulty {
  if (stepIndex === 0) return "easy";
  if (stepIndex === totalSteps - 1) return "hard";
  return "medium";
}

function buildDistractors(stepIndex: number, lesson: LessonData, correctText: string) {
  const fromOtherSteps = lesson.steps
    .filter((_, index) => index !== stepIndex)
    .map((step) => step.formula);

  const pool = [...fromOtherSteps, ...FALLBACK_DISTRACTORS];
  const unique = [...new Set(pool.filter((text) => text !== correctText))];

  while (unique.length < 3) {
    unique.push(`Incorrect pattern ${String.fromCharCode(65 + unique.length)}`);
  }

  return unique.slice(0, 3);
}

function rotateChoices<T>(items: T[], offset: number): T[] {
  if (items.length === 0) return items;
  const normalizedOffset = offset % items.length;
  return [...items.slice(normalizedOffset), ...items.slice(0, normalizedOffset)];
}

export function buildQuestionsFromLesson(lesson: LessonData): Question[] {
  const totalSteps = lesson.steps.length;

  return lesson.steps.map((step, stepIndex) => {
    const correctChoiceId = `${lesson.slug}-q${stepIndex}-correct`;
    const correctText = step.formula;
    const distractors = buildDistractors(stepIndex, lesson, correctText);

    const choices: QuestionChoice[] = rotateChoices(
      [
        { id: correctChoiceId, text: correctText },
        ...distractors.map((text, distractorIndex) => ({
          id: `${lesson.slug}-q${stepIndex}-d${distractorIndex}`,
          text,
        })),
      ],
      stepIndex,
    );

    return {
      id: `${lesson.slug}-question-${stepIndex}`,
      prompt: `Which formula matches: ${step.title}?`,
      choices,
      correctChoiceId,
      explanation: step.description,
      difficulty: getDifficulty(stepIndex, totalSteps),
      grammarPoint: step.title,
      tags: ["fallback", "lesson-step"],
    };
  });
}
