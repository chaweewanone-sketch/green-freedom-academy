import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createMillionaireAttemptSnapshot,
  nextMillionaireAttemptKey,
} from "@/lib/millionaire/millionaireAttemptState";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function verifyMillionaireReplayReturnsToIntro(): void {
  const replay = createMillionaireAttemptSnapshot("start");
  assert(replay.phase === "start", "replay: intro");
  assert(replay.currentIndex === 0, "replay: index not active");
  assert(replay.score === 0, "replay: score reset");
  assert(replay.selectedChoiceId === null, "replay: no selected answer");
  assert(replay.revealed === false, "replay: feedback not revealed");
  assert(replay.stageOutcomes.length === 0, "replay: no stage marked completed");
  assert(replay.hasRecordedCompletion === false, "replay: completion flag reset");
  assert(nextMillionaireAttemptKey(0) === 1, "replay: remount key increments");
}

export function verifyMillionaireStartOpensCleanQuestionOne(): void {
  const started = createMillionaireAttemptSnapshot("playing");
  assert(started.phase === "playing", "start: playing");
  assert(started.currentIndex === 0, "start: Question 1");
  assert(started.score === 0, "start: score 0");
  assert(started.selectedChoiceId === null, "start: no choice");
  assert(started.revealed === false, "start: no feedback");
  assert(started.stageOutcomes.length === 0, "start: stages 2–10 upcoming");
  assert(started.hasRecordedCompletion === false, "start: no completion");
}

export function verifyMillionaireReplaySourceBoundary(): void {
  const source = readFileSync(
    resolve(process.cwd(), "components/millionaire/MillionaireGame.tsx"),
    "utf8",
  );

  assert(source.includes("function MillionaireAttempt"), "ui: attempt owner extracted");
  assert(source.includes("key={attemptKey}"), "ui: remount uses attempt key");
  assert(source.includes("nextMillionaireAttemptKey"), "ui: restart increments key");
  assert(
    source.includes('createMillionaireAttemptSnapshot("start")'),
    "ui: remount starts at intro",
  );
  assert(source.includes("เริ่มเกม"), "ui: explicit Start remains");
  assert(
    !source.includes("function restartGame"),
    "ui: replay no longer jumps to playing",
  );
}

export function runMillionaireAttemptResetVerification(): void {
  verifyMillionaireReplayReturnsToIntro();
  verifyMillionaireStartOpensCleanQuestionOne();
  verifyMillionaireReplaySourceBoundary();
}
