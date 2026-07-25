"use client";

import Link from "next/link";
import { useState } from "react";
import type { AssessmentSession } from "@/lib/assessment";
import type {
  FlashCardResult,
  FlashCardReview,
  RecallRating,
} from "@/types/recall";
import type { Question } from "@/types/question";

type FlashCardsGameProps = {
  session: AssessmentSession;
};

type FlashCardsPhase = "intro" | "card" | "summary";

const recallLabels: Record<
  RecallRating,
  { label: string; meaning: string }
> = {
  easy: { label: "Easy", meaning: "จำได้คล่อง" },
  medium: { label: "Medium", meaning: "ยังต้องทบทวน" },
  hard: { label: "Hard", meaning: "ควรฝึกซ้ำ" },
};

function getCorrectAnswerText(question: Question): string {
  const correctChoice = question.choices.find(
    (choice) => choice.id === question.correctChoiceId,
  );

  return correctChoice?.text ?? question.correctChoiceId;
}

function buildFlashCardResult(
  session: AssessmentSession,
  reviews: FlashCardReview[],
): FlashCardResult {
  const easy = reviews.filter((review) => review.rating === "easy").length;
  const medium = reviews.filter((review) => review.rating === "medium").length;
  const hard = reviews.filter((review) => review.rating === "hard").length;

  return {
    sessionId: session.sessionId,
    activity: "flash-cards",
    totalCards: session.questions.length,
    reviewedCards: reviews.length,
    easy,
    medium,
    hard,
    reviews,
    completedAt: Date.now(),
  };
}

function ratingPercent(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

export function FlashCardsGame({ session }: FlashCardsGameProps) {
  const cards = session.questions;
  const totalCards = cards.length;
  const lessonPath = `/lesson/${session.lessonSlug}`;

  const [phase, setPhase] = useState<FlashCardsPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviews, setReviews] = useState<FlashCardReview[]>([]);
  const [result, setResult] = useState<FlashCardResult | null>(null);

  const currentCard = cards[currentIndex];
  const progressPercent =
    totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0;

  function startReview() {
    if (totalCards === 0) {
      return;
    }

    setPhase("card");
    setCurrentIndex(0);
    setRevealed(false);
    setReviews([]);
    setResult(null);
  }

  function restartReview() {
    startReview();
    setPhase("intro");
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
      setReviews(nextReviews);
      setResult(buildFlashCardResult(session, nextReviews));
      setPhase("summary");
      return;
    }

    setReviews(nextReviews);
    setCurrentIndex((prev) => prev + 1);
    setRevealed(false);
  }

  if (phase === "intro") {
    return (
      <section className="flashCardsGame panel">
        <span className="eyebrow">FLASH CARDS</span>
        <h1>Flash Cards</h1>
        {totalCards > 0 ? (
          <>
            <p className="millionaireIntro">
              ลองนึกคำตอบด้วยตนเองก่อนเปิดเฉลย
              แล้วประเมินว่าจำได้ง่าย ปานกลาง หรือยาก
            </p>
            <p className="millionaireIntro">
              ทบทวน {session.selectedCount} การ์ด
            </p>
            <div className="flashCardActions">
              <button
                type="button"
                className="button primary"
                onClick={startReview}
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
            <p className="millionaireIntro">
              ไม่มีการ์ดที่ตรงกับเงื่อนไขสำหรับบทเรียนนี้
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
    return (
      <section className="flashCardsGame panel flashCardsSummary">
        <span className="eyebrow">SESSION SUMMARY</span>
        <h2>สรุปการทบทวน</h2>
        <p className="millionaireResultScore">
          ทบทวนครบ <strong>{result.reviewedCards}</strong> / {result.totalCards}{" "}
          การ์ด
        </p>
        <dl className="activityPlaceholderMeta quizResultMeta">
          <div>
            <dt>Easy ({ratingPercent(result.easy, result.reviewedCards)}%)</dt>
            <dd>
              {result.easy} · {recallLabels.easy.meaning}
            </dd>
          </div>
          <div>
            <dt>
              Medium ({ratingPercent(result.medium, result.reviewedCards)}%)
            </dt>
            <dd>
              {result.medium} · {recallLabels.medium.meaning}
            </dd>
          </div>
          <div>
            <dt>Hard ({ratingPercent(result.hard, result.reviewedCards)}%)</dt>
            <dd>
              {result.hard} · {recallLabels.hard.meaning}
            </dd>
          </div>
        </dl>
        <div className="millionaireResultActions">
          <button
            type="button"
            className="button primary"
            onClick={restartReview}
          >
            เริ่มใหม่
          </button>
          <Link className="button secondary" href={lessonPath}>
            กลับไปบทเรียน
          </Link>
        </div>
      </section>
    );
  }

  if (!currentCard) {
    return (
      <section className="flashCardsGame panel">
        <span className="eyebrow">FLASH CARDS</span>
        <h1>Flash Cards</h1>
        <p className="millionaireIntro">
          ไม่มีการ์ดที่ตรงกับเงื่อนไขสำหรับบทเรียนนี้
        </p>
        <Link className="button secondary" href={lessonPath}>
          กลับไปบทเรียน
        </Link>
      </section>
    );
  }

  const correctAnswerText = getCorrectAnswerText(currentCard);

  return (
    <section className="flashCardsGame">
      <div className="millionaireProgress">
        <div className="millionaireProgressMeta">
          <span>
            {currentIndex + 1} / {totalCards}
          </span>
          <span>
            ทบทวนแล้ว <strong>{reviews.length}</strong>
          </span>
        </div>
        <div
          className="progress millionaireProgressBar"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="ความคืบหน้าการทบทวน"
        >
          <div style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <article
        className={`flashCard card ${revealed ? "flashCardRevealed" : "flashCardHidden"}`}
      >
        <span className="eyebrow">FLASH CARDS · ACTIVE RECALL</span>
        <h2 className="flashCardPrompt">{currentCard.prompt}</h2>
        {currentCard.grammarPoint && (
          <p className="flashCardSupport">{currentCard.grammarPoint}</p>
        )}

        {!revealed ? (
          <>
            <p className="flashCardRecallHint">
              ลองนึกคำตอบในใจก่อน แล้วกดเปิดเฉลยเมื่อพร้อม
            </p>
            <button
              type="button"
              className="button primary"
              onClick={handleReveal}
            >
              เปิดเฉลย
            </button>
          </>
        ) : (
          <>
            <div className="flashCardAnswer" aria-live="polite">
              <span className="flashCardAnswerLabel">คำตอบ</span>
              <p>{correctAnswerText}</p>
            </div>
            {currentCard.explanation.trim().length > 0 && (
              <div className="millionaireExplanation planningTip">
                {currentCard.explanation}
              </div>
            )}
            <p className="flashCardRecallHint">
              ประเมินว่าจำคำตอบนี้ได้แค่ไหน
            </p>
            <div className="recallRatingActions" role="group" aria-label="ประเมินการจำ">
              {(["easy", "medium", "hard"] as const).map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className={`recallRatingButton recallRating${rating.charAt(0).toUpperCase()}${rating.slice(1)}`}
                  onClick={() => handleRating(rating)}
                >
                  {recallLabels[rating].label}
                  <small>{recallLabels[rating].meaning}</small>
                </button>
              ))}
            </div>
          </>
        )}
      </article>
    </section>
  );
}
