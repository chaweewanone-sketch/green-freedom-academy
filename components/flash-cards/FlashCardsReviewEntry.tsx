import Link from "next/link";
import {
  FLASH_CARDS_REVIEW_ENTRY,
  getFlashCardsReviewEntryHref,
} from "@/lib/flash-cards/reviewEntry";

export function FlashCardsReviewEntry() {
  const href = getFlashCardsReviewEntryHref();

  return (
    <section
      className="panel studentDashboardSection flashCardsReviewEntry"
      aria-label="Flash Cards ทบทวนเพิ่มเติม ไม่บังคับ"
    >
      <div className="flashCardsReviewEntryHeader">
        <span className="eyebrow">OPTIONAL REVIEW</span>
        <span className="flashCardsReviewEntryBadge">
          {FLASH_CARDS_REVIEW_ENTRY.optionalLabel}
        </span>
      </div>
      <h2>{FLASH_CARDS_REVIEW_ENTRY.title}</h2>
      <p className="flashCardsReviewEntrySubtitle">
        {FLASH_CARDS_REVIEW_ENTRY.subtitle}
      </p>
      <p className="flashCardsReviewEntrySupport">
        {FLASH_CARDS_REVIEW_ENTRY.support}
      </p>
      <div className="actions">
        <Link
          className="button secondary"
          href={href}
          aria-label={`${FLASH_CARDS_REVIEW_ENTRY.ctaLabel} ${FLASH_CARDS_REVIEW_ENTRY.title}`}
        >
          {FLASH_CARDS_REVIEW_ENTRY.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
