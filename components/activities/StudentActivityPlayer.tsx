"use client";

import { useCallback } from "react";
import { FlashCardsGame } from "@/components/flash-cards";
import { MillionaireGame } from "@/components/millionaire";
import { QuizGame } from "@/components/quiz";
import { recordActivityCompletion } from "@/lib/history";
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
  const handleComplete = useCallback(
    (result: AssessmentResult | FlashCardResult) => {
      recordActivityCompletion({
        result,
        lessonSlug: session.lessonSlug,
      });
    },
    [session.lessonSlug],
  );

  if (session.activity === "millionaire") {
    return (
      <MillionaireGame
        session={session}
        lessonTitle={lessonTitle}
        lessonPath={lessonPath}
        onComplete={handleComplete}
      />
    );
  }

  if (session.activity === "quiz") {
    return <QuizGame session={session} onComplete={handleComplete} />;
  }

  if (session.activity === "flash-cards") {
    return <FlashCardsGame session={session} onComplete={handleComplete} />;
  }

  return null;
}
