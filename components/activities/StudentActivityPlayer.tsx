"use client";

import { useCallback, useState } from "react";
import { FlashCardsGame } from "@/components/flash-cards";
import { MillionaireGame } from "@/components/millionaire";
import { QuizGame } from "@/components/quiz";
import {
  resolveForwardResultNextAction,
  type ResultNextAction,
} from "@/lib/analytics/resultNextAction";
import { loadDashboardLearningState, recordActivityCompletion } from "@/lib/history";
import type { AssessmentSession } from "@/lib/assessment";
import type { AssessmentResult } from "@/types/assessment-result";
import type { FlashCardResult } from "@/types/recall";

type StudentActivityPlayerProps = {
  session: AssessmentSession;
  lessonTitle: string;
  lessonPath: string;
};

export function StudentActivityPlayer({
  session,
  lessonTitle,
  lessonPath,
}: StudentActivityPlayerProps) {
  const [resultNextAction, setResultNextAction] =
    useState<ResultNextAction | null>(null);

  const handleComplete = useCallback(
    (result: AssessmentResult | FlashCardResult) => {
      recordActivityCompletion({
        result,
        lessonSlug: session.lessonSlug,
      });

      if (session.activity === "flash-cards") {
        setResultNextAction(null);
        return;
      }

      const { summary, events } = loadDashboardLearningState();
      setResultNextAction(
        resolveForwardResultNextAction({
          currentActivity: session.activity,
          currentLessonSlug: session.lessonSlug,
          summary,
          events,
          currentResult:
            result.activity === "quiz"
              ? {
                  activity: result.activity,
                  percentage: result.percentage,
                }
              : undefined,
        }),
      );
    },
    [session.activity, session.lessonSlug],
  );

  const handleQuizRestart = useCallback(() => {
    setResultNextAction(null);
  }, []);

  if (session.activity === "millionaire") {
    return (
      <MillionaireGame
        session={session}
        lessonTitle={lessonTitle}
        lessonPath={lessonPath}
        onComplete={handleComplete}
        nextAction={resultNextAction ?? undefined}
      />
    );
  }

  if (session.activity === "quiz") {
    return (
      <QuizGame
        session={session}
        onComplete={handleComplete}
        nextAction={resultNextAction ?? undefined}
        onRestartAttempt={handleQuizRestart}
      />
    );
  }

  if (session.activity === "flash-cards") {
    return <FlashCardsGame session={session} onComplete={handleComplete} />;
  }

  return null;
}
