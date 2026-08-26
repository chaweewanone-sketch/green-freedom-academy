import { getActivityPath } from "@/lib/activities";
import { getLessonBySlug, getLessonPath, hasLesson } from "@/lib/lessons";
import type {
  JourneyReasonCode,
  LearningJourney,
  LearningJourneyStage,
  LearningSummary,
} from "@/types/analytics";

/**
 * Journey answers "ตอนนี้อยู่ขั้นไหน".
 * Recommendation (buildLearningRecommendation) answers "ควรทำอะไรต่อ".
 * These engines stay separate and both read LearningSummary only.
 *
 * Path precedence (v1):
 * 1. Empty / malformed → LEARN
 * 2. If Millionaire attempts exist → millionaire band (REVIEW / PLAY / COMPLETE)
 * 3. Else if Quiz attempts exist → quiz band (PRACTICE / PLAY)
 * 4. Else → LEARN
 * 5. Flash-card weak retention (Sprint 20 semantics) overrides the path stage
 *    to REVIEW, including COMPLETE. Empty history is never overridden.
 */
export const JOURNEY_THRESHOLDS = {
  quizReview: 70,
  quizStrong: 85,
  millionaireReview: 70,
  millionaireStrong: 85,
  flashWeakReviewRatio: 0.5,
} as const;

export const JOURNEY_PROGRESS = {
  learn: 20,
  quizWeak: 40,
  quizDeveloping: 50,
  quizStrongPlay: 70,
  millionaireWeak: 75,
  millionaireDeveloping: 85,
  complete: 100,
  flashOverrideComplete: 90,
} as const;

export const DEFAULT_JOURNEY_LESSON_SLUG = "present-simple";

export const JOURNEY_STAGE_LABELS: Record<LearningJourneyStage, string> = {
  LEARN: "เรียน",
  PRACTICE: "ฝึก",
  PLAY: "เล่น",
  REVIEW: "ทบทวน",
  COMPLETE: "สำเร็จ",
};

export const JOURNEY_TRACK: LearningJourneyStage[] = [
  "LEARN",
  "PRACTICE",
  "PLAY",
  "REVIEW",
  "COMPLETE",
];

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

  return DEFAULT_JOURNEY_LESSON_SLUG;
}

function lessonTitle(lessonSlug: string): string {
  return getLessonBySlug(lessonSlug)?.title ?? "Present Simple";
}

function clampPercent(value: number): number {
  if (value < 0) {
    return 0;
  }

  if (value > 100) {
    return 100;
  }

  return Math.round(value);
}

function isWeakFlashRetention(summary: LearningSummary): boolean {
  const rated = summary.flashEasy + summary.flashMedium + summary.flashHard;
  if (rated <= 0) {
    return false;
  }

  return (
    (summary.flashMedium + summary.flashHard) / rated >=
    JOURNEY_THRESHOLDS.flashWeakReviewRatio
  );
}

function journey(input: {
  lessonSlug: string;
  stage: LearningJourneyStage;
  title: string;
  message: string;
  progressPercent: number;
  nextHref?: string;
  ctaLabel?: string;
  reasonCode: JourneyReasonCode;
}): LearningJourney {
  return {
    ...input,
    progressPercent: clampPercent(input.progressPercent),
  };
}

function learnJourney(
  lessonSlug: string,
  reasonCode: JourneyReasonCode = "EMPTY_HISTORY",
): LearningJourney {
  const title = lessonTitle(lessonSlug);

  return journey({
    lessonSlug,
    stage: "LEARN",
    title: `เริ่มเรียน ${title}`,
    message: "ยังอยู่ขั้นเรียน เริ่มจากบทเรียนนี้ก่อนไปฝึก Quiz",
    progressPercent: JOURNEY_PROGRESS.learn,
    nextHref: getLessonPath(lessonSlug),
    ctaLabel: "เริ่มเรียน",
    reasonCode,
  });
}

function quizJourney(score: number, lessonSlug: string): LearningJourney {
  const title = lessonTitle(lessonSlug);

  if (score < JOURNEY_THRESHOLDS.quizReview) {
    return journey({
      lessonSlug,
      stage: "PRACTICE",
      title: "กำลังฝึก Quiz",
      message: `คะแนน Quiz ยังต่ำกว่า ${JOURNEY_THRESHOLDS.quizReview}% อยู่ในขั้นฝึก`,
      progressPercent: JOURNEY_PROGRESS.quizWeak,
      nextHref: getActivityPath(lessonSlug, "quiz"),
      ctaLabel: "ฝึก Quiz",
      reasonCode: "QUIZ_WEAK",
    });
  }

  if (score < JOURNEY_THRESHOLDS.quizStrong) {
    return journey({
      lessonSlug,
      stage: "PRACTICE",
      title: "ฝึก Quiz ต่ออีกนิด",
      message: `กำลังพัฒนาในขั้นฝึก ทำ Quiz ให้ถึง ${JOURNEY_THRESHOLDS.quizStrong}% ก่อนไปเล่นเกม`,
      progressPercent: JOURNEY_PROGRESS.quizDeveloping,
      nextHref: getActivityPath(lessonSlug, "quiz"),
      ctaLabel: "ฝึก Quiz",
      reasonCode: "QUIZ_DEVELOPING",
    });
  }

  return journey({
    lessonSlug,
    stage: "PLAY",
    title: "พร้อมเล่น Millionaire",
    message: `${title} ฝึก Quiz แข็งแรงแล้ว ไปขั้นเล่น Millionaire ได้`,
    progressPercent: JOURNEY_PROGRESS.quizStrongPlay,
    nextHref: getActivityPath(lessonSlug, "millionaire"),
    ctaLabel: "เล่น Millionaire",
    reasonCode: "QUIZ_STRONG",
  });
}

function millionaireJourney(score: number, lessonSlug: string): LearningJourney {
  const title = lessonTitle(lessonSlug);

  if (score < JOURNEY_THRESHOLDS.millionaireReview) {
    return journey({
      lessonSlug,
      stage: "REVIEW",
      title: "ทบทวนก่อนเล่นใหม่",
      message: `Millionaire ยังต่ำกว่า ${JOURNEY_THRESHOLDS.millionaireReview}% ทบทวน ${title} หรือฝึก Quiz ก่อน`,
      progressPercent: JOURNEY_PROGRESS.millionaireWeak,
      nextHref: getActivityPath(lessonSlug, "quiz"),
      ctaLabel: "ฝึก Quiz",
      reasonCode: "MILLIONAIRE_WEAK",
    });
  }

  if (score < JOURNEY_THRESHOLDS.millionaireStrong) {
    return journey({
      lessonSlug,
      stage: "PLAY",
      title: "เล่น Millionaire ต่อ",
      message: "อยู่ในขั้นเล่น ลอง Millionaire อีกครั้งเพื่อให้ชำนาญขึ้น",
      progressPercent: JOURNEY_PROGRESS.millionaireDeveloping,
      nextHref: getActivityPath(lessonSlug, "millionaire"),
      ctaLabel: "เล่นอีกครั้ง",
      reasonCode: "MILLIONAIRE_DEVELOPING",
    });
  }

  return journey({
    lessonSlug,
    stage: "COMPLETE",
    title: `เรียน ${title} สำเร็จ`,
    message: "ผ่านขั้นเล่นแล้ว สามารถทบทวนบทเรียนหรือไปกิจกรรมถัดไปได้",
    progressPercent: JOURNEY_PROGRESS.complete,
    nextHref: getLessonPath(lessonSlug),
    ctaLabel: "เปิดบทเรียน",
    reasonCode: "MILLIONAIRE_STRONG",
  });
}

function applyFlashOverride(
  pathJourney: LearningJourney,
  summary: LearningSummary,
): LearningJourney {
  if (!isWeakFlashRetention(summary)) {
    return pathJourney;
  }

  return journey({
    lessonSlug: pathJourney.lessonSlug,
    stage: "REVIEW",
    title: "ทบทวนด้วย Flash Cards",
    message: "การ์ดระดับ Medium และ Hard ยังเยอะ อยู่ในขั้นทบทวน",
    progressPercent:
      pathJourney.stage === "COMPLETE"
        ? JOURNEY_PROGRESS.flashOverrideComplete
        : pathJourney.progressPercent,
    nextHref: getActivityPath(pathJourney.lessonSlug, "flash-cards"),
    ctaLabel: "ทบทวน Flash Cards",
    reasonCode: "FLASH_WEAK_OVERRIDE",
  });
}

function buildPathJourney(
  summary: LearningSummary,
  lessonSlug: string,
): LearningJourney {
  if (summary.totalActivities <= 0) {
    return learnJourney(lessonSlug, "EMPTY_HISTORY");
  }

  if (summary.millionaireAttempts > 0) {
    return millionaireJourney(summary.averageMillionaireScore, lessonSlug);
  }

  if (summary.quizAttempts > 0) {
    return quizJourney(summary.averageQuizScore, lessonSlug);
  }

  return learnJourney(lessonSlug, "FALLBACK_LEARN");
}

export function buildLearningJourney(summary: unknown): LearningJourney {
  const parsed = parseSummary(summary);

  if (!parsed) {
    return learnJourney(resolveLessonSlug(), "FALLBACK_LEARN");
  }

  const lessonSlug = resolveLessonSlug(parsed.latestLesson);
  const pathJourney = buildPathJourney(parsed, lessonSlug);

  if (parsed.totalActivities <= 0) {
    return pathJourney;
  }

  return applyFlashOverride(pathJourney, parsed);
}
