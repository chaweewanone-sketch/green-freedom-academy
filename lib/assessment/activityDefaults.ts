import type { AssessmentActivity, AssessmentOptions } from "@/types/assessment";

type ActivityDefaults = {
  questionCount: number;
  randomize: boolean;
};

export const ACTIVITY_DEFAULTS: Record<AssessmentActivity, ActivityDefaults> = {
  millionaire: { questionCount: 10, randomize: true },
  quiz: { questionCount: 20, randomize: true },
  "flash-cards": { questionCount: 20, randomize: true },
  matching: { questionCount: 8, randomize: true },
  "final-test": { questionCount: 40, randomize: true },
};

export type ResolvedAssessmentOptions = {
  questionCount: number;
  randomize: boolean;
  difficulties?: AssessmentOptions["difficulties"];
  tags?: string[];
  grammarPoints?: string[];
};

export function resolveAssessmentOptions(
  activity: AssessmentActivity,
  options?: AssessmentOptions,
): ResolvedAssessmentOptions {
  const defaults = ACTIVITY_DEFAULTS[activity];

  return {
    questionCount: options?.questionCount ?? defaults.questionCount,
    randomize: options?.randomize ?? defaults.randomize,
    difficulties:
      options?.difficulties && options.difficulties.length > 0
        ? options.difficulties
        : undefined,
    tags: options?.tags && options.tags.length > 0 ? options.tags : undefined,
    grammarPoints:
      options?.grammarPoints && options.grammarPoints.length > 0
        ? options.grammarPoints
        : undefined,
  };
}
