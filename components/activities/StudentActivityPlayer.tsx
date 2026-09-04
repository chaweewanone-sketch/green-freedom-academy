"use client";

import { useCallback, useState } from "react";
import { FlashCardsGame } from "@/components/flash-cards";
import { MillionaireGame } from "@/components/millionaire";
import { QuizGame } from "@/components/quiz";
import {
  resolveForwardResultNextAction,
  type ResultNextAction,
} from "@/lib/analytics/resultNextAction";
import {
  createAssessmentSession,
  type AssessmentSession,
} from "@/lib/assessment";
import { loadDashboardLearningState, recordActivityCompletion } from "@/lib/history";
import type { AssessmentResult } from "@/types/assessment-result";
import type { LessonData } from "@/types/lesson";
import type { FlashCardResult } from "@/types/recall";

type StudentActivityPlayerProps = {
  lesson: LessonData;
  lessonTitle: string;
  lessonPath: string;
  session?: AssessmentSession;
};

export function StudentActivityPlayer({
  session,
  lesson,
  lessonTitle,
  lessonPath,
}: StudentActivityPlayerProps) {
  const [liveSession, setLiveSession] = useState(session);
  const [resultNextAction, setResultNextAction] =
    useState<ResultNextAction | null>(null);
  const activity = liveSession?.activity ?? "flash-cards";

  const handleComplete = useCallback(
    (result: AssessmentResult | FlashCardResult) => {
      recordActivityCompletion({
        result,
        lessonSlug: lesson.slug,
      });

      if (activity === "flash-cards") {
        setResultNextAction(null);
        return;
      }

      const { summary, events } = loadDashboardLearningState();
      setResultNextAction(
        resolveForwardResultNextAction({
          currentActivity: activity,
          currentLessonSlug: lesson.slug,
          summary,
          events,
          currentResult:
            result.activity === "quiz" || result.activity === "millionaire"
              ? {
                  activity: result.activity,
                  percentage: result.percentage,
                }
              : undefined,
        }),
      );
    },
    [activity, lesson.slug],
  );

  const handleRestartAttempt = useCallback(() => {
    setResultNextAction(null);

    if (activity !== "quiz" && activity !== "millionaire") {
      return;
    }

    setLiveSession(createAssessmentSession(lesson, activity));
  }, [activity, lesson]);

  if (liveSession?.activity === "millionaire") {
    return (
      <MillionaireGame
        key={liveSession.sessionId}
        session={liveSession}
        lessonTitle={lessonTitle}
        lessonPath={lessonPath}
        onComplete={handleComplete}
        nextAction={resultNextAction ?? undefined}
        onRestartAttempt={handleRestartAttempt}
      />
    );
  }

  if (liveSession?.activity === "quiz") {
    return (
      <QuizGame
        key={liveSession.sessionId}
        session={liveSession}
        onComplete={handleComplete}
        nextAction={resultNextAction ?? undefined}
        onRestartAttempt={handleRestartAttempt}
      />
    );
  }

  return (
    <FlashCardsGame
      lessonSlug={lesson.slug}
      lessonTitle={lessonTitle}
      lessonPath={lessonPath}
      onComplete={handleComplete}
    />
  );
}
