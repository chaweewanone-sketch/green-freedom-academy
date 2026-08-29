export type {
  AggregatableLearningEvent,
  CurriculumLessonProgress,
  CurriculumLessonStatus,
  CurriculumProgress,
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
  ResumeLearning,
  ResumeLearningAction,
  ResumeLearningActionType,
  StudentLearningHomeActiveLesson,
  StudentLearningHomeCurriculum,
  StudentLearningHomeLatestActivity,
  StudentLearningHomeModel,
  LessonEntryAction,
  LessonEntryNoticeKind,
  LessonEntryState,
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
  CURRICULUM_LESSON_STATUS_LABELS,
  buildCurriculumProgress,
} from "./curriculumProgress";
export {
  DEFAULT_RECOMMENDATION_LESSON_SLUG,
  RECOMMENDATION_THRESHOLDS,
  buildLearningRecommendation,
} from "./recommendation";
export {
  resolveForwardResultNextAction,
  toForwardResultNextAction,
  type ResultNextAction,
  type ResolveForwardResultNextActionInput,
} from "./resultNextAction";
export {
  buildResumeLearning,
  isKnownResumeHref,
} from "./resumeLearning";
export { buildStudentLearningHome } from "./studentHome";
export { buildLessonEntry } from "./lessonEntry";
export {
  buildLearningSummary,
  buildLearningSummaryForLesson,
  buildLearningSummaryFromRepository,
} from "./summary";
