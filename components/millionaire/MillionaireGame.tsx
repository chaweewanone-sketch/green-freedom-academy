"use client";

import { useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { ResultPanel } from "./ResultPanel";
import { selectRandomQuestions } from "@/lib/questions";
import type { Question } from "@/types/question";

const DEFAULT_GAME_QUESTION_COUNT = 10;

type MillionaireGameProps = {
  questionBank: Question[];
  lessonTitle: string;
  lessonPath: string;
  gameQuestionCount?: number;
};

type GamePhase = "start" | "playing" | "result";

export function MillionaireGame({
  questionBank,
  lessonTitle,
  lessonPath,
  gameQuestionCount = DEFAULT_GAME_QUESTION_COUNT,
}: MillionaireGameProps) {
  const [phase, setPhase] = useState<GamePhase>("start");
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const totalQuestions = gameQuestions.length;
  const currentQuestion = gameQuestions[currentIndex];
  const roundCount = Math.min(gameQuestionCount, questionBank.length);

  function startGame() {
    setGameQuestions(
      selectRandomQuestions(questionBank, Math.min(gameQuestionCount, questionBank.length)),
    );
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
          เล่น {roundCount} คำถามจากคลัง {questionBank.length} ข้อ
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
