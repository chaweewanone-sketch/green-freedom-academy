"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityResultActions } from "@/components/activities/ActivityResultActions";
import { GfaQuizWorld } from "@/components/student-ui/GfaQuizWorld";
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

function choiceLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

function QuizShell({ children }: { children: ReactNode }) {
  return <GfaQuizWorld>{children}</GfaQuizWorld>;
}

type QuizChoiceButtonProps = {
  letter: string;
  label: string;
  onClick: () => void;
  disabled: boolean;
  selected: boolean;
  state: "default" | "correct" | "incorrect";
};

function QuizChoiceButton({
  letter,
  label,
  onClick,
  disabled,
  selected,
  state,
}: QuizChoiceButtonProps) {
  const stateNote =
    state === "correct" ? " ถูก" : state === "incorrect" ? " ที่เลือก" : "";

  return (
    <button
      type="button"
      className={[
        "gfaQuizChoice",
        `gfaQuizChoice-${state}`,
        selected ? "gfaQuizChoice-selected" : "",
        disabled ? "gfaQuizChoice-disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`ตัวเลือก ${letter}: ${label}${stateNote}`}
    >
      <span className="gfaQuizChoiceLetter" aria-hidden="true">
        {letter}
      </span>
      <span className="gfaQuizChoiceText">{label}</span>
      {state === "correct" ? (
        <span className="gfaQuizChoiceMark" aria-hidden="true">
          ✓
        </span>
      ) : null}
      {state === "incorrect" ? (
        <span className="gfaQuizChoiceMark" aria-hidden="true">
          ✗
        </span>
      ) : null}
    </button>
  );
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
      <QuizShell>
        <article className="gfaQuizCard gfaQuiz-intro">
          <div className="gfaQuizIntroIdentity">
            <span className="gfaQuizEyebrow">Quiz</span>
            <strong>{lessonTitle}</strong>
          </div>
          <div className="gfaQuizIntroBody">
            <h1>Quiz</h1>
            <p className="gfaQuizLead">
              บทเรียน: <strong>{lessonTitle}</strong>
            </p>
            {totalQuestions > 0 ? (
              <p className="gfaQuizLead">
                ทำแบบทดสอบ {session.selectedCount} ข้อ
              </p>
            ) : (
              <p className="gfaQuizLead">
                ไม่มีคำถามที่ตรงกับเงื่อนไขสำหรับบทเรียนนี้
              </p>
            )}
          </div>
          <div className="gfaQuizIntroAction">
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
          </div>
        </article>
      </QuizShell>
    );
  }

  if (phase === "result" && result) {
    return (
      <QuizShell>
        <article className="gfaQuizCard gfaQuiz-result">
          <div className="gfaQuizIntroIdentity">
            <span className="gfaQuizEyebrow">RESULT</span>
            <strong>{lessonTitle}</strong>
          </div>
          <div className="gfaQuizIntroBody">
            <h1>ผลการทำแบบทดสอบ</h1>
            <p className="gfaQuizScore">
              คะแนน <strong>{result.score}</strong> / {totalQuestions}
            </p>
            <dl className="gfaQuizResultMeta">
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
          </div>
          <div className="gfaQuizIntroAction gfaQuizResultActions">
            <ActivityResultActions
              lessonPath={lessonPath}
              onRestart={onRequestRestart}
              nextAction={nextAction}
              guided
            />
          </div>
        </article>
      </QuizShell>
    );
  }

  if (!currentQuestion) {
    return (
      <QuizShell>
        <article className="gfaQuizCard gfaQuiz-empty">
          <span className="gfaQuizEyebrow">QUIZ</span>
          <h1>Quiz</h1>
          <p className="gfaQuizLead">
            ไม่มีคำถามที่ตรงกับเงื่อนไขสำหรับบทเรียนนี้
          </p>
          <Link className="button secondary" href={lessonPath}>
            กลับไปบทเรียน
          </Link>
        </article>
      </QuizShell>
    );
  }

  return (
    <QuizShell>
      <article className="millionaireQuestion card">
        <header className="gfaQuizHeader">
          <div className="gfaQuizHeaderIdentity">
            <span className="gfaQuizEyebrow">Quiz</span>
            <strong>{lessonTitle}</strong>
          </div>
          <div className="gfaQuizHeaderProgress">
            <span>
              ข้อ {currentIndex + 1} จาก {totalQuestions}
            </span>
            <div
              className="progress gfaQuizProgressBar"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="ความคืบหน้าแบบทดสอบ"
            >
              <div style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="gfaQuizHeaderCounts">
            <span className="gfaQuizCount gfaQuizCount-correct">
              <span className="gfaQuizCountIcon" aria-hidden="true">
                ✓
              </span>
              <small>ถูก</small>
              <strong>{correctCount}</strong>
            </span>
            <span className="gfaQuizCount gfaQuizCount-wrong">
              <span className="gfaQuizCountIcon" aria-hidden="true">
                ✗
              </span>
              <small>ผิด</small>
              <strong>{incorrectCount}</strong>
            </span>
            <span className="gfaQuizCoin" aria-label="เหรียญ 0">
              <span className="gfaQuizCoinGlyph" aria-hidden="true" />
              <strong>0</strong>
            </span>
          </div>
        </header>
        <span className="gfaQuizEyebrow">
          QUIZ · {difficultyLabels[currentQuestion.difficulty]}
        </span>
        <h2>{currentQuestion.prompt}</h2>
        <div className="gfaQuizChoices">
          {currentQuestion.choices.map((choice, index) => {
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
              <QuizChoiceButton
                key={choice.id}
                letter={choiceLetter(index)}
                label={choice.text}
                onClick={() => handleChoice(choice.id)}
                disabled={revealed || !choiceInputArmed}
                selected={choice.id === selectedChoiceId}
                state={state}
              />
            );
          })}
        </div>
        {revealed ? (
          <div className="gfaQuizExplanation" role="status">
            <span className="gfaQuizExplanationCue" aria-hidden="true">
              ✦
            </span>
            <p>{currentQuestion.explanation}</p>
          </div>
        ) : (
          <div className="gfaQuizExplanation gfaQuizHelper" role="note">
            <span className="gfaQuizExplanationCue" aria-hidden="true">
              ✦
            </span>
            <p>เลือกคำตอบที่ถูกต้องที่สุดเพียงข้อเดียว</p>
          </div>
        )}
        {revealed && (
          <div className="gfaQuizNextAction">
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
    </QuizShell>
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
