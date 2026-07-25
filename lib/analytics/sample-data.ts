import type { LearningSummary } from "@/types/analytics";
import type { LearningHistoryRepository } from "@/types/history";
import type { AssessmentResult } from "@/types/assessment-result";
import type { FlashCardResult } from "@/types/recall";
import {
  normalizeAssessmentResult,
  normalizeFlashCardResult,
} from "./aggregate";
import { buildLearningSummary } from "./summary";

export const sampleAssessmentResults: AssessmentResult[] = [
  {
    sessionId: "assessment_sample_quiz_1",
    activity: "quiz",
    score: 16,
    correct: 16,
    incorrect: 4,
    percentage: 80,
    completedAt: 1_700_000_000_000,
  },
  {
    sessionId: "assessment_sample_quiz_2",
    activity: "quiz",
    score: 18,
    correct: 18,
    incorrect: 2,
    percentage: 90,
    completedAt: 1_700_000_100_000,
  },
  {
    sessionId: "assessment_sample_millionaire_1",
    activity: "millionaire",
    score: 8,
    correct: 8,
    incorrect: 2,
    percentage: 80,
    completedAt: 1_700_000_050_000,
  },
];

export const sampleFlashCardResults: FlashCardResult[] = [
  {
    sessionId: "assessment_sample_flash_1",
    activity: "flash-cards",
    totalCards: 20,
    reviewedCards: 20,
    easy: 12,
    medium: 5,
    hard: 3,
    reviews: [],
    completedAt: 1_700_000_200_000,
  },
  {
    sessionId: "assessment_sample_flash_2",
    activity: "flash-cards",
    totalCards: 10,
    reviewedCards: 10,
    easy: 4,
    medium: 4,
    hard: 2,
    reviews: [],
    completedAt: 1_700_000_300_000,
  },
];

export const sampleLessonSlugs = {
  quiz1: "present-simple",
  quiz2: "past-simple",
  millionaire1: "present-simple",
  flash1: "present-simple",
  flash2: "past-simple",
} as const;

export function buildSampleLearningEvents() {
  return [
    normalizeAssessmentResult(
      sampleAssessmentResults[0],
      sampleLessonSlugs.quiz1,
    ),
    normalizeAssessmentResult(
      sampleAssessmentResults[1],
      sampleLessonSlugs.quiz2,
    ),
    normalizeAssessmentResult(
      sampleAssessmentResults[2],
      sampleLessonSlugs.millionaire1,
    ),
    normalizeFlashCardResult(
      sampleFlashCardResults[0],
      sampleLessonSlugs.flash1,
    ),
    normalizeFlashCardResult(
      sampleFlashCardResults[1],
      sampleLessonSlugs.flash2,
    ),
  ];
}

export function buildSampleLearningSummary(): LearningSummary {
  return buildLearningSummary(buildSampleLearningEvents());
}

export function populateSampleHistory(
  repository: LearningHistoryRepository,
): void {
  for (const event of buildSampleLearningEvents()) {
    repository.save(event);
  }
}
