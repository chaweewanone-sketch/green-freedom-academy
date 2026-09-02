import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildAssessmentResult, createAssessmentSession } from "@/lib/assessment";
import {
  MemoryLearningHistoryRepository,
  recordActivityCompletion,
} from "@/lib/history";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import {
  createMillionaireAttemptSnapshot,
  nextMillionaireAttemptKey,
} from "@/lib/millionaire/millionaireAttemptState";
import { getQuestionBankSize } from "@/lib/question-bank";
import type { AssessmentResult } from "@/types/assessment-result";
import type { AssessmentSession } from "@/types/assessment";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function hasUniqueQuestionIds(session: AssessmentSession): boolean {
  const ids = session.questions.map((question) => question.id);
  return ids.length === session.questions.length && new Set(ids).size === ids.length;
}

function millionaireResultFromCounts(
  session: AssessmentSession,
  correct: number,
  incorrect: number,
  completedAt: number,
): AssessmentResult {
  return {
    ...buildAssessmentResult(session, correct, incorrect),
    completedAt,
  };
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

export function verifyMillionaireReplayMintsFreshSession(): void {
  const first = createAssessmentSession(presentSimpleLesson, "millionaire");
  const replay = createAssessmentSession(presentSimpleLesson, "millionaire");

  assert(first.sessionId !== replay.sessionId, "replay: new sessionId");
  assert(first.activity === "millionaire", "replay: first is millionaire");
  assert(replay.activity === "millionaire", "replay: second is millionaire");
  assert(first.lessonSlug === "present-simple", "replay: Present Simple bank");
  assert(replay.lessonSlug === "present-simple", "replay: same lesson bank");
  assert(first.questions.length === 10, "replay: first has 10");
  assert(replay.questions.length === 10, "replay: second has 10");
  assert(hasUniqueQuestionIds(first), "replay: first questions unique");
  assert(hasUniqueQuestionIds(replay), "replay: second questions unique");
  assert(getQuestionBankSize("present-simple") === 50, "replay: bank still 50");
}

export function verifyMillionaireReplayHistoryRemainsDistinct(): void {
  const session1 = createAssessmentSession(presentSimpleLesson, "millionaire");
  const session2 = createAssessmentSession(presentSimpleLesson, "millionaire");
  const repository = new MemoryLearningHistoryRepository();

  const first = recordActivityCompletion({
    result: millionaireResultFromCounts(session1, 8, 2, 1_700_041_000_000),
    lessonSlug: session1.lessonSlug,
    repository,
  });
  assert(first !== null, "history: attempt 1 writes");
  assert(repository.getAll().length === 1, "history: one event after attempt 1");

  const replay = createMillionaireAttemptSnapshot("start");
  assert(replay.hasRecordedCompletion === false, "history: replay CTA writes nothing");
  assert(repository.getAll().length === 1, "history: intro remount does not append");

  const second = recordActivityCompletion({
    result: millionaireResultFromCounts(session2, 7, 3, 1_700_041_000_500),
    lessonSlug: session2.lessonSlug,
    repository,
  });
  assert(second !== null, "history: attempt 2 writes");
  assert(repository.getAll().length === 2, "history: distinct second event");
  assert(
    repository.getAll()[0]?.sessionId === session1.sessionId,
    "history: prior attempt preserved",
  );
  assert(
    repository.getAll()[1]?.sessionId === session2.sessionId,
    "history: replay completion uses new sessionId",
  );
  assert(
    repository.getAll()[0]?.sessionId !== repository.getAll()[1]?.sessionId,
    "history: attempts are distinct identities",
  );
}

export function verifyMillionaireReplaySourceBoundary(): void {
  const source = readFileSync(
    resolve(process.cwd(), "components/millionaire/MillionaireGame.tsx"),
    "utf8",
  );
  const player = readFileSync(
    resolve(process.cwd(), "components/activities/StudentActivityPlayer.tsx"),
    "utf8",
  );

  assert(source.includes("function MillionaireAttempt"), "ui: attempt owner extracted");
  assert(source.includes("key={attemptKey}"), "ui: remount uses attempt key");
  assert(source.includes("nextMillionaireAttemptKey"), "ui: restart increments key");
  assert(
    source.includes('createMillionaireAttemptSnapshot("start")'),
    "ui: remount starts at intro",
  );
  assert(source.includes("เริ่มพิชิตด่าน"), "ui: explicit Start remains");
  assert(source.includes("onClick={startGame}"), "ui: Start still begins attempt");
  assert(
    !source.includes("function restartGame"),
    "ui: replay no longer jumps to playing",
  );
  assert(
    !source.includes("createAssessmentSession"),
    "ui: MillionaireGame does not mint sessions",
  );
  assert(player.includes("createAssessmentSession"), "ui: player mints fresh session");
  assert(player.includes("key={liveSession.sessionId}"), "ui: player remounts by sessionId");
  assert(player.includes("session={liveSession}"), "ui: games use live session");
}

export function runMillionaireAttemptResetVerification(): void {
  verifyMillionaireReplayReturnsToIntro();
  verifyMillionaireStartOpensCleanQuestionOne();
  verifyMillionaireReplayMintsFreshSession();
  verifyMillionaireReplayHistoryRemainsDistinct();
  verifyMillionaireReplaySourceBoundary();
}
