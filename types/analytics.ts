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

export type AggregatableLearningEvent = LearningEvent & {
  scorePercentage?: number;
  flashEasy?: number;
  flashMedium?: number;
  flashHard?: number;
};
