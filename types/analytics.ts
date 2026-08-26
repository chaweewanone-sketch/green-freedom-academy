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

export type JourneyActionType =
  | "LEARN"
  | "PRACTICE"
  | "PLAY"
  | "REVIEW"
  | "CONTINUE";

export type JourneyAction = {
  label: string;
  href: string;
  actionType: JourneyActionType;
};

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
  nextAction: JourneyAction;
  reasonCode: JourneyReasonCode;
  nextLessonSlug?: string;
  isCurriculumComplete: boolean;
};

export type AggregatableLearningEvent = LearningEvent & {
  scorePercentage?: number;
  flashEasy?: number;
  flashMedium?: number;
  flashHard?: number;
};

export type CurriculumLessonStatus = "ACTIVE" | "COMPLETE" | "LOCKED";

export type CurriculumLessonProgress = {
  lessonSlug: string;
  lessonTitle: string;
  status: CurriculumLessonStatus;
  stage: LearningJourneyStage;
  progressPercent: number;
};

export type CurriculumProgress = {
  lessons: CurriculumLessonProgress[];
  completedLessons: number;
  totalLessons: number;
  overallProgressPercent: number;
  activeLessonSlug?: string;
  isCurriculumComplete: boolean;
};

export type ResumeLearningActionType =
  | "LEARN"
  | "PRACTICE"
  | "PLAY"
  | "REVIEW"
  | "NEXT_LESSON"
  | "SUMMARY";

export type ResumeLearningAction = {
  lessonSlug: string;
  lessonTitle: string;
  label: string;
  href: string;
  actionType: ResumeLearningActionType;
};

export type ResumeLearning = {
  title: string;
  description: string;
  action: ResumeLearningAction;
};

export type StudentLearningHomeActiveLesson = {
  lessonSlug: string;
  lessonTitle: string;
  stage: LearningJourneyStage;
  stageLabel: string;
};

export type StudentLearningHomeCurriculum = {
  completedLessons: number;
  totalLessons: number;
  overallProgressPercent: number;
  isCurriculumComplete: boolean;
};

export type StudentLearningHomeLatestActivity = {
  activity: string;
  lessonSlug: string;
};

export type StudentLearningHomeModel = {
  resumeLearning: ResumeLearning;
  activeLesson: StudentLearningHomeActiveLesson | null;
  curriculumProgress: StudentLearningHomeCurriculum;
  latestActivity?: StudentLearningHomeLatestActivity;
  dashboardHref: string;
  hasHistory: boolean;
};
