import { buildLearningSummaryForLesson } from "@/lib/analytics/summary";
import { hasCurrentLearnCompletion } from "@/lib/history/learnVersion";
import { getFirstCurriculumLesson, getLessonBySlug, hasLesson } from "@/lib/lessons";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import type {
  AggregatableLearningEvent,
  JourneyAction,
  JourneyActionType,
  JourneyReasonCode,
  LearningJourney,
  LearningJourneyStage,
  LearningSummary,
} from "@/types/analytics";

/**
 * Per-lesson stage evaluation. Shared by the Journey Engine and the
 * active-lesson resolver so COMPLETE means the same thing everywhere.
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

export const DEFAULT_JOURNEY_LESSON_SLUG =
  getFirstCurriculumLesson()?.slug ?? "present-simple";

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

export const JOURNEY_ACTION_LABELS = {
  learn: "เริ่มเรียน",
  practiceQuiz: "ทำ Quiz",
  playMillionaire: "เล่น Millionaire",
  reviewQuiz: "กลับไปฝึก Quiz",
  reviewFlash: "ทบทวน Flash Cards",
  complete: "ดูสรุปการเรียน",
  nextLesson: "เรียนบทถัดไป",
} as const;

function journeyAction(
  actionType: JourneyActionType,
  label: string,
  href: string,
): JourneyAction {
  return { actionType, label, href };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFiniteNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export function parseLearningSummary(input: unknown): LearningSummary | null {
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

export function resolveKnownLessonSlug(slug?: string): string {
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

export function journey(input: {
  lessonSlug: string;
  stage: LearningJourneyStage;
  title: string;
  message: string;
  progressPercent: number;
  nextAction: JourneyAction;
  reasonCode: JourneyReasonCode;
  nextLessonSlug?: string;
  isCurriculumComplete?: boolean;
}): LearningJourney {
  return {
    ...input,
    progressPercent: clampPercent(input.progressPercent),
    isCurriculumComplete: input.isCurriculumComplete ?? false,
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
    nextAction: journeyAction(
      "LEARN",
      JOURNEY_ACTION_LABELS.learn,
      getLessonPath(lessonSlug),
    ),
    reasonCode,
  });
}

function practiceAfterLearnJourney(lessonSlug: string): LearningJourney {
  const title = lessonTitle(lessonSlug);

  return journey({
    lessonSlug,
    stage: "PRACTICE",
    title: "พร้อมฝึก Quiz",
    message: `เรียน ${title} แล้ว ไปทำ Quiz ได้`,
    progressPercent: JOURNEY_PROGRESS.quizWeak,
    nextAction: journeyAction(
      "PRACTICE",
      JOURNEY_ACTION_LABELS.practiceQuiz,
      getActivityPath(lessonSlug, "quiz"),
    ),
    reasonCode: "LEARN_COMPLETE",
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
      nextAction: journeyAction(
        "PRACTICE",
        JOURNEY_ACTION_LABELS.practiceQuiz,
        getActivityPath(lessonSlug, "quiz"),
      ),
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
      nextAction: journeyAction(
        "PRACTICE",
        JOURNEY_ACTION_LABELS.practiceQuiz,
        getActivityPath(lessonSlug, "quiz"),
      ),
      reasonCode: "QUIZ_DEVELOPING",
    });
  }

  return journey({
    lessonSlug,
    stage: "PLAY",
    title: "พร้อมเล่น Millionaire",
    message: `${title} ฝึก Quiz แข็งแรงแล้ว ไปขั้นเล่น Millionaire ได้`,
    progressPercent: JOURNEY_PROGRESS.quizStrongPlay,
    nextAction: journeyAction(
      "PLAY",
      JOURNEY_ACTION_LABELS.playMillionaire,
      getActivityPath(lessonSlug, "millionaire"),
    ),
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
      nextAction: journeyAction(
        "REVIEW",
        JOURNEY_ACTION_LABELS.reviewQuiz,
        getActivityPath(lessonSlug, "quiz"),
      ),
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
      nextAction: journeyAction(
        "PLAY",
        JOURNEY_ACTION_LABELS.playMillionaire,
        getActivityPath(lessonSlug, "millionaire"),
      ),
      reasonCode: "MILLIONAIRE_DEVELOPING",
    });
  }

  return journey({
    lessonSlug,
    stage: "COMPLETE",
    title: `เรียน ${title} สำเร็จ`,
    message: "ผ่านขั้นเล่นแล้ว สามารถทบทวนบทเรียนหรือไปกิจกรรมถัดไปได้",
    progressPercent: JOURNEY_PROGRESS.complete,
    nextAction: journeyAction(
      "CONTINUE",
      JOURNEY_ACTION_LABELS.complete,
      getDashboardPath(),
    ),
    reasonCode: "MILLIONAIRE_STRONG",
  });
}

export function isRequiredPathComplete(summary: LearningSummary): boolean {
  return (
    summary.millionaireAttempts > 0 &&
    summary.averageMillionaireScore >= JOURNEY_THRESHOLDS.millionaireStrong
  );
}

function applyFlashOverride(
  pathJourney: LearningJourney,
  summary: LearningSummary,
): LearningJourney {
  if (pathJourney.stage === "COMPLETE") {
    return pathJourney;
  }

  if (!isWeakFlashRetention(summary)) {
    return pathJourney;
  }

  return journey({
    lessonSlug: pathJourney.lessonSlug,
    stage: "REVIEW",
    title: "ทบทวนด้วย Flash Cards",
    message: "การ์ดระดับ Medium และ Hard ยังเยอะ อยู่ในขั้นทบทวน",
    progressPercent: pathJourney.progressPercent,
    nextAction: journeyAction(
      "REVIEW",
      JOURNEY_ACTION_LABELS.reviewFlash,
      getActivityPath(pathJourney.lessonSlug, "flash-cards"),
    ),
    reasonCode: "FLASH_WEAK_OVERRIDE",
  });
}

function buildPathJourney(
  summary: LearningSummary,
  lessonSlug: string,
  events?: AggregatableLearningEvent[],
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

  if (summary.latestActivity === "learn") {
    if (events && !hasCurrentLearnCompletion(events, lessonSlug)) {
      return learnJourney(lessonSlug, "FALLBACK_LEARN");
    }

    return practiceAfterLearnJourney(lessonSlug);
  }

  return learnJourney(lessonSlug, "FALLBACK_LEARN");
}

export function isLearningEvent(
  value: unknown,
): value is AggregatableLearningEvent {
  return (
    isRecord(value) &&
    typeof value.lessonSlug === "string" &&
    typeof value.activity === "string" &&
    typeof value.completedAt === "number" &&
    Number.isFinite(value.completedAt)
  );
}

export function evaluateLessonJourney(
  summary: LearningSummary,
  lessonSlug: string,
  events?: AggregatableLearningEvent[],
): LearningJourney {
  const pathJourney = buildPathJourney(summary, lessonSlug, events);

  if (summary.totalActivities <= 0) {
    return pathJourney;
  }

  return applyFlashOverride(pathJourney, summary);
}

export function isLessonComplete(
  events: AggregatableLearningEvent[],
  lessonSlug: string,
): boolean {
  const summary = buildLearningSummaryForLesson(events, lessonSlug);
  return evaluateLessonJourney(summary, lessonSlug, events).stage === "COMPLETE";
}

export function learnFallbackJourney(
  lessonSlug: string,
  reasonCode: JourneyReasonCode,
): LearningJourney {
  return learnJourney(lessonSlug, reasonCode);
}
