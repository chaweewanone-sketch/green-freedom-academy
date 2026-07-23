import type { LessonData } from "@/types/lesson";

export type MillionaireChoice = {
  id: string;
  label: string;
  isCorrect: boolean;
};

export type MillionaireChallenge = {
  stepIndex: number;
  title: string;
  description: string;
  choices: MillionaireChoice[];
};

export function buildChallengesFromLesson(
  lesson: LessonData,
): MillionaireChallenge[] {
  return lesson.steps.map((step, index) => ({
    stepIndex: index,
    title: step.title,
    description: step.description,
    choices: [
      { id: `${index}-correct`, label: "Continue", isCorrect: true },
      { id: `${index}-incorrect-a`, label: "Incorrect A", isCorrect: false },
      { id: `${index}-incorrect-b`, label: "Incorrect B", isCorrect: false },
      { id: `${index}-incorrect-c`, label: "Incorrect C", isCorrect: false },
    ],
  }));
}
