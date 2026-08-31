"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { ResultPanel } from "./ResultPanel";
import type { ResultNextAction } from "@/lib/analytics/resultNextAction";
import { buildAssessmentResult } from "@/lib/assessment";
import {
  createMillionaireAttemptSnapshot,
  nextMillionaireAttemptKey,
} from "@/lib/millionaire/millionaireAttemptState";
import type { AssessmentSession } from "@/lib/assessment";
import type { AssessmentResult } from "@/types/assessment-result";

type MillionaireGameProps = {
  session: AssessmentSession;
  lessonTitle: string;
  lessonPath: string;
  onComplete?: (result: AssessmentResult) => void;
  nextAction?: ResultNextAction;
  onRestartAttempt?: () => void;
};

type MillionaireAttemptProps = {
  session: AssessmentSession;
  lessonTitle: string;
  lessonPath: string;
  onComplete?: (result: AssessmentResult) => void;
  nextAction?: ResultNextAction;
  onRequestRestart: () => void;
};

type GamePhase = "start" | "playing" | "result";

function MillionaireAttempt({
  session,
  lessonTitle,
  lessonPath,
  onComplete,
  nextAction,
  onRequestRestart,
}: MillionaireAttemptProps) {
  const gameQuestions = session.questions;
  const totalQuestions = gameQuestions.length;
  const initial = createMillionaireAttemptSnapshot("start");
  const hasRecordedCompletionRef = useRef(initial.hasRecordedCompletion);

  const [phase, setPhase] = useState<GamePhase>(initial.phase);
  const [currentIndex, setCurrentIndex] = useState(initial.currentIndex);
  const [score, setScore] = useState(initial.score);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
    initial.selectedChoiceId,
  );
  const [revealed, setRevealed] = useState(initial.revealed);

  const currentQuestion = gameQuestions[currentIndex];

  function startGame() {
    const started = createMillionaireAttemptSnapshot("playing");
    setPhase(started.phase);
    setCurrentIndex(started.currentIndex);
    setScore(started.score);
    setSelectedChoiceId(started.selectedChoiceId);
    setRevealed(started.revealed);
    hasRecordedCompletionRef.current = started.hasRecordedCompletion;
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
        onRestart={onRequestRestart}
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

export function MillionaireGame({
  session,
  lessonTitle,
  lessonPath,
  onComplete,
  nextAction,
  onRestartAttempt,
}: MillionaireGameProps) {
  const [attemptKey, setAttemptKey] = useState(0);

  return (
    <MillionaireAttempt
      key={attemptKey}
      session={session}
      lessonTitle={lessonTitle}
      lessonPath={lessonPath}
      onComplete={onComplete}
      nextAction={nextAction}
      onRequestRestart={() => {
        onRestartAttempt?.();
        setAttemptKey((current) => nextMillionaireAttemptKey(current));
      }}
    />
  );
}
