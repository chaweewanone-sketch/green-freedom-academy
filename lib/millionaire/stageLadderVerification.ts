import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildAssessmentResult, createAssessmentSession } from "@/lib/assessment";
import { getLessonBySlug } from "@/lib/lessons";
import { buildGameResultPresentation } from "@/lib/millionaire/gameResultPresentation";
import {
  applyStageAnswer,
  continueAfterFeedback,
  formatGamePrize,
  GAME_STAGE_COUNT,
  getStagePrize,
  isFinalStage,
  MILLIONAIRE_FINAL_DISPLAY_PRIZE,
  MILLIONAIRE_PRIZE_LADDER,
  resolveStageStatuses,
} from "@/lib/millionaire/stageLadder";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertStatus(
  statuses: readonly string[],
  index: number,
  expected: string,
  message: string,
): void {
  assert(statuses[index] === expected, message);
}

export function verifyLadderStageCount(): void {
  assert(GAME_STAGE_COUNT === 10, "ladder: 10 stages");
  const statuses = resolveStageStatuses(GAME_STAGE_COUNT, 0, [], false);
  assert(statuses.length === 10, "ladder: status length 10");
}

export function verifyPrizeLadderPresentation(): void {
  assert(MILLIONAIRE_PRIZE_LADDER.length === 10, "prize: 10 display stages");
  assert(MILLIONAIRE_FINAL_DISPLAY_PRIZE === 1_000_000, "prize: final 1,000,000");
  assert(getStagePrize(0) === 1_000, "prize: stage 1 = 1,000");
  assert(getStagePrize(9) === 1_000_000, "prize: stage 10 = 1,000,000");
  assert(formatGamePrize(1_000_000) === "฿1,000,000", "prize: formatted final");
  assert(
    MILLIONAIRE_PRIZE_LADDER.join(",") ===
      "1000,5000,10000,25000,50000,100000,250000,500000,750000,1000000",
    "prize: fixed ladder values",
  );
}

export function verifyInitialStageState(): void {
  const statuses = resolveStageStatuses(GAME_STAGE_COUNT, 0, [], false);
  assertStatus(statuses, 0, "current", "initial: stage 1 current");
  assert(
    statuses.slice(1).every((status) => status === "upcoming"),
    "initial: stages 2–10 upcoming",
  );
  const answered = applyStageAnswer(0, [], true);
  assert(answered.score === 1, "answer helper: score is separate from index");
}

export function verifyCorrectFirstStage(): void {
  const afterAnswer = applyStageAnswer(0, [], true);
  assert(afterAnswer.score === 1, "correct Q1: score 1");
  const statuses = resolveStageStatuses(
    GAME_STAGE_COUNT,
    0,
    afterAnswer.outcomes,
    true,
  );
  assertStatus(statuses, 0, "correct", "correct Q1: stage 1 success");
  assert(
    statuses.slice(1).every((status) => status === "upcoming"),
    "correct Q1: later stages still upcoming",
  );
  assert(
    continueAfterFeedback(0, GAME_STAGE_COUNT).kind === "next",
    "correct Q1: game continues",
  );
}

export function verifyIncorrectFirstStage(): void {
  const afterAnswer = applyStageAnswer(0, [], false);
  assert(afterAnswer.score === 0, "incorrect Q1: score unchanged");
  const statuses = resolveStageStatuses(
    GAME_STAGE_COUNT,
    0,
    afterAnswer.outcomes,
    true,
  );
  assertStatus(statuses, 0, "missed", "incorrect Q1: stage 1 missed");
  const next = continueAfterFeedback(0, GAME_STAGE_COUNT);
  assert(next.kind === "next" && next.index === 1, "incorrect Q1: continues to ด่าน 2");
}

export function verifyFinalStage(): void {
  assert(isFinalStage(9, GAME_STAGE_COUNT), "Q10: final stage");
  assert(!isFinalStage(8, GAME_STAGE_COUNT), "Q9: not final");
  assert(
    continueAfterFeedback(9, GAME_STAGE_COUNT).kind === "result",
    "Q10 continue: result",
  );
}

export function verifyExplicitContinueOnly(): void {
  const afterAnswer = applyStageAnswer(0, [], true);
  const stillOnFirst = resolveStageStatuses(
    GAME_STAGE_COUNT,
    0,
    afterAnswer.outcomes,
    true,
  );
  assertStatus(stillOnFirst, 0, "correct", "no auto-advance: still ด่าน 1");
  assertStatus(stillOnFirst, 1, "upcoming", "no auto-advance: ด่าน 2 not current");

  const next = continueAfterFeedback(0, GAME_STAGE_COUNT);
  assert(next.kind === "next" && next.index === 1, "explicit continue: +1 stage");
  const afterContinue = resolveStageStatuses(
    GAME_STAGE_COUNT,
    next.index,
    afterAnswer.outcomes,
    false,
  );
  assertStatus(afterContinue, 0, "correct", "continue: ด่าน 1 stays completed");
  assertStatus(afterContinue, 1, "current", "continue: ด่าน 2 current");
}

export function verifyAllTenQuestionsRequired(): void {
  let index = 0;
  let score = 0;
  let outcomes: ReturnType<typeof applyStageAnswer>["outcomes"] = [];

  for (let question = 0; question < GAME_STAGE_COUNT; question += 1) {
    assert(index === question, `coverage: still on question ${question + 1}`);
    const isCorrect = question % 2 === 0;
    const answered = applyStageAnswer(score, outcomes, isCorrect);
    score = answered.score;
    outcomes = answered.outcomes;
    const next = continueAfterFeedback(index, GAME_STAGE_COUNT);
    if (question < GAME_STAGE_COUNT - 1) {
      assert(next.kind === "next", `coverage: Q${question + 1} does not end game`);
      index = next.index;
    } else {
      assert(next.kind === "result", "coverage: only Q10 opens result");
    }
  }

  assert(outcomes.length === 10, "coverage: 10 stage outcomes");
  assert(score === 5, "coverage: 5 correct of 10");
}

export function verifyResultScoreUnchanged(): void {
  const lesson = getLessonBySlug("present-simple");
  assert(lesson !== null, "result: present-simple exists");
  const session = createAssessmentSession(lesson, "millionaire");
  assert(session.selectedCount === 10, "result: 10 questions");
  const result = buildAssessmentResult(session, 8, 2);
  assert(result.score === 8, "result: score is correct count");
  assert(result.percentage === 80, "result: percentage frozen");
  const presentation = buildGameResultPresentation(8, 10);
  assert(
    presentation.starsLabel === "ผ่าน 8/10 ด่าน",
    "result: stage progress mirrors correct count",
  );
  assert(presentation.percentage === 80, "result: presentation uses same %");
  assert(presentation.band === "developing", "result: 80 is developing");
  assert(
    presentation.kicker === "Millionaire Challenge",
    "result: canonical activity name",
  );
  assert(presentation.message.includes("฿1,000,000"), "result: prize journey copy");
  assert(!presentation.message.includes("เงินจริง"), "result: no real-money claim");
  assert(buildGameResultPresentation(6, 10).band === "weak", "result: 60 weak");
  assert(buildGameResultPresentation(9, 10).band === "strong", "result: 90 strong");
}

export function verifyReplayResetsStages(): void {
  const statuses = resolveStageStatuses(GAME_STAGE_COUNT, 0, [], false);
  assertStatus(statuses, 0, "current", "replay: ด่าน 1 current");
  assert(
    statuses.slice(1).every((status) => status === "upcoming"),
    "replay: no completed stages",
  );
}

export function verifyMillionaireGameSourceBoundary(): void {
  const game = readFileSync(
    resolve(process.cwd(), "components/millionaire/MillionaireGame.tsx"),
    "utf8",
  );
  const questionCard = readFileSync(
    resolve(process.cwd(), "components/millionaire/QuestionCard.tsx"),
    "utf8",
  );
  const quiz = readFileSync(
    resolve(process.cwd(), "components/quiz/QuizGame.tsx"),
    "utf8",
  );
  const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
  const ladder = readFileSync(
    resolve(process.cwd(), "components/millionaire/StageLadder.tsx"),
    "utf8",
  );

  assert(game.includes("MILLIONAIRE_ACTIVITY_DISPLAY_NAME"), "ui: canonical activity name");
  assert(!game.includes("เกมพิชิต 10 ด่าน"), "ui: competing title removed");
  assert(game.includes("เริ่มพิชิตด่าน"), "ui: explicit start remains");
  assert(game.includes("เงินรางวัลในเกม"), "ui: prize ladder label");
  assert(game.includes("MILLIONAIRE_FINAL_DISPLAY_PRIZE"), "ui: final prize display");
  assert(!game.includes("setTimeout"), "ui: auto-advance timer removed");
  assert(!game.includes(", 700)"), "ui: 700ms delay removed");
  assert(questionCard.includes("ไปด่านต่อไป"), "ui: explicit continue");
  assert(questionCard.includes("ดูผลเกม"), "ui: final continue label");
  assert(questionCard.includes("gfaGameQuestion"), "ui: game-scoped question shell");
  assert(
    !questionCard.includes("millionaireQuestion"),
    "ui: question card does not reuse Quiz class",
  );
  assert(quiz.includes('className="millionaireQuestion card"'), "quiz: question class unchanged");
  assert(quiz.includes("ถัดไป"), "quiz: next label unchanged");
  assert(!quiz.includes("ไปด่านต่อไป"), "quiz: no game continue copy");
  assert(!quiz.includes("gfaGame"), "quiz: no game-scoped classes");
  assert(
    css.includes(
      ".millionaireChoice{width:100%;min-height:52px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:#fff;font-weight:700;text-align:left;cursor:pointer;transition:background .15s ease,border-color .15s ease}",
    ),
    "css: shared choice rule frozen",
  );
  assert(css.includes(".gfaGameShell"), "css: game shell scoped");
  assert(css.includes(".gfaStageLadder"), "css: journey ladder scoped");
  assert(css.includes(".gfaAdventureMap"), "css: intro adventure map scoped");
  assert(css.includes(".gfaStagePrize"), "css: prize ladder labels");
  assert(ladder.includes("formatGamePrize"), "ladder: prize labels rendered");
  assert(ladder.includes("getStagePrize"), "ladder: stage prize lookup");
}

export function verifyActivitySelectionUxScoped(): void {
  const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
  const quizBlock = css.slice(
    css.indexOf(".gfaQuizWorld {"),
    css.indexOf(".gfaQuizArtboard {"),
  );
  const millionaireBlock = css.slice(
    css.indexOf(".gfaMillionaireWorld {"),
    css.indexOf(".gfaMillionaireArtboard {"),
  );
  const flashBlock = css.slice(
    css.indexOf(".gfaMemoryGarden {"),
    css.indexOf(".gfaMemoryGardenInner {"),
  );
  assert(quizBlock.includes("user-select: none"), "select: quiz world blocks accidental selection");
  assert(
    millionaireBlock.includes("user-select: none"),
    "select: millionaire world blocks accidental selection",
  );
  assert(flashBlock.includes("user-select: none"), "select: flash garden blocks accidental selection");
  assert(!css.includes("* {\n  user-select: none"), "select: no global * user-select none");
  assert(!css.includes("body {\n  user-select: none"), "select: learn/body selection preserved");
}

export function verifyQuizWorldViewportFill(): void {
  const world = readFileSync(
    resolve(process.cwd(), "components/student-ui/GfaQuizWorld.tsx"),
    "utf8",
  );
  const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
  assert(
    world.indexOf("gfaQuizWorldArt") < world.indexOf("gfaQuizArtboard"),
    "quiz: world art sits outside artboard",
  );
  const artBlock = css.slice(
    css.indexOf(".gfaQuizWorldArt {"),
    css.indexOf(".gfaQuizWorldArt .gfaArtSlot {"),
  );
  assert(artBlock.includes("inset: 0"), "quiz: world art covers full viewport container");
  assert(css.includes(".gfaQuizCardArea"), "quiz: panel area preserved");
}

export function runStageLadderVerification(): void {
  verifyLadderStageCount();
  verifyPrizeLadderPresentation();
  verifyInitialStageState();
  verifyCorrectFirstStage();
  verifyIncorrectFirstStage();
  verifyFinalStage();
  verifyExplicitContinueOnly();
  verifyAllTenQuestionsRequired();
  verifyResultScoreUnchanged();
  verifyReplayResetsStages();
  verifyMillionaireGameSourceBoundary();
  verifyActivitySelectionUxScoped();
  verifyQuizWorldViewportFill();
}
