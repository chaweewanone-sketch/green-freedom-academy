export type RecallRating = "easy" | "medium" | "hard";

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
