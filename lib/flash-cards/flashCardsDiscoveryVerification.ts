import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LEARNER_LAUNCHABLE_LESSON_SLUGS } from "@/lib/analytics/learnerLessonLaunch";
import { isLessonComplete } from "@/lib/analytics/lessonProgress";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildLearningSummary } from "@/lib/analytics/summary";
import { ACTIVITY_DEFAULTS } from "@/lib/assessment";
import {
  FLASH_CARD_DECK_SIZE,
} from "@/lib/flash-cards";
import {
  FLASH_CARDS_REVIEW_ENTRY,
  FLASH_CARDS_REVIEW_ENTRY_ACTIVITY_ID,
  FLASH_CARDS_REVIEW_ENTRY_LESSON_SLUG,
  getFlashCardsReviewEntryHref,
} from "@/lib/flash-cards/reviewEntry";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import { GAME_STAGE_COUNT } from "@/lib/millionaire/stageLadder";
import { getQuestionBank } from "@/lib/question-bank";
import { getActivityPath } from "@/lib/routes";
import type { AggregatableLearningEvent, LearningSummary } from "@/types/analytics";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function emptySummary(): LearningSummary {
  return {
    totalActivities: 0,
    quizAttempts: 0,
    millionaireAttempts: 0,
    flashCardAttempts: 0,
    averageQuizScore: 0,
    averageMillionaireScore: 0,
    flashEasy: 0,
    flashMedium: 0,
    flashHard: 0,
  };
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

export function runFlashCardsDiscoveryVerification(): void {
  const home = read("components/student/StudentLearningHome.tsx");
  const entry = read("components/flash-cards/FlashCardsReviewEntry.tsx");
  const resumeCard = read("components/dashboard/ResumeLearningCard.tsx");
  const dashboard = read("components/dashboard/StudentDashboard.tsx");
  const companion = read("components/classroom-companion/ClassroomCompanion.tsx");
  const bank = getQuestionBank("present-simple");
  const href = getFlashCardsReviewEntryHref();

  assert(home.includes("FlashCardsReviewEntry"), "A: Student Home hosts Flash entry");
  assert(
    home.indexOf("ResumeLearningCard") < home.indexOf("FlashCardsReviewEntry"),
    "A: Flash entry is below Resume",
  );
  assert(entry.includes("button secondary"), "A: Flash CTA is secondary");
  assert(resumeCard.includes("button primary"), "A: Resume stays primary");

  assert(
    href === "/lesson/present-simple/activity/flash-cards",
    "B: CTA href",
  );
  assert(
    href ===
      getActivityPath(
        FLASH_CARDS_REVIEW_ENTRY_LESSON_SLUG,
        FLASH_CARDS_REVIEW_ENTRY_ACTIVITY_ID,
      ),
    "B: href uses activity path helper",
  );

  assert(FLASH_CARDS_REVIEW_ENTRY.title === "Flash Cards", "C: title");
  assert(entry.includes("{FLASH_CARDS_REVIEW_ENTRY.title}"), "C: UI title");
  assert(FLASH_CARDS_REVIEW_ENTRY.subtitle === "ทบทวนเพิ่มเติม", "D: subtitle");
  assert(FLASH_CARDS_REVIEW_ENTRY.optionalLabel === "ไม่บังคับ", "E: optional");
  assert(FLASH_CARDS_REVIEW_ENTRY.support.includes("12 การ์ด"), "F: 12 cards");
  assert(FLASH_CARDS_REVIEW_ENTRY.support.includes("ไม่มีคะแนน"), "G: no score");
  assert(FLASH_CARDS_REVIEW_ENTRY.ctaLabel === "เริ่มทบทวน", "H: CTA");

  assert(home.includes("ResumeLearningCard"), "I/J: Resume remains");
  assert(!home.includes("FlashCardsReviewEntry") || home.includes("ResumeLearningCard"), "I: Quiz/Millionaire Resume kept");
  assert(!entry.includes("ทำ Quiz"), "I: Flash entry is not Quiz");
  assert(!entry.includes("Millionaire Challenge"), "J: Flash entry is not Millionaire");
  assert(!entry.includes("70"), "I: no 70");
  assert(!entry.includes("85"), "I: no 85");
  assert(!entry.includes("ต้องทำ"), "optional copy");
  assert(!entry.includes("ขั้นถัดไป"), "optional copy");
  assert(!entry.includes("ทำให้ครบ"), "optional copy");

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
  ];
  assert(isLessonComplete(completeEvents, "present-simple"), "K: COMPLETE unchanged");
  const completeResume = buildResumeLearning(
    emptySummary(),
    completeEvents,
  );
  assert(completeResume.action.actionType === "SUMMARY", "K: Resume stays SUMMARY");
  assert(
    completeResume.title === "เรียน Present Simple ครบแล้ว",
    "K: 56C complete title",
  );
  assert(resumeCard.includes("PILOT_COMPLETE_TITLE"), "K: COMPLETE card untouched");
  assert(!entry.includes("PILOT_COMPLETE_TITLE"), "K: Flash does not own COMPLETE");
  assert(!home.includes("isComplete ? null"), "L: Flash not hidden after COMPLETE");
  assert(
    !home.includes("actionType === \"SUMMARY\"") ||
      home.indexOf("FlashCardsReviewEntry") <
        home.indexOf('resumeLearning.action.actionType === "SUMMARY"'),
    "L: Flash entry is not gated on COMPLETE",
  );

  assert(
    !home.includes("/lesson/past-simple/activity/flash-cards"),
    "M: no Past Simple Flash href",
  );
  assert(
    FLASH_CARDS_REVIEW_ENTRY_LESSON_SLUG === "present-simple",
    "M: Present Simple only",
  );
  assert(
    FLASH_CARDS_REVIEW_ENTRY_ACTIVITY_ID === "flash-cards",
    "O: activity id",
  );
  assert(
    getActivityPath("present-simple", "flash-cards") ===
      "/lesson/present-simple/activity/flash-cards",
    "N: route unchanged",
  );
  assert(FLASH_CARD_DECK_SIZE === 12, "P: deck 12");
  assert(presentSimpleLesson.contentVersion === 2, "Q: contentVersion 2");
  assert(bank?.questions.length === 50, "R: quiz bank 50");
  assert(ACTIVITY_DEFAULTS.quiz.questionCount === 10, "S: quiz 10");
  assert(ACTIVITY_DEFAULTS.millionaire.questionCount === 10, "T: millionaire 10");
  assert(GAME_STAGE_COUNT === 10, "T: millionaire stages");
  assert(
    LEARNER_LAUNCHABLE_LESSON_SLUGS.join(",") === "present-simple",
    "M: 54D guard",
  );
  assert(!("flash-cards" in ACTIVITY_DEFAULTS), "57D: no stale flash defaults");
  assert(
    !dashboard.includes("FlashCardsReviewEntry"),
    "7: dashboard stays analytics",
  );
  assert(
    companion.includes("showActivityGrid={!isStudentLearn}"),
    "3: student Learn still hides ActivityGrid",
  );
}
