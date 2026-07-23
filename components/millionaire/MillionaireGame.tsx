"use client";

import { useMemo, useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { ResultPanel } from "./ResultPanel";
import { buildChallengesFromLesson } from "@/lib/millionaire/buildChallenges";
import type { LessonData } from "@/types/lesson";

type MillionaireGameProps = {
  lesson: LessonData;
};

type GamePhase = "start" | "playing" | "result";

export function MillionaireGame({ lesson }: MillionaireGameProps) {
  const challenges = useMemo(
    () => buildChallengesFromLesson(lesson),
    [lesson],
  );
  const totalQuestions = challenges.length;
  const lessonPath = `/lesson/${lesson.slug}`;

  const [phase, setPhase] = useState<GamePhase>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const currentChallenge = challenges[currentIndex];

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
    if (revealed || !currentChallenge) return;

    const choice = currentChallenge.choices.find((item) => item.id === choiceId);
    if (!choice) return;

    setSelectedChoiceId(choiceId);
    setRevealed(true);

    const nextScore = choice.isCorrect ? score + 1 : score;

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
          บทเรียน: <strong>{lesson.title}</strong>
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

  if (!currentChallenge) {
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
        title={currentChallenge.title}
        description={currentChallenge.description}
        choices={currentChallenge.choices}
        selectedChoiceId={selectedChoiceId}
        revealed={revealed}
        onChoice={handleChoice}
      />
    </section>
  );
}
