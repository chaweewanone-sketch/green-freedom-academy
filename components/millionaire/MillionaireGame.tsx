"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AdventureMap } from "./AdventureMap";
import { GameHeroCharacter } from "./GameHeroCharacter";
import { GameWorld } from "./GameWorld";
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
      <GameWorld phase="intro">
        <section className="gfaGameHero">
          <div className="gfaGameHeroCopy">
            <p className="gfaGameIntroEyebrow">เกม</p>
            <h1>เกมพิชิต 10 ด่าน</h1>
            <p className="gfaGameIntroLesson">{lessonTitle}</p>
            {totalQuestions > 0 ? (
              <aside className="gfaMissionCard">
                <p className="gfaMissionKicker">ภารกิจของวันนี้ ⭐</p>
                <p className="gfaMissionLine">พิชิต 10 ด่าน</p>
                <p className="gfaMissionLine">ตอบให้ถูกเพื่อเก็บดาว</p>
                <p className="gfaMissionLine">แล้วไปให้ถึงถ้วยรางวัล!</p>
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
          <div className="gfaGameHeroArt">
            <GameHeroCharacter size="hero" />
            <p className="gfaGameSpeech">มาพิชิต 10 ด่านกัน!</p>
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
  const playMood =
    revealed && selectedChoiceId !== currentQuestion.correctChoiceId
      ? "encourage"
      : "cheer";

  return (
    <GameWorld phase="playing">
      <section className="gfaGameShell">
        <header className="gfaGameHeader">
          <div className="gfaGameHeaderCopy">
            <h1 className="gfaGameTitle">เกมพิชิต 10 ด่าน</h1>
            <p className="gfaGameLesson">{lessonTitle}</p>
          </div>
          <p
            className={`gfaGameStageNow${finalStage ? " gfaGameStageNow-final" : ""}`}
          >
            {finalStage
              ? "🏆 ด่านสุดท้าย"
              : `ด่าน ${currentIndex + 1} จาก ${totalQuestions}`}
          </p>
          <div className="gfaGameHeaderBuddy">
            <GameHeroCharacter size="support" mood={playMood} />
          </div>
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
          <aside className="gfaGameLadderColumn">
            <p className="gfaGameLadderTitle">เส้นทางผจญภัย</p>
            <p className="gfaGameLadderGoal">ไปให้ถึงถ้วย 🏆</p>
            <StageLadder statuses={stageStatuses} />
          </aside>
        </div>
      </section>
    </GameWorld>
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
