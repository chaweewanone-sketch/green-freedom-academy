"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MILLIONAIRE_ACTIVITY_DISPLAY_NAME } from "@/lib/activities";
import { AdventureMap } from "./AdventureMap";
import { GameWorld } from "./GameWorld";
import { QuestionCard } from "./QuestionCard";
import { ResultPanel } from "./ResultPanel";
import { StageCelebration } from "./StageCelebration";
import { StageLadder } from "./StageLadder";
import { playCelebrationSound } from "@/lib/millionaire/playSuccessChime";
import type { ResultNextAction } from "@/lib/analytics/resultNextAction";
import { buildAssessmentResult } from "@/lib/assessment";
import {
  createMillionaireAttemptSnapshot,
  nextMillionaireAttemptKey,
} from "@/lib/millionaire/millionaireAttemptState";
import {
  applyStageAnswer,
  continueAfterFeedback,
  formatGamePrize,
  getStagePrize,
  isFinalStage,
  MILLIONAIRE_FINAL_DISPLAY_PRIZE,
  resolveStageStatuses,
  type StageVisualStatus,
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

function previewStatuses(total: number): StageVisualStatus[] {
  return Array.from({ length: total }, () => "upcoming");
}

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
  const [celebrationToken, setCelebrationToken] = useState(0);
  const lastCelebratedIndexRef = useRef<number | null>(null);

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

  async function handleChoice(choiceId: string) {
    if (revealed || !currentQuestion) return;

    const isValidChoice = currentQuestion.choices.some(
      (choice) => choice.id === choiceId,
    );
    if (!isValidChoice) return;

    const isCorrect = choiceId === currentQuestion.correctChoiceId;
    const answered = applyStageAnswer(score, stageOutcomes, isCorrect);

    if (isCorrect && lastCelebratedIndexRef.current !== currentIndex) {
      lastCelebratedIndexRef.current = currentIndex;
      await playCelebrationSound();
      setCelebrationToken((current) => current + 1);
    }

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
      <GameWorld phase="intro">
        <section className="gfaGameHero">
          <div className="gfaGameHeroCopy">
            <p className="gfaGameIntroEyebrow">เกม</p>
            <h1>{MILLIONAIRE_ACTIVITY_DISPLAY_NAME}</h1>
            <p className="gfaGameIntroLesson">{lessonTitle}</p>
            <p className="gfaGameSpeech">
              พิชิต 10 ด่าน ทดสอบความรู้ {lessonTitle}
            </p>
            {totalQuestions > 0 ? (
              <aside className="gfaMissionCard">
                <p className="gfaMissionKicker">ภารกิจของวันนี้</p>
                <p className="gfaMissionLine">พิชิต 10 ด่าน</p>
                <p className="gfaMissionLine">ขึ้นบันไดเงินรางวัลในเกม</p>
                <p className="gfaMissionLine">
                  ไปให้ถึง {formatGamePrize(MILLIONAIRE_FINAL_DISPLAY_PRIZE)}!
                </p>
              </aside>
            ) : (
              <p className="gfaGameIntroLesson">
                ไม่มีคำถามที่ตรงกับเงื่อนไขสำหรับบทเรียนนี้
              </p>
            )}
            <div className="gfaGameIntroActions">
              {totalQuestions > 0 ? (
                <button
                  type="button"
                  className="gfaGameCta"
                  onClick={startGame}
                >
                  เริ่มพิชิตด่าน! 🚀
                </button>
              ) : null}
              <Link className="button secondary" href={lessonPath}>
                กลับไปบทเรียน
              </Link>
            </div>
          </div>
          {totalQuestions > 0 ? (
            <div className="gfaGameHeroTrail">
              <AdventureMap statuses={previewStatuses(totalQuestions)} />
            </div>
          ) : null}
        </section>
      </GameWorld>
    );
  }

  if (phase === "result") {
    return (
      <GameWorld phase="result">
        <ResultPanel
          score={score}
          total={totalQuestions}
          lessonTitle={lessonTitle}
          lessonPath={lessonPath}
          onRestart={onRequestRestart}
          nextAction={nextAction}
        />
      </GameWorld>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const finalStage = isFinalStage(currentIndex, totalQuestions);

  return (
    <>
      <StageCelebration token={celebrationToken} />
      <GameWorld
        phase="playing"
        ladder={
          <aside className="gfaGameLadderColumn">
            <p className="gfaGameLadderTitle">เงินรางวัลในเกม</p>
            <p className="gfaGameLadderGoal">
              พิชิต {formatGamePrize(MILLIONAIRE_FINAL_DISPLAY_PRIZE)}
            </p>
            <StageLadder statuses={stageStatuses} />
          </aside>
        }
      >
        <section className="gfaGameShell">
        <header className="gfaGameHeader">
          <div className="gfaGameHeaderCopy">
            <h1 className="gfaGameTitle">{MILLIONAIRE_ACTIVITY_DISPLAY_NAME}</h1>
            <p className="gfaGameLesson">{lessonTitle}</p>
          </div>
          <p
            className={`gfaGameStageNow${finalStage ? " gfaGameStageNow-final" : ""}`}
          >
            {finalStage
              ? "🏆 ด่านสุดท้าย"
              : `ด่าน ${currentIndex + 1} จาก ${totalQuestions}`}
          </p>
          <p className="gfaGameScoreNow">
            {formatGamePrize(getStagePrize(currentIndex))}
          </p>
        </header>
        <div className="gfaGameBoard">
          <div className="gfaGamePlay">
            <QuestionCard
              question={currentQuestion}
              selectedChoiceId={selectedChoiceId}
              revealed={revealed}
              isFinalStage={finalStage}
              onChoice={handleChoice}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </section>
      </GameWorld>
    </>
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
    <>
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
    </>
  );
}
