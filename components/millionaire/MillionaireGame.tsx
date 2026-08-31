"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { QuestionCard } from "./QuestionCard";
import { ResultPanel } from "./ResultPanel";
import { StageLadder } from "./StageLadder";
import type { ResultNextAction } from "@/lib/analytics/resultNextAction";
import { buildAssessmentResult } from "@/lib/assessment";
import {
  createMillionaireAttemptSnapshot,
  nextMillionaireAttemptKey,
} from "@/lib/millionaire/millionaireAttemptState";
import {
  applyStageAnswer,
  continueAfterFeedback,
  isFinalStage,
  resolveStageStatuses,
} from "@/lib/millionaire/stageLadder";
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
  const [stageOutcomes, setStageOutcomes] = useState(initial.stageOutcomes);

  const currentQuestion = gameQuestions[currentIndex];
  const stageStatuses = resolveStageStatuses(
    totalQuestions,
    currentIndex,
    stageOutcomes,
    revealed,
  );

  function startGame() {
    const started = createMillionaireAttemptSnapshot("playing");
    setPhase(started.phase);
    setCurrentIndex(started.currentIndex);
    setScore(started.score);
    setSelectedChoiceId(started.selectedChoiceId);
    setRevealed(started.revealed);
    setStageOutcomes(started.stageOutcomes);
    hasRecordedCompletionRef.current = started.hasRecordedCompletion;
  }

  function handleChoice(choiceId: string) {
    if (revealed || !currentQuestion) return;

    const isValidChoice = currentQuestion.choices.some(
      (choice) => choice.id === choiceId,
    );
    if (!isValidChoice) return;

    const isCorrect = choiceId === currentQuestion.correctChoiceId;
    const answered = applyStageAnswer(score, stageOutcomes, isCorrect);

    setSelectedChoiceId(choiceId);
    setRevealed(true);
    setScore(answered.score);
    setStageOutcomes(answered.outcomes);
  }

  function handleContinue() {
    if (!revealed) return;

    const next = continueAfterFeedback(currentIndex, totalQuestions);

    if (next.kind === "result") {
      if (!hasRecordedCompletionRef.current) {
        hasRecordedCompletionRef.current = true;
        const incorrect = totalQuestions - score;
        onComplete?.(buildAssessmentResult(session, score, incorrect));
      }
      setPhase("result");
      return;
    }

    setCurrentIndex(next.index);
    setSelectedChoiceId(null);
    setRevealed(false);
  }

  if (phase === "start") {
    return (
      <section className="gfaGameIntro panel">
        <span className="eyebrow">เกม</span>
        <h1>เกมพิชิต 10 ด่าน</h1>
        <p className="gfaGameIntroLead">
          บทเรียน: <strong>{lessonTitle}</strong>
        </p>
        {totalQuestions > 0 ? (
          <>
            <p className="gfaGameIntroStory">
              เรียนรู้มาแล้ว
              <br />
              ฝึก Quiz มาแล้ว
              <br />
              ตอนนี้มาพิชิต 10 ด่านกัน!
            </p>
            <p className="gfaGameIntroMeta">
              เล่น {session.selectedCount} ด่านจากคลัง {session.totalAvailable} ข้อ
            </p>
          </>
        ) : (
          <p className="gfaGameIntroLead">
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
    <section className="gfaGameShell">
      <div className="gfaGamePlay">
        <QuestionCard
          question={currentQuestion}
          selectedChoiceId={selectedChoiceId}
          revealed={revealed}
          stageNumber={currentIndex + 1}
          totalStages={totalQuestions}
          isFinalStage={isFinalStage(currentIndex, totalQuestions)}
          onChoice={handleChoice}
          onContinue={handleContinue}
        />
      </div>
      <aside className="gfaGameLadderColumn">
        <p className="gfaGameLadderTitle">10 ด่าน</p>
        <StageLadder statuses={stageStatuses} />
      </aside>
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
