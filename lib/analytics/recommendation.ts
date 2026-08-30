import { resolveActiveLesson } from "@/lib/analytics/activeLesson";
import {
  JOURNEY_ACTION_LABELS,
  isLearningEvent,
} from "@/lib/analytics/lessonProgress";
import { hasCurrentLearnCompletion } from "@/lib/history/learnVersion";
import { buildLearningSummaryForLesson } from "@/lib/analytics/summary";
import { getFirstCurriculumLesson, getLessonBySlug, getNextCurriculumLesson, hasLesson } from "@/lib/lessons";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import type {
  AggregatableLearningEvent,
  LearningRecommendation,
  LearningSummary,
  RecommendationReasonCode,
} from "@/types/analytics";

/** v1 policy thresholds — deterministic, not learned from student data. */
export const RECOMMENDATION_THRESHOLDS = {
  developingMin: 70,
  strongMin: 85,
  flashWeakReviewRatio: 0.5,
} as const;

export const DEFAULT_RECOMMENDATION_LESSON_SLUG =
  getFirstCurriculumLesson()?.slug ?? "present-simple";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFiniteNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function parseSummary(input: unknown): LearningSummary | null {
  if (!isRecord(input)) {
    return null;
  }

  return {
    totalActivities: readFiniteNumber(input.totalActivities),
    quizAttempts: readFiniteNumber(input.quizAttempts),
    millionaireAttempts: readFiniteNumber(input.millionaireAttempts),
    flashCardAttempts: readFiniteNumber(input.flashCardAttempts),
    averageQuizScore: readFiniteNumber(input.averageQuizScore),
    averageMillionaireScore: readFiniteNumber(input.averageMillionaireScore),
    flashEasy: readFiniteNumber(input.flashEasy),
    flashMedium: readFiniteNumber(input.flashMedium),
    flashHard: readFiniteNumber(input.flashHard),
    latestActivity: readOptionalString(input.latestActivity),
    latestLesson: readOptionalString(input.latestLesson),
  };
}

function resolveLessonSlug(slug?: string): string {
  if (slug && hasLesson(slug)) {
    return slug;
  }

  return DEFAULT_RECOMMENDATION_LESSON_SLUG;
}

function lessonTitle(lessonSlug: string): string {
  return getLessonBySlug(lessonSlug)?.title ?? "Present Simple";
}

function scoreBand(score: number): "weak" | "developing" | "strong" {
  if (score < RECOMMENDATION_THRESHOLDS.developingMin) {
    return "weak";
  }

  if (score < RECOMMENDATION_THRESHOLDS.strongMin) {
    return "developing";
  }

  return "strong";
}

function isWeakFlashRetention(summary: LearningSummary): boolean {
  const rated = summary.flashEasy + summary.flashMedium + summary.flashHard;
  if (rated <= 0) {
    return false;
  }

  return (
    (summary.flashMedium + summary.flashHard) / rated >=
    RECOMMENDATION_THRESHOLDS.flashWeakReviewRatio
  );
}

function recommendation(input: {
  kind: LearningRecommendation["kind"];
  title: string;
  message: string;
  lessonSlug: string;
  activity?: string;
  href: string;
  ctaLabel: string;
  reasonCode: RecommendationReasonCode;
}): LearningRecommendation {
  return input;
}

function startRecommendation(
  lessonSlug: string,
  reasonCode: RecommendationReasonCode = "EMPTY_HISTORY",
): LearningRecommendation {
  const title = lessonTitle(lessonSlug);

  return recommendation({
    kind: "START",
    title: `เริ่มเรียน ${title}`,
    message:
      "ยังไม่มีประวัติการเรียน เริ่มจากบทเรียนนี้ แล้วไปฝึก Quiz ตามลำดับ Learn → Practice → Game",
    lessonSlug,
    href: getLessonPath(lessonSlug),
    ctaLabel: JOURNEY_ACTION_LABELS.learn,
    reasonCode,
  });
}

function nextLessonRecommendation(lessonSlug: string): LearningRecommendation {
  const title = lessonTitle(lessonSlug);

  return recommendation({
    kind: "CONTINUE",
    title: `เรียน ${title}`,
    message: `บทถัดไป: ${title}`,
    lessonSlug,
    href: getLessonPath(lessonSlug),
    ctaLabel: JOURNEY_ACTION_LABELS.nextLesson,
    reasonCode: "MILLIONAIRE_STRONG",
  });
}

function curriculumCompleteRecommendation(
  lessonSlug: string,
): LearningRecommendation {
  return recommendation({
    kind: "CONTINUE",
    title: JOURNEY_ACTION_LABELS.complete,
    message: "เรียนครบบทที่มีแล้ว สามารถดูสรุปการเรียนได้",
    lessonSlug,
    href: getDashboardPath(),
    ctaLabel: JOURNEY_ACTION_LABELS.complete,
    reasonCode: "MILLIONAIRE_STRONG",
  });
}

function continueAfterStrongMillionaire(
  lessonSlug: string,
): LearningRecommendation {
  const nextLesson = getNextCurriculumLesson(lessonSlug);
  if (nextLesson) {
    return nextLessonRecommendation(nextLesson.slug);
  }

  return curriculumCompleteRecommendation(lessonSlug);
}

function practiceAfterLearnRecommendation(
  lessonSlug: string,
): LearningRecommendation {
  const title = lessonTitle(lessonSlug);

  return recommendation({
    kind: "PRACTICE",
    title: `พร้อมฝึก Quiz ${title}`,
    message: `เรียน ${title} แล้ว ไปทำ Quiz ได้`,
    lessonSlug,
    activity: "quiz",
    href: getActivityPath(lessonSlug, "quiz"),
    ctaLabel: JOURNEY_ACTION_LABELS.practiceQuiz,
    reasonCode: "LEARN_COMPLETE",
  });
}

function quizRecommendation(
  score: number,
  lessonSlug: string,
): LearningRecommendation {
  const band = scoreBand(score);
  const title = lessonTitle(lessonSlug);

  if (band === "weak") {
    return recommendation({
      kind: "RETRY",
      title: "ลอง Quiz อีกรอบ",
      message: `คะแนน Quiz เฉลี่ยยังต่ำกว่า ${RECOMMENDATION_THRESHOLDS.developingMin}% ทบทวน ${title} แล้วลอง Quiz ใหม่`,
      lessonSlug,
      activity: "quiz",
      href: getActivityPath(lessonSlug, "quiz"),
      ctaLabel: "ทำ Quiz อีกครั้ง",
      reasonCode: "QUIZ_WEAK",
    });
  }

  if (band === "developing") {
    return recommendation({
      kind: "PRACTICE",
      title: "ฝึก Quiz เพิ่มอีกนิด",
      message: "กำลังพัฒนาแล้ว ฝึก Quiz ต่อเพื่อให้มั่นใจก่อนไปเล่นเกม",
      lessonSlug,
      activity: "quiz",
      href: getActivityPath(lessonSlug, "quiz"),
      ctaLabel: "ฝึก Quiz",
      reasonCode: "QUIZ_DEVELOPING",
    });
  }

  return recommendation({
    kind: "PLAY",
    title: "พร้อมท้าทาย Millionaire แล้ว",
    message: "Quiz แข็งแรงแล้ว ลอง Millionaire Challenge ได้",
    lessonSlug,
    activity: "millionaire",
    href: getActivityPath(lessonSlug, "millionaire"),
    ctaLabel: "เล่น Millionaire",
    reasonCode: "QUIZ_STRONG",
  });
}

function millionaireRecommendation(
  score: number,
  lessonSlug: string,
): LearningRecommendation {
  const band = scoreBand(score);
  const title = lessonTitle(lessonSlug);

  if (band === "weak") {
    return recommendation({
      kind: "PRACTICE",
      title: "ฝึก Quiz ก่อนเล่นใหม่",
      message: `คะแนน Millionaire ยังต่ำกว่า ${RECOMMENDATION_THRESHOLDS.developingMin}% กลับไปฝึก Quiz หรือทบทวน ${title}`,
      lessonSlug,
      activity: "quiz",
      href: getActivityPath(lessonSlug, "quiz"),
      ctaLabel: "ฝึก Quiz",
      reasonCode: "MILLIONAIRE_WEAK",
    });
  }

  if (band === "developing") {
    return recommendation({
      kind: "RETRY",
      title: "ลอง Millionaire อีกรอบ",
      message: "กำลังพัฒนาแล้ว เล่น Millionaire อีกครั้งเพื่อเก็บความชำนาญ",
      lessonSlug,
      activity: "millionaire",
      href: getActivityPath(lessonSlug, "millionaire"),
      ctaLabel: "เล่นอีกครั้ง",
      reasonCode: "MILLIONAIRE_DEVELOPING",
    });
  }

  return continueAfterStrongMillionaire(lessonSlug);
}

function flashRecommendation(
  summary: LearningSummary,
  lessonSlug: string,
): LearningRecommendation {
  if (isWeakFlashRetention(summary)) {
    return recommendation({
      kind: "REVIEW",
      title: "ฝึก Flash Cards เพิ่มอีกนิด",
      message:
        "การ์ดระดับ Medium และ Hard ยังเยอะ ลองทบทวนด้วย Flash Cards อีกครั้ง",
      lessonSlug,
      activity: "flash-cards",
      href: getActivityPath(lessonSlug, "flash-cards"),
      ctaLabel: JOURNEY_ACTION_LABELS.reviewFlash,
      reasonCode: "FLASH_WEAK",
    });
  }

  return recommendation({
    kind: "CONTINUE",
    title: `ทบทวน ${lessonTitle(lessonSlug)} อีกครั้ง`,
    message:
      "Flash Cards จำได้คล่องแล้ว กลับไปทบทวนบทเรียนหรือไปกิจกรรมถัดไปได้",
    lessonSlug,
    href: getLessonPath(lessonSlug),
    ctaLabel: "เปิดบทเรียน",
    reasonCode: "FLASH_STRONG",
  });
}

function recommendByLatestActivity(
  summary: LearningSummary,
  lessonSlug: string,
  events?: AggregatableLearningEvent[],
): LearningRecommendation {
  const focus = summary.latestActivity;

  if (focus === "millionaire" && summary.millionaireAttempts > 0) {
    return millionaireRecommendation(summary.averageMillionaireScore, lessonSlug);
  }

  if (focus === "flash-cards" && summary.flashCardAttempts > 0) {
    return flashRecommendation(summary, lessonSlug);
  }

  if (focus === "quiz" && summary.quizAttempts > 0) {
    return quizRecommendation(summary.averageQuizScore, lessonSlug);
  }

  if (summary.quizAttempts > 0) {
    return quizRecommendation(summary.averageQuizScore, lessonSlug);
  }

  if (summary.millionaireAttempts > 0) {
    return millionaireRecommendation(summary.averageMillionaireScore, lessonSlug);
  }

  if (summary.flashCardAttempts > 0) {
    return flashRecommendation(summary, lessonSlug);
  }

  if (focus === "learn") {
    if (events && !hasCurrentLearnCompletion(events, lessonSlug)) {
      return startRecommendation(lessonSlug, "FALLBACK_START");
    }

    return practiceAfterLearnRecommendation(lessonSlug);
  }

  return startRecommendation(lessonSlug, "FALLBACK_START");
}

function recommendForActiveLesson(
  summary: LearningSummary,
  lessonSlug: string,
  events?: AggregatableLearningEvent[],
): LearningRecommendation {
  if (summary.totalActivities <= 0) {
    return startRecommendation(lessonSlug, "EMPTY_HISTORY");
  }

  if (isWeakFlashRetention(summary)) {
    return flashRecommendation(summary, lessonSlug);
  }

  return recommendByLatestActivity(summary, lessonSlug, events);
}

function recommendFromEvents(
  events: AggregatableLearningEvent[],
): LearningRecommendation {
  const validEvents = events.filter(isLearningEvent);
  const resolved = resolveActiveLesson(validEvents);

  if (resolved.isCurriculumComplete) {
    return curriculumCompleteRecommendation(resolved.lessonSlug);
  }

  const lessonSummary = buildLearningSummaryForLesson(
    validEvents,
    resolved.lessonSlug,
  );

  if (lessonSummary.totalActivities <= 0) {
    if (validEvents.length === 0) {
      return startRecommendation(resolved.lessonSlug, "EMPTY_HISTORY");
    }

    return nextLessonRecommendation(resolved.lessonSlug);
  }

  return recommendForActiveLesson(lessonSummary, resolved.lessonSlug, validEvents);
}

/**
 * Next-best-action for the ACTIVE curriculum lesson.
 * Journey answers current stage; this engine answers what to do next.
 * They stay separate. When events are provided, latestActivity is not used
 * to pick the lesson.
 */
export function buildLearningRecommendation(
  summary: unknown,
  events?: AggregatableLearningEvent[],
): LearningRecommendation {
  if (Array.isArray(events)) {
    return recommendFromEvents(events);
  }

  const parsed = parseSummary(summary);

  if (!parsed) {
    return startRecommendation(resolveLessonSlug(), "FALLBACK_START");
  }

  const lessonSlug = resolveLessonSlug(parsed.latestLesson);

  if (parsed.totalActivities <= 0) {
    return startRecommendation(lessonSlug, "EMPTY_HISTORY");
  }

  return recommendByLatestActivity(parsed, lessonSlug);
}
