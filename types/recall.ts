export type RecallRating = "easy" | "medium" | "hard";

export type FlashCardFamily =
  | "meaning"
  | "recognition"
  | "transformation"
  | "question";

export type FlashCardSection = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface FlashCard {
  id: string;
  lessonSlug: string;
  front: string;
  back: string;
  cue?: string;
  family: FlashCardFamily;
  section: FlashCardSection;
}

export interface FlashCardReview {
  questionId: string;
  rating: RecallRating;
  reviewedAt: number;
}

export interface FlashCardResult {
  sessionId: string;
  activity: "flash-cards";
  totalCards: number;
  reviewedCards: number;
  easy: number;
  medium: number;
  hard: number;
  reviews: FlashCardReview[];
  completedAt: number;
}

export interface FlashCardSession {
  sessionId: string;
  lessonSlug: string;
  cards: FlashCard[];
  createdAt: number;
}
