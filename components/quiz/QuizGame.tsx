"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChoiceButton } from "@/components/millionaire/ChoiceButton";
import { buildAssessmentResult } from "@/lib/assessment";
import type { AssessmentSession } from "@/lib/assessment";
import type { AssessmentResult } from "@/types/assessment-result";

type QuizGameProps = {
  session: AssessmentSession;
  onComplete?: (result: AssessmentResult) => void;
};

type QuizPhase = "intro" | "question" | "result";

const difficultyLabels = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
} as const;

function formatLessonSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function QuizGame({ session, onComplete }: QuizGameProps) {
  const questions = session.questions;
  const totalQuestions = questions.length;
  const lessonTitle = formatLessonSlug(session.lessonSlug);
  const lessonPath = `/lesson/${session.lessonSlug}`;
  const hasRecordedCompletionRef = useRef(false);

  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const currentQuestion = questions[currentIndex];
  const progressPercent =
    totalQuestions > 0
      ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
      : 0;

  function startQuiz() {
    if (totalQuestions === 0) {
      return;
    }

    setPhase("question");
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSelectedChoiceId(null);
    setRevealed(false);
    setResult(null);
    hasRecordedCompletionRef.current = false;
  }

  function restartQuiz() {
    startQuiz();
  }

  function handleChoice(choiceId: string) {
    if (revealed || !currentQuestion) return;

    const isValidChoice = currentQuestion.choices.some(
      (choice) => choice.id === choiceId,
    );
    if (!isValidChoice) return;

    const isCorrect = choiceId === currentQuestion.correctChoiceId;

    setSelectedChoiceId(choiceId);
    setRevealed(true);

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }
  }

  function handleNext() {
    if (!revealed || !currentQuestion) return;

    if (currentIndex >= totalQuestions - 1) {
      if (hasRecordedCompletionRef.current) {
        return;
      }

      hasRecordedCompletionRef.current = true;
      const nextResult = buildAssessmentResult(
        session,
        correctCount,
        incorrectCount,
      );
      setResult(nextResult);
      setPhase("result");
      onComplete?.(nextResult);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedChoiceId(null);
    setRevealed(false);
  }

  if (phase === "intro") {
    return (
      <section className="millionaireGame panel">
        <span className="eyebrow">QUIZ</span>
        <h1>Quiz</h1>
        <p className="millionaireIntro">
          บทเรียน: <strong>{lessonTitle}</strong>
        </p>
        {totalQuestions > 0 ? (
          <p className="millionaireIntro">
            ทำแบบทดสอบ {session.selectedCount} ข้อ
          </p>
        ) : (
          <p className="millionaireIntro">
            ไม่มีคำถามที่ตรงกับเงื่อนไขสำหรับบทเรียนนี้
          </p>
        )}
        {totalQuestions > 0 ? (
          <button
            type="button"
            className="button primary"
            onClick={startQuiz}
          >
            เริ่มทำแบบทดสอบ
          </button>
        ) : (
          <Link className="button secondary" href={lessonPath}>
            กลับไปบทเรียน
          </Link>
        )}
      </section>
    );
  }

  if (phase === "result" && result) {
    return (
      <section className="millionaireResult panel">
        <span className="eyebrow">RESULT</span>
        <h2>ผลการทำแบบทดสอบ</h2>
        <p className="millionaireResultScore">
          คะแนน <strong>{result.score}</strong> / {totalQuestions}
        </p>
        <dl className="activityPlaceholderMeta quizResultMeta">
          <div>
            <dt>ถูก</dt>
            <dd>{result.correct}</dd>
          </div>
          <div>
            <dt>ผิด</dt>
            <dd>{result.incorrect}</dd>
          </div>
          <div>
            <dt>เปอร์เซ็นต์</dt>
            <dd>{result.percentage}%</dd>
          </div>
        </dl>
        <div className="millionaireResultActions">
          <button type="button" className="button primary" onClick={restartQuiz}>
            เริ่มใหม่
          </button>
          <Link className="button secondary" href={lessonPath}>
            กลับไปบทเรียน
          </Link>
        </div>
      </section>
    );
  }

  if (!currentQuestion) {
    return (
      <section className="millionaireGame panel">
        <span className="eyebrow">QUIZ</span>
        <h1>Quiz</h1>
        <p className="millionaireIntro">
          ไม่มีคำถามที่ตรงกับเงื่อนไขสำหรับบทเรียนนี้
        </p>
        <Link className="button secondary" href={lessonPath}>
          กลับไปบทเรียน
        </Link>
      </section>
    );
  }

  return (
    <section className="millionaireGame">
      <div className="millionaireProgress">
        <div className="millionaireProgressMeta">
          <span>
            {currentIndex + 1} / {totalQuestions}
          </span>
          <span>
            ถูก <strong>{correctCount}</strong> · ผิด{" "}
            <strong>{incorrectCount}</strong>
          </span>
        </div>
        <div
          className="progress millionaireProgressBar"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="ความคืบหน้าแบบทดสอบ"
        >
          <div style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <article className="millionaireQuestion card">
        <span className="eyebrow">
          QUIZ · {difficultyLabels[currentQuestion.difficulty]}
        </span>
        <h2>{currentQuestion.prompt}</h2>
        <div className="millionaireChoices">
          {currentQuestion.choices.map((choice) => {
            let state: "default" | "correct" | "incorrect" = "default";

            if (revealed && choice.id === currentQuestion.correctChoiceId) {
              state = "correct";
            } else if (
              revealed &&
              choice.id === selectedChoiceId &&
              choice.id !== currentQuestion.correctChoiceId
            ) {
              state = "incorrect";
            }

            return (
              <ChoiceButton
                key={choice.id}
                label={choice.text}
                onClick={() => handleChoice(choice.id)}
                disabled={revealed}
                state={state}
              />
            );
          })}
        </div>
        {revealed && (
          <div className="millionaireExplanation planningTip">
            {currentQuestion.explanation}
          </div>
        )}
        <div className="quizNextAction">
          <button
            type="button"
            className="button primary"
            onClick={handleNext}
            disabled={!revealed}
          >
            {currentIndex >= totalQuestions - 1 ? "ดูผลคะแนน" : "ถัดไป"}
          </button>
        </div>
      </article>
    </section>
  );
}
