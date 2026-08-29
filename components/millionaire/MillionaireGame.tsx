"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { ResultPanel } from "./ResultPanel";
import type { ResultNextAction } from "@/lib/analytics/resultNextAction";
import { buildAssessmentResult } from "@/lib/assessment";
import type { AssessmentSession } from "@/lib/assessment";
import type { AssessmentResult } from "@/types/assessment-result";

type MillionaireGameProps = {
  session: AssessmentSession;
  lessonTitle: string;
  lessonPath: string;
  onComplete?: (result: AssessmentResult) => void;
  nextAction?: ResultNextAction;
};

type GamePhase = "start" | "playing" | "result";

export function MillionaireGame({
  session,
  lessonTitle,
  lessonPath,
  onComplete,
  nextAction,
}: MillionaireGameProps) {
  const gameQuestions = session.questions;
  const totalQuestions = gameQuestions.length;
  const hasRecordedCompletionRef = useRef(false);

  const [phase, setPhase] = useState<GamePhase>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const currentQuestion = gameQuestions[currentIndex];

  function startGame() {
    setPhase("playing");
    setCurrentIndex(0);
    setScore(0);
    setSelectedChoiceId(null);
    setRevealed(false);
    hasRecordedCompletionRef.current = false;
  }

  function restartGame() {
    startGame();
  }

  function handleChoice(choiceId: string) {
    if (revealed || !currentQuestion) return;

    const isValidChoice = currentQuestion.choices.some(
      (choice) => choice.id === choiceId,
    );
    if (!isValidChoice) return;

    setSelectedChoiceId(choiceId);
    setRevealed(true);

    const nextScore =
      choiceId === currentQuestion.correctChoiceId ? score + 1 : score;

    window.setTimeout(() => {
      if (currentIndex >= totalQuestions - 1) {
        setScore(nextScore);
        if (!hasRecordedCompletionRef.current) {
          hasRecordedCompletionRef.current = true;
          const incorrect = totalQuestions - nextScore;
          onComplete?.(buildAssessmentResult(session, nextScore, incorrect));
        }
        setPhase("result");
        return;
      }

      setScore(nextScore);
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoiceId(null);
      setRevealed(false);
    }, 700);
  }

  if (phase === "start") {
    return (
      <section className="millionaireGame panel">
        <span className="eyebrow">MILLIONAIRE CHALLENGE</span>
        <h1>Millionaire Challenge</h1>
        <p className="millionaireIntro">
          บทเรียน: <strong>{lessonTitle}</strong>
        </p>
        {totalQuestions > 0 ? (
          <p className="millionaireIntro">
            เล่น {session.selectedCount} คำถามจากคลัง {session.totalAvailable}{" "}
            ข้อ
          </p>
        ) : (
          <p className="millionaireIntro">
            ไม่มีคำถามที่ตรงกับเงื่อนไขสำหรับบทเรียนนี้
          </p>
        )}
        <div className="flashCardActions">
          {totalQuestions > 0 ? (
            <button
              type="button"
              className="button primary"
              onClick={startGame}
            >
              เริ่มเกม
            </button>
          ) : null}
          <Link className="button secondary" href={lessonPath}>
            กลับไปบทเรียน
          </Link>
        </div>
      </section>
    );
  }

  if (phase === "result") {
    return (
      <ResultPanel
        score={score}
        total={totalQuestions}
        lessonPath={lessonPath}
        onRestart={restartGame}
        nextAction={nextAction}
      />
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <section className="millionaireGame">
      <ProgressBar
        current={currentIndex + 1}
        total={totalQuestions}
        score={score}
      />
      <QuestionCard
        question={currentQuestion}
        selectedChoiceId={selectedChoiceId}
        revealed={revealed}
        onChoice={handleChoice}
      />
    </section>
  );
}
