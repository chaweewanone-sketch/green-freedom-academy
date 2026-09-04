"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MemoryGarden } from "./MemoryGarden";
import {
  FLASH_CARD_DECK_SIZE,
  FLASH_CARD_FAMILY_LABELS,
  FLASH_CARD_RECALL_LABELS,
  buildFlashCardResult,
  createFlashCardSession,
  getWeakReviewedCards,
  nextFlashCardSessionKey,
} from "@/lib/flash-cards";
import { getStudentPath } from "@/lib/routes";
import type {
  FlashCard,
  FlashCardResult,
  FlashCardReview,
  FlashCardSession,
  RecallRating,
} from "@/types/recall";

type FlashCardsGameProps = {
  lessonSlug: string;
  lessonTitle: string;
  lessonPath: string;
  onComplete?: (result: FlashCardResult) => void;
};

type FlashCardsPhase = "intro" | "card" | "summary";
type FlashCardsPass = "full" | "weak";

const RATING_ORDER: RecallRating[] = ["easy", "medium", "hard"];

function FlashCardsAttempt({
  lessonSlug,
  lessonTitle,
  lessonPath,
  onComplete,
  onRequestFreshSession,
}: FlashCardsGameProps & { onRequestFreshSession: () => void }) {
  const sessionRef = useRef<FlashCardSession | null>(null);
  if (!sessionRef.current) {
    sessionRef.current = createFlashCardSession(lessonSlug);
  }
  const session = sessionRef.current;
  const totalDeck = session.cards.length;
  const hasRecordedCompletionRef = useRef(false);
  const firstRatingRef = useRef<HTMLButtonElement>(null);
  const promptRef = useRef<HTMLHeadingElement>(null);

  const [phase, setPhase] = useState<FlashCardsPhase>("intro");
  const [pass, setPass] = useState<FlashCardsPass>("full");
  const [passCards, setPassCards] = useState<FlashCard[]>(session.cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviews, setReviews] = useState<FlashCardReview[]>([]);
  const [result, setResult] = useState<FlashCardResult | null>(null);

  const currentCard = passCards[currentIndex];
  const totalCards = passCards.length;
  const weakCards = result ? getWeakReviewedCards(session.cards, result.reviews) : [];

  useEffect(() => {
    if (phase !== "card") {
      return;
    }

    if (revealed) {
      firstRatingRef.current?.focus();
      return;
    }

    promptRef.current?.focus();
  }, [phase, currentIndex, revealed]);

  function startFullPass() {
    if (session.cards.length === 0) {
      return;
    }

    setPass("full");
    setPassCards(session.cards);
    setPhase("card");
    setCurrentIndex(0);
    setRevealed(false);
    setReviews([]);
    setResult(null);
  }

  function startWeakPass() {
    if (!result) {
      return;
    }

    const nextCards = getWeakReviewedCards(session.cards, result.reviews);
    if (nextCards.length === 0) {
      return;
    }

    setPass("weak");
    setPassCards(nextCards);
    setPhase("card");
    setCurrentIndex(0);
    setRevealed(false);
    setReviews([]);
  }

  function handleReveal() {
    if (!currentCard || revealed) {
      return;
    }

    setRevealed(true);
  }

  function handleRating(rating: RecallRating) {
    if (!currentCard || !revealed) {
      return;
    }

    const alreadyReviewed = reviews.some(
      (review) => review.questionId === currentCard.id,
    );
    if (alreadyReviewed) {
      return;
    }

    const nextReview: FlashCardReview = {
      questionId: currentCard.id,
      rating,
      reviewedAt: Date.now(),
    };
    const nextReviews = [...reviews, nextReview];

    if (currentIndex >= totalCards - 1) {
      const nextResult = buildFlashCardResult(
        {
          ...session,
          cards: passCards,
        },
        nextReviews,
      );
      setReviews(nextReviews);
      setResult(nextResult);
      setPhase("summary");

      if (pass === "full" && !hasRecordedCompletionRef.current) {
        hasRecordedCompletionRef.current = true;
        onComplete?.(nextResult);
      }
      return;
    }

    setReviews(nextReviews);
    setCurrentIndex((previous) => previous + 1);
    setRevealed(false);
  }

  if (phase === "intro") {
    return (
      <section className="gfaMemoryGardenPanel">
        <span className="eyebrow">MEMORY GARDEN</span>
        <h1>Flash Cards</h1>
        <p className="gfaMemoryGardenSubtitle">
          ทบทวน {lessonTitle} แบบสบาย ๆ
        </p>
        {totalDeck > 0 ? (
          <>
            <p className="gfaMemoryGardenSupport">
              {FLASH_CARD_DECK_SIZE} การ์ด · ไม่มีคะแนน · ทบทวนตามจังหวะของตัวเอง
            </p>
            <div className="gfaMemoryGardenActions">
              <button
                type="button"
                className="button primary"
                onClick={startFullPass}
              >
                เริ่มทบทวน
              </button>
              <Link className="button secondary" href={lessonPath}>
                กลับไปบทเรียน
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="gfaMemoryGardenSupport">
              ยังไม่มีการ์ดทบทวนสำหรับบทเรียนนี้
            </p>
            <Link className="button secondary" href={lessonPath}>
              กลับไปบทเรียน
            </Link>
          </>
        )}
      </section>
    );
  }

  if (phase === "summary" && result) {
    const showWeakReview = weakCards.length > 0;

    return (
      <section className="gfaMemoryGardenPanel gfaMemoryGardenSummary">
        <span className="eyebrow">FLASH CARDS</span>
        <h1>Flash Cards</h1>
        <p className="gfaMemoryGardenCompleteLine">
          ทบทวนครบ {pass === "full" ? session.cards.length : result.reviewedCards} การ์ดแล้ว
        </p>
        {showWeakReview ? null : (
          <p className="gfaMemoryGardenDone">ทบทวนครบแล้ว 🎉</p>
        )}
        <dl className="gfaMemoryGardenCounts">
          <div>
            <dt>{FLASH_CARD_RECALL_LABELS.easy}</dt>
            <dd>{result.easy}</dd>
          </div>
          <div>
            <dt>{FLASH_CARD_RECALL_LABELS.medium}</dt>
            <dd>{result.medium}</dd>
          </div>
          <div>
            <dt>{FLASH_CARD_RECALL_LABELS.hard}</dt>
            <dd>{result.hard}</dd>
          </div>
        </dl>
        <div className="gfaMemoryGardenActions">
          {showWeakReview ? (
            <button
              type="button"
              className="button primary"
              onClick={startWeakPass}
            >
              ทบทวนอีกครั้ง
            </button>
          ) : null}
          <button
            type="button"
            className={showWeakReview ? "button secondary" : "button primary"}
            onClick={onRequestFreshSession}
          >
            เล่นใหม่ทั้งสำรับ
          </button>
          <Link className="button secondary" href={getStudentPath()}>
            กลับหน้าหลัก
          </Link>
        </div>
      </section>
    );
  }

  if (!currentCard) {
    return (
      <section className="gfaMemoryGardenPanel">
        <span className="eyebrow">FLASH CARDS</span>
        <h1>Flash Cards</h1>
        <p className="gfaMemoryGardenSupport">
          ยังไม่มีการ์ดทบทวนสำหรับบทเรียนนี้
        </p>
        <Link className="button secondary" href={lessonPath}>
          กลับไปบทเรียน
        </Link>
      </section>
    );
  }

  return (
    <section className="gfaMemoryGardenPlay">
      <p className="gfaMemoryGardenProgress" aria-live="polite">
        {currentIndex + 1} / {totalCards}
      </p>
      <article
        className={`gfaMemoryCard ${revealed ? "gfaMemoryCard-revealed" : "gfaMemoryCard-prompt"}`}
        aria-label={
          revealed
            ? `การ์ด ${currentIndex + 1} จาก ${totalCards} คำตอบ`
            : `การ์ด ${currentIndex + 1} จาก ${totalCards} คำถาม`
        }
      >
        <p className="gfaMemoryCardMeta">
          {FLASH_CARD_FAMILY_LABELS[currentCard.family]}
        </p>
        <h2
          ref={promptRef}
          className="gfaMemoryCardFront"
          tabIndex={-1}
        >
          {currentCard.front}
        </h2>
        {!revealed ? (
          <>
            <p className="gfaMemoryCardHint">ลองนึกคำตอบในใจก่อน แล้วค่อยเปิดดู</p>
            <button
              type="button"
              className="button primary"
              onClick={handleReveal}
            >
              เปิดคำตอบ
            </button>
          </>
        ) : (
          <>
            <div className="gfaMemoryCardBack" aria-live="polite">
              <span className="gfaMemoryCardBackLabel">คำตอบ</span>
              <p>{currentCard.back}</p>
              {currentCard.cue ? (
                <p className="gfaMemoryCardCue">{currentCard.cue}</p>
              ) : null}
            </div>
            <p className="gfaMemoryCardHint">ประเมินว่าจำได้แค่ไหน</p>
            <div
              className="gfaMemoryRatings"
              role="group"
              aria-label="ประเมินการจำ"
            >
              {RATING_ORDER.map((rating, ratingIndex) => (
                <button
                  key={rating}
                  ref={ratingIndex === 0 ? firstRatingRef : undefined}
                  type="button"
                  className={`gfaMemoryRating gfaMemoryRating-${rating}`}
                  onClick={() => handleRating(rating)}
                >
                  {FLASH_CARD_RECALL_LABELS[rating]}
                </button>
              ))}
            </div>
          </>
        )}
      </article>
    </section>
  );
}

export function FlashCardsGame({
  lessonSlug,
  lessonTitle,
  lessonPath,
  onComplete,
}: FlashCardsGameProps) {
  const [attemptKey, setAttemptKey] = useState(0);

  return (
    <MemoryGarden>
      <FlashCardsAttempt
        key={attemptKey}
        lessonSlug={lessonSlug}
        lessonTitle={lessonTitle}
        lessonPath={lessonPath}
        onComplete={onComplete}
        onRequestFreshSession={() => {
          setAttemptKey((current) => nextFlashCardSessionKey(current));
        }}
      />
    </MemoryGarden>
  );
}
