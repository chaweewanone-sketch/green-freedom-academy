export type {
  AggregatableLearningEvent,
  JourneyAction,
  JourneyActionType,
  JourneyReasonCode,
  LearningEvent,
  LearningJourney,
  LearningJourneyStage,
  LearningRecommendation,
  LearningSummary,
  RecommendationKind,
  RecommendationReasonCode,
} from "@/types/analytics";
export {
  normalizeActivityResult,
  normalizeAssessmentResult,
  normalizeFlashCardResult,
} from "./aggregate";
export {
  DEFAULT_JOURNEY_LESSON_SLUG,
  JOURNEY_ACTION_LABELS,
  JOURNEY_PROGRESS,
  JOURNEY_STAGE_LABELS,
  JOURNEY_THRESHOLDS,
  JOURNEY_TRACK,
  buildLearningJourney,
} from "./journey";
export {
  isLessonComplete,
  resolveActiveLesson,
  type ActiveLessonResolution,
} from "./activeLesson";
export {
  DEFAULT_RECOMMENDATION_LESSON_SLUG,
  RECOMMENDATION_THRESHOLDS,
  buildLearningRecommendation,
} from "./recommendation";
export {
  buildLearningSummary,
  buildLearningSummaryForLesson,
  buildLearningSummaryFromRepository,
} from "./summary";
