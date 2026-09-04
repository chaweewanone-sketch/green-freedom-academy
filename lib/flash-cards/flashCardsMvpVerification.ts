import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LEARNER_LAUNCHABLE_LESSON_SLUGS } from "@/lib/analytics/learnerLessonLaunch";
import { isLessonComplete } from "@/lib/analytics/lessonProgress";
import { buildLearningSummary } from "@/lib/analytics/summary";
import { ACTIVITY_DEFAULTS } from "@/lib/assessment";
import {
  FLASH_CARD_DECK_SIZE,
  FLASH_CARD_RECALL_LABELS,
  PRESENT_SIMPLE_FLASH_CARDS,
  buildFlashCardResult,
  createFlashCardSession,
  getFlashCardDeck,
  getWeakReviewedCards,
  shuffleFlashCards,
} from "@/lib/flash-cards";
import {
  LEARNING_HISTORY_STORAGE_KEY,
  MemoryLearningHistoryRepository,
  recordActivityCompletion,
} from "@/lib/history";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import { GAME_STAGE_COUNT } from "@/lib/millionaire/stageLadder";
import { getQuestionBank } from "@/lib/question-bank";
import { getActivityPath } from "@/lib/routes";
import type { AggregatableLearningEvent } from "@/types/analytics";
import type { FlashCardReview } from "@/types/recall";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function makeEvent(
  overrides: Partial<AggregatableLearningEvent> &
    Pick<AggregatableLearningEvent, "activity" | "lessonSlug">,
): AggregatableLearningEvent {
  return {
    sessionId: overrides.sessionId ?? "session",
    completedAt: overrides.completedAt ?? 1,
    activity: overrides.activity,
    lessonSlug: overrides.lessonSlug,
    scorePercentage: overrides.scorePercentage,
    flashEasy: overrides.flashEasy,
    flashMedium: overrides.flashMedium,
    flashHard: overrides.flashHard,
  };
}

export function runFlashCardsMvpVerification(): void {
  const deck = getFlashCardDeck("present-simple");
  const ids = deck.map((card) => card.id);
  const game = read("components/flash-cards/FlashCardsGame.tsx");
  const page = read("app/lesson/[slug]/activity/[activity]/page.tsx");
  const player = read("components/activities/StudentActivityPlayer.tsx");
  const quizBank = read("lib/question-bank/present-simple.ts");
  const bank = getQuestionBank("present-simple");

  assert(FLASH_CARD_DECK_SIZE === 12, "B: deck size 12");
  assert(deck.length === 12, "B: authored deck 12");
  assert(PRESENT_SIMPLE_FLASH_CARDS.length === 12, "B: constant 12");
  assert(new Set(ids).size === 12, "C: unique ids");
  assert(
    !game.includes("session.questions") && !game.includes("correctChoiceId"),
    "A: player does not use Quiz questions",
  );
  assert(!game.includes("createAssessmentSession"), "A: player does not mint Quiz sessions");
  assert(page.includes('activityId === "flash-cards"'), "A: dedicated Flash branch");
  assert(
    page.indexOf('if (activityId === "flash-cards")') <
      page.indexOf("createAssessmentSession(lesson, activityId)"),
    "A: Flash branch runs before Quiz session factory",
  );
  assert(page.includes("gfaFlashPage"), "Q: dedicated Flash page class");
  assert(
    !deck.some((card) => "choices" in card) &&
      deck.every((card) => Boolean(card.front) && Boolean(card.back)),
    "E: no MCQ structure",
  );
  assert(
    !deck.some(
      (card) =>
        card.front.includes("Choose the correct") ||
        card.front.includes("Which sentence is correct"),
    ),
    "E: no MCQ wording",
  );
  const families = new Set(deck.map((card) => card.family));
  assert(families.has("meaning"), "F: meaning");
  assert(families.has("recognition"), "F: recognition");
  assert(families.has("transformation"), "F: transformation");
  assert(families.has("question"), "F: question");
  const sections = new Set(deck.map((card) => card.section));
  [1, 2, 3, 4, 5, 6, 7].forEach((section) => {
    assert(sections.has(section as 1 | 2 | 3 | 4 | 5 | 6 | 7), `G: section ${section}`);
  });
  assert(
    deck.every((card) => card.section >= 1 && card.section <= 7),
    "G: sections 1–7 only",
  );
  assert(FLASH_CARD_RECALL_LABELS.easy === "จำได้", "H: จำได้ → easy");
  assert(FLASH_CARD_RECALL_LABELS.medium === "ยังไม่แน่ใจ", "H: ยังไม่แน่ใจ → medium");
  assert(FLASH_CARD_RECALL_LABELS.hard === "ต้องทบทวน", "H: ต้องทบทวน → hard");
  assert(game.includes("FLASH_CARD_RECALL_LABELS"), "H: player uses shared labels");
  const sessionSource = read("lib/flash-cards/session.ts");
  assert(sessionSource.includes('easy: "จำได้"'), "H: stored key easy");
  assert(sessionSource.includes('medium: "ยังไม่แน่ใจ"'), "H: stored key medium");
  assert(sessionSource.includes('hard: "ต้องทบทวน"'), "H: stored key hard");
  assert(game.includes("เปิดคำตอบ"), "8: reveal CTA");
  assert(game.includes('type="button"'), "16: real buttons");
  assert(game.includes('aria-live="polite"'), "16: reveal live region");
  assert(game.includes("คำตอบ"), "16: revealed answer label");
  assert(!game.includes("JOURNEY_THRESHOLDS"), "I: no journey thresholds");
  assert(!game.includes("pass/fail") && !game.includes("70%") && !game.includes("85%"), "I: no pass/fail");
  assert(game.includes("ไม่มีคะแนน"), "I: no-score copy");
  assert(game.includes("ทบทวนอีกครั้ง"), "N: weak review CTA");
  assert(game.includes("ทบทวนครบแล้ว"), "O: all-easy copy");
  assert(game.includes("เล่นใหม่ทั้งสำรับ"), "P: full replay CTA");
  assert(game.includes("nextFlashCardSessionKey"), "P: fresh session key");
  assert(player.includes("FlashCardsGame"), "Q: player still hosts Flash");
  assert(getActivityPath("present-simple", "flash-cards") === "/lesson/present-simple/activity/flash-cards", "Q: route");
  assert(page.includes('activityId === "flash-cards"'), "R: activity id");

  const authoredFirstId = PRESENT_SIMPLE_FLASH_CARDS[0]?.id;
  shuffleFlashCards(PRESENT_SIMPLE_FLASH_CARDS);
  assert(
    PRESENT_SIMPLE_FLASH_CARDS[0]?.id === authoredFirstId,
    "P: shuffle does not mutate authored deck",
  );
  assert(
    LEARNING_HISTORY_STORAGE_KEY === "gfa.learningHistory.v1",
    "J: history version unchanged",
  );
  const session = createFlashCardSession("present-simple");
  assert(session.cards.length === 12, "P: shuffled session 12");
  assert(session.lessonSlug === "present-simple", "session lesson");
  assert(session.sessionId.startsWith("flash_"), "P: flash session id");
  const second = createFlashCardSession("present-simple");
  assert(session.sessionId !== second.sessionId, "P: replay mints new session id");
  assert(
    [...session.cards.map((card) => card.id)].sort().join(",") ===
      [...ids].sort().join(","),
    "P: replay still the same 12 cards",
  );

  const mixedReviews: FlashCardReview[] = [
    { questionId: deck[0].id, rating: "easy", reviewedAt: 1 },
    { questionId: deck[1].id, rating: "medium", reviewedAt: 2 },
    { questionId: deck[2].id, rating: "hard", reviewedAt: 3 },
  ];
  const weak = getWeakReviewedCards(deck, mixedReviews);
  assert(weak.length === 2, "N: weak subset = medium+hard");
  assert(weak.every((card) => card.id === deck[1].id || card.id === deck[2].id), "N: weak ids");
  const allEasy = getWeakReviewedCards(
    deck,
    deck.map((card, index) => ({
      questionId: card.id,
      rating: "easy" as const,
      reviewedAt: index,
    })),
  );
  assert(allEasy.length === 0, "O: no weak cards when all easy");

  const flashSession = createFlashCardSession("present-simple");
  const fullReviews: FlashCardReview[] = flashSession.cards.map((card, index) => ({
    questionId: card.id,
    rating: index < 8 ? "easy" : index < 10 ? "medium" : "hard",
    reviewedAt: index,
  }));
  const result = buildFlashCardResult(flashSession, fullReviews);
  assert(result.activity === "flash-cards", "R: activity id");
  assert(result.easy === 8 && result.medium === 2 && result.hard === 2, "H: counts");
  const repository = new MemoryLearningHistoryRepository();
  recordActivityCompletion({
    result,
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: {
      sessionId: "quiz-1",
      activity: "quiz",
      score: 9,
      correct: 9,
      incorrect: 1,
      percentage: 90,
      completedAt: 10,
    },
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: {
      sessionId: "millionaire-1",
      activity: "millionaire",
      score: 9,
      correct: 9,
      incorrect: 1,
      percentage: 90,
      completedAt: 11,
    },
    lessonSlug: "present-simple",
    repository,
  });
  const summary = buildLearningSummary(
    repository.getAll() as AggregatableLearningEvent[],
  );
  assert(summary.flashCardAttempts === 1, "J: flash attempts");
  assert(summary.flashEasy === 8, "J: flashEasy");
  assert(summary.flashMedium === 2, "J: flashMedium");
  assert(summary.flashHard === 2, "J: flashHard");
  assert(summary.averageQuizScore === 90, "K: Quiz average unchanged by Flash counts");
  assert(summary.averageMillionaireScore === 90, "L: Millionaire average unchanged");

  const completeEvents = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 1,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 2,
    }),
    makeEvent({
      sessionId: result.sessionId,
      activity: "flash-cards",
      lessonSlug: "present-simple",
      completedAt: 3,
      flashEasy: 1,
      flashMedium: 2,
      flashHard: 9,
    }),
  ];
  assert(isLessonComplete(completeEvents, "present-simple"), "M: COMPLETE not revoked");

  assert(presentSimpleLesson.contentVersion === 2, "S: contentVersion 2");
  assert(bank?.questions.length === 50, "T: quiz bank 50");
  assert(ACTIVITY_DEFAULTS.quiz.questionCount === 10, "U: quiz 10");
  assert(ACTIVITY_DEFAULTS.millionaire.questionCount === 10, "V: millionaire 10");
  assert(
    !("flash-cards" in ACTIVITY_DEFAULTS),
    "A: no stale flash-cards activity defaults",
  );
  assert(GAME_STAGE_COUNT === 10, "V: millionaire stages");
  assert(
    LEARNER_LAUNCHABLE_LESSON_SLUGS.join(",") === "present-simple",
    "W: 54D guard",
  );
  assert(!quizBank.includes("present-simple-flash-1"), "A: quiz bank has no Flash ids");
  assert(getFlashCardDeck("past-simple").length === 0, "W: no Past Simple deck");
}
