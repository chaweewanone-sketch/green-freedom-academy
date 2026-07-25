export type {
  AggregatableLearningEvent,
  LearningEvent,
  LearningSummary,
} from "@/types/analytics";
export {
  normalizeActivityResult,
  normalizeAssessmentResult,
  normalizeFlashCardResult,
} from "./aggregate";
export { buildLearningSummary, buildLearningSummaryFromRepository } from "./summary";
