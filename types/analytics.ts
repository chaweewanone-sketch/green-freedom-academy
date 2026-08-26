export interface LearningEvent {
  sessionId: string;
  activity: string;
  lessonSlug: string;
  completedAt: number;
}

export interface LearningSummary {
  totalActivities: number;
  quizAttempts: number;
  millionaireAttempts: number;
  flashCardAttempts: number;
  averageQuizScore: number;
  averageMillionaireScore: number;
  flashEasy: number;
  flashMedium: number;
  flashHard: number;
  latestActivity?: string;
  latestLesson?: string;
}

export type RecommendationKind =
  | "START"
  | "REVIEW"
  | "PRACTICE"
  | "RETRY"
  | "PLAY"
  | "CONTINUE";

export type RecommendationReasonCode =
  | "EMPTY_HISTORY"
  | "QUIZ_WEAK"
  | "QUIZ_DEVELOPING"
  | "QUIZ_STRONG"
  | "MILLIONAIRE_WEAK"
  | "MILLIONAIRE_DEVELOPING"
  | "MILLIONAIRE_STRONG"
  | "FLASH_WEAK"
  | "FLASH_STRONG"
  | "FALLBACK_START";

export type LearningRecommendation = {
  kind: RecommendationKind;
  title: string;
  message: string;
  lessonSlug: string;
  activity?: string;
  href: string;
  ctaLabel: string;
  reasonCode: RecommendationReasonCode;
};

export type LearningJourneyStage =
  | "LEARN"
  | "PRACTICE"
  | "PLAY"
  | "REVIEW"
  | "COMPLETE";

export type JourneyReasonCode =
  | "EMPTY_HISTORY"
  | "QUIZ_WEAK"
  | "QUIZ_DEVELOPING"
  | "QUIZ_STRONG"
  | "MILLIONAIRE_WEAK"
  | "MILLIONAIRE_DEVELOPING"
  | "MILLIONAIRE_STRONG"
  | "FLASH_WEAK_OVERRIDE"
  | "FALLBACK_LEARN";

export type LearningJourney = {
  lessonSlug: string;
  stage: LearningJourneyStage;
  title: string;
  message: string;
  progressPercent: number;
  nextHref?: string;
  ctaLabel?: string;
  reasonCode: JourneyReasonCode;
};

export type AggregatableLearningEvent = LearningEvent & {
  scorePercentage?: number;
  flashEasy?: number;
  flashMedium?: number;
  flashHard?: number;
};
