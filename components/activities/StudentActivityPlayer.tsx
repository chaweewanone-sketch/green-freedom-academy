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
  session: AssessmentSession;
  lesson: LessonData;
  lessonTitle: string;
  lessonPath: string;
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

  const handleComplete = useCallback(
    (result: AssessmentResult | FlashCardResult) => {
      recordActivityCompletion({
        result,
        lessonSlug: liveSession.lessonSlug,
      });

      if (liveSession.activity === "flash-cards") {
        setResultNextAction(null);
        return;
      }

      const { summary, events } = loadDashboardLearningState();
      setResultNextAction(
        resolveForwardResultNextAction({
          currentActivity: liveSession.activity,
          currentLessonSlug: liveSession.lessonSlug,
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
    [liveSession.activity, liveSession.lessonSlug],
  );

  const handleRestartAttempt = useCallback(() => {
    setResultNextAction(null);

    if (
      liveSession.activity !== "quiz" &&
      liveSession.activity !== "millionaire"
    ) {
      return;
    }

    setLiveSession(createAssessmentSession(lesson, liveSession.activity));
  }, [lesson, liveSession.activity]);

  if (liveSession.activity === "millionaire") {
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

  if (liveSession.activity === "quiz") {
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

  if (liveSession.activity === "flash-cards") {
    return <FlashCardsGame session={liveSession} onComplete={handleComplete} />;
  }

  return null;
}
