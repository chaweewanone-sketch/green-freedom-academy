import type {
  AggregatableLearningEvent,
  LearningSummary,
} from "@/types/analytics";

function averageScore(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
}

function findLatestEvent(
  events: AggregatableLearningEvent[],
): AggregatableLearningEvent | undefined {
  if (events.length === 0) {
    return undefined;
  }

  return events.reduce((latest, event) =>
    event.completedAt >= latest.completedAt ? event : latest,
  );
}

export function buildLearningSummary(
  events: AggregatableLearningEvent[],
): LearningSummary {
  const quizEvents = events.filter((event) => event.activity === "quiz");
  const millionaireEvents = events.filter(
    (event) => event.activity === "millionaire",
  );
  const flashCardEvents = events.filter(
    (event) => event.activity === "flash-cards",
  );

  const quizScores = quizEvents
    .map((event) => event.scorePercentage)
    .filter((score): score is number => score !== undefined);

  const millionaireScores = millionaireEvents
    .map((event) => event.scorePercentage)
    .filter((score): score is number => score !== undefined);

  const latestEvent = findLatestEvent(events);

  return {
    totalActivities: events.length,
    quizAttempts: quizEvents.length,
    millionaireAttempts: millionaireEvents.length,
    flashCardAttempts: flashCardEvents.length,
    averageQuizScore: averageScore(quizScores),
    averageMillionaireScore: averageScore(millionaireScores),
    flashEasy: events.reduce((sum, event) => sum + (event.flashEasy ?? 0), 0),
    flashMedium: events.reduce(
      (sum, event) => sum + (event.flashMedium ?? 0),
      0,
    ),
    flashHard: events.reduce((sum, event) => sum + (event.flashHard ?? 0), 0),
    latestActivity: latestEvent?.activity,
    latestLesson: latestEvent?.lessonSlug,
  };
}
