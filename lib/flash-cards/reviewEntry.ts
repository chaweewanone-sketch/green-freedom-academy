import { getActivityPath } from "@/lib/routes";
import { FLASH_CARD_DECK_SIZE } from "./presentSimpleDeck";

export const FLASH_CARDS_REVIEW_ENTRY_LESSON_SLUG = "present-simple";
export const FLASH_CARDS_REVIEW_ENTRY_ACTIVITY_ID = "flash-cards";

export const FLASH_CARDS_REVIEW_ENTRY = {
  title: "Flash Cards",
  subtitle: "ทบทวนเพิ่มเติม",
  support: `${FLASH_CARD_DECK_SIZE} การ์ด · ไม่มีคะแนน`,
  optionalLabel: "ไม่บังคับ",
  ctaLabel: "เริ่มทบทวน",
} as const;

export function getFlashCardsReviewEntryHref(): string {
  return getActivityPath(
    FLASH_CARDS_REVIEW_ENTRY_LESSON_SLUG,
    FLASH_CARDS_REVIEW_ENTRY_ACTIVITY_ID,
  );
}
