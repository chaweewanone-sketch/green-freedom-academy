"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ActivityResultActions } from "@/components/activities/ActivityResultActions";
import { ChoiceButton } from "@/components/millionaire/ChoiceButton";
import type { ResultNextAction } from "@/lib/analytics/resultNextAction";
import { buildAssessmentResult } from "@/lib/assessment";
import {
  createQuizAttemptSnapshot,
  nextQuizAttemptKey,
  resolveQuizChoiceScore,
  type QuizAttemptPhase,
} from "@/lib/quiz/quizAttemptState";
import { getLessonPath } from "@/lib/routes";
import type { AssessmentSession } from "@/lib/assessment";
import type { AssessmentResult } from "@/types/assessment-result";

type QuizGameProps = {
  session: AssessmentSession;
  onComplete?: (result: AssessmentResult) => void;
  nextAction?: ResultNextAction;
  onRestartAttempt?: () => void;
};

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

type QuizAttemptProps = {
  session: AssessmentSession;
  onComplete?: (result: AssessmentResult) => void;
  nextAction?: ResultNextAction;
  onRequestRestart: () => void;
  initialPhase: QuizAttemptPhase;
};

function QuizAttempt({
  session,
  onComplete,
  nextAction,
  onRequestRestart,
  initialPhase,
}: QuizAttemptProps) {
  const questions = session.questions;
  const totalQuestions = questions.length;
  const lessonTitle = formatLessonSlug(session.lessonSlug);
  const lessonPath = getLessonPath(session.lessonSlug);
  const initial = createQuizAttemptSnapshot(initialPhase);
  const hasRecordedCompletionRef = useRef(initial.hasRecordedCompletion);

  const [phase, setPhase] = useState<QuizAttemptPhase>(initial.phase);
  const [currentIndex, setCurrentIndex] = useState(initial.currentIndex);
  const [correctCount, setCorrectCount] = useState(initial.correctCount);
  const [incorrectCount, setIncorrectCount] = useState(initial.incorrectCount);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
    initial.selectedChoiceId,
  );
  const [revealed, setRevealed] = useState(initial.revealed);
  const [result, setResult] = useState<AssessmentResult | null>(initial.result);
  const [choiceInputArmed, setChoiceInputArmed] = useState(
    initialPhase !== "question",
  );

  const currentQuestion = questions[currentIndex];
  const progressPercent =
    totalQuestions > 0
      ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
      : 0;

  useEffect(() => {
    if (initialPhase !== "question") {
      return;
    }

    setChoiceInputArmed(true);
  }, [initialPhase]);

  function startQuiz() {
    if (totalQuestions === 0) {
      return;
    }

    const started = createQuizAttemptSnapshot("question");
    setPhase(started.phase);
    setCurrentIndex(started.currentIndex);
    setCorrectCount(started.correctCount);
    setIncorrectCount(started.incorrectCount);
    setSelectedChoiceId(started.selectedChoiceId);
    setRevealed(started.revealed);
    setResult(started.result);
    hasRecordedCompletionRef.current = started.hasRecordedCompletion;
    setChoiceInputArmed(true);
  }

  function handleChoice(choiceId: string) {
    if (!choiceInputArmed || revealed || !currentQuestion) return;

    const isValidChoice = currentQuestion.choices.some(
      (choice) => choice.id === choiceId,
    );
    if (!isValidChoice) return;

    setSelectedChoiceId(choiceId);
    setRevealed(true);

    if (
      resolveQuizChoiceScore(choiceId, currentQuestion.correctChoiceId) ===
      "correct"
    ) {
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
        <h1>ผลการทำแบบทดสอบ</h1>
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
        <ActivityResultActions
          lessonPath={lessonPath}
          onRestart={onRequestRestart}
          nextAction={nextAction}
          guided
        />
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
                disabled={revealed || !choiceInputArmed}
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
        {revealed && (
          <div className="quizNextAction">
            <button
              type="button"
              className="button primary"
              onClick={handleNext}
            >
              {currentIndex >= totalQuestions - 1 ? "ดูผลคะแนน" : "ถัดไป"}
            </button>
          </div>
        )}
      </article>
    </section>
  );
}

export function QuizGame({
  session,
  onComplete,
  nextAction,
  onRestartAttempt,
}: QuizGameProps) {
  const [attemptKey, setAttemptKey] = useState(0);

  return (
    <QuizAttempt
      key={attemptKey}
      session={session}
      onComplete={onComplete}
      nextAction={nextAction}
      initialPhase="intro"
      onRequestRestart={() => {
        onRestartAttempt?.();
        setAttemptKey((current) => nextQuizAttemptKey(current));
      }}
    />
  );
}
