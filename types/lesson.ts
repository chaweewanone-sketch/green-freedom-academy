export type CompanionMode = "teaching" | "planning";

export type LessonStep = {
  title: string;
  description: string;
  formula: string;
  examples: string[];
  teacherTip?: string;
  estimatedMinutes?: number;
};

export type LessonData = {
  slug: string;
  title: string;
  steps: LessonStep[];
};

export type LessonSummary = Pick<LessonData, "slug" | "title">;
