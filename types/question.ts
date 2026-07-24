export type Difficulty = "easy" | "medium" | "hard";

export interface QuestionChoice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  prompt: string;
  choices: QuestionChoice[];
  correctChoiceId: string;
  explanation: string;
  difficulty: Difficulty;
  grammarPoint: string;
  tags: string[];
}
