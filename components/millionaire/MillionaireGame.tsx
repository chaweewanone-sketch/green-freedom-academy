"use client";

import { useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { ResultPanel } from "./ResultPanel";
import type { Question } from "@/types/question";

type MillionaireGameProps = {
  questions: Question[];
  lessonTitle: string;
  lessonPath: string;
};

type GamePhase = "start" | "playing" | "result";

export function MillionaireGame({
  questions,
  lessonTitle,
  lessonPath,
}: MillionaireGameProps) {
  const totalQuestions = questions.length;

  const [phase, setPhase] = useState<GamePhase>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const currentQuestion = questions[currentIndex];

  function startGame() {
    setPhase("playing");
    setCurrentIndex(0);
    setScore(0);
    setSelectedChoiceId(null);
    setRevealed(false);
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
        <p className="millionaireIntro">
          ทบทวน {totalQuestions} ขั้นตอนด้วยคำถามแบบเลือกตอบ
        </p>
        <button type="button" className="button primary" onClick={startGame}>
          เริ่มเกม
        </button>
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
