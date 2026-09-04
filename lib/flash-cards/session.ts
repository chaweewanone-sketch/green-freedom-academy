import type {
  FlashCard,
  FlashCardResult,
  FlashCardReview,
  FlashCardSession,
  RecallRating,
} from "@/types/recall";
import {
  FLASH_CARD_DECK_SIZE,
  getFlashCardDeck,
} from "./presentSimpleDeck";

export const FLASH_CARD_RECALL_LABELS: Record<RecallRating, string> = {
  easy: "จำได้",
  medium: "ยังไม่แน่ใจ",
  hard: "ต้องทบทวน",
};

export const FLASH_CARD_FAMILY_LABELS: Record<FlashCard["family"], string> = {
  meaning: "ความหมาย",
  recognition: "เติมคำ",
  transformation: "แปลงประโยค",
  question: "สร้างคำถาม",
};

export function shuffleFlashCards(cards: FlashCard[]): FlashCard[] {
  const pool = [...cards];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapWith]] = [pool[swapWith], pool[index]];
  }

  return pool;
}

function createFlashSessionId(): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `flash_${Date.now()}_${suffix}`;
}

export function createFlashCardSession(lessonSlug: string): FlashCardSession {
  const deck = getFlashCardDeck(lessonSlug);
  const cards =
    deck.length > 1 ? shuffleFlashCards(deck) : [...deck];

  return {
    sessionId: createFlashSessionId(),
    lessonSlug,
    cards,
    createdAt: Date.now(),
  };
}

export function nextFlashCardSessionKey(current: number): number {
  return current + 1;
}

export function countRecallRatings(reviews: FlashCardReview[]): {
  easy: number;
  medium: number;
  hard: number;
} {
  return {
    easy: reviews.filter((review) => review.rating === "easy").length,
    medium: reviews.filter((review) => review.rating === "medium").length,
    hard: reviews.filter((review) => review.rating === "hard").length,
  };
}

export function getWeakReviewedCards(
  cards: FlashCard[],
  reviews: FlashCardReview[],
): FlashCard[] {
  const weakIds = new Set(
    reviews
      .filter((review) => review.rating === "medium" || review.rating === "hard")
      .map((review) => review.questionId),
  );

  return cards.filter((card) => weakIds.has(card.id));
}

export function buildFlashCardResult(
  session: FlashCardSession,
  reviews: FlashCardReview[],
): FlashCardResult {
  const counts = countRecallRatings(reviews);

  return {
    sessionId: session.sessionId,
    activity: "flash-cards",
    totalCards: session.cards.length,
    reviewedCards: reviews.length,
    easy: counts.easy,
    medium: counts.medium,
    hard: counts.hard,
    reviews,
    completedAt: Date.now(),
  };
}

export { FLASH_CARD_DECK_SIZE };
