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
  /**
   * Human-controlled curriculum version. Bump only for material scope
   * changes (new/removed required concepts, assessed-scope change,
   * structural expansion). Do not bump for typo, formatting, or
   * equivalent wording/example edits.
   */
  contentVersion: number;
  steps: LessonStep[];
};

export type LessonSummary = Pick<LessonData, "slug" | "title">;
