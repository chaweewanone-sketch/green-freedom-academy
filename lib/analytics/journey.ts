import { buildLearningSummaryForLesson } from "@/lib/analytics/summary";
import {
  getFirstCurriculumLesson,
  getLessonBySlug,
  getNextCurriculumLesson,
  hasLesson,
} from "@/lib/lessons";
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
 * Journey answers "ตอนนี้อยู่ขั้นไหน" for the active curriculum lesson.
 * Recommendation (buildLearningRecommendation) answers "ควรทำอะไรต่อ".
 * These engines stay separate.
 *
 * Path precedence within one lesson (v1):
 * 1. Empty / malformed → LEARN
 * 2. If Millionaire attempts exist → millionaire band (REVIEW / PLAY / COMPLETE)
 * 3. Else if Quiz attempts exist → quiz band (PRACTICE / PLAY)
 * 4. Else → LEARN
 * 5. Flash-card weak retention overrides the path stage to REVIEW, including COMPLETE.
 * 6. COMPLETE + a later curriculum lesson → CTA to that lesson (not marked learned).
 * 7. COMPLETE on the final curriculum lesson → dashboard.
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
    nextAction: journeyAction(
      "REVIEW",
      JOURNEY_ACTION_LABELS.reviewFlash,
      getActivityPath(pathJourney.lessonSlug, "flash-cards"),
    ),
    reasonCode: "FLASH_WEAK_OVERRIDE",
  });
}

function withCurriculumNavigation(pathJourney: LearningJourney): LearningJourney {
  if (pathJourney.stage !== "COMPLETE") {
    return pathJourney;
  }

  const nextLesson = getNextCurriculumLesson(pathJourney.lessonSlug);
  if (!nextLesson) {
    return journey({
      ...pathJourney,
      isCurriculumComplete: true,
    });
  }

  return journey({
    ...pathJourney,
    title: `เรียน ${lessonTitle(pathJourney.lessonSlug)} สำเร็จ`,
    message: "ผ่านขั้นเล่นแล้ว สามารถไปบทเรียนถัดไปได้",
    nextAction: journeyAction(
      "LEARN",
      JOURNEY_ACTION_LABELS.nextLesson,
      getLessonPath(nextLesson.slug),
    ),
    nextLessonSlug: nextLesson.slug,
    isCurriculumComplete: false,
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

function findLatestEvent(
  events: AggregatableLearningEvent[],
): AggregatableLearningEvent | undefined {
  if (events.length === 0) {
    return undefined;
  }

  return events.reduce((latest, event) =>
    event.completedAt >= latest.completedAt ? event : latest,
  );
}

function isLearningEvent(
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

function finishJourney(
  summary: LearningSummary,
  lessonSlug: string,
): LearningJourney {
  const pathJourney = buildPathJourney(summary, lessonSlug);

  if (summary.totalActivities <= 0) {
    return pathJourney;
  }

  return withCurriculumNavigation(applyFlashOverride(pathJourney, summary));
}

export function buildLearningJourney(
  summary: unknown,
  events?: AggregatableLearningEvent[],
): LearningJourney {
  if (Array.isArray(events)) {
    const validEvents = events.filter(isLearningEvent);

    if (validEvents.length === 0) {
      return learnJourney(resolveLessonSlug(), "EMPTY_HISTORY");
    }

    const latest = findLatestEvent(validEvents);
    const latestSlug = latest?.lessonSlug;

    if (!latestSlug || !hasLesson(latestSlug)) {
      return learnJourney(resolveLessonSlug(), "FALLBACK_LEARN");
    }

    const lessonSummary = buildLearningSummaryForLesson(validEvents, latestSlug);
    return finishJourney(lessonSummary, latestSlug);
  }

  const parsed = parseSummary(summary);

  if (!parsed) {
    return learnJourney(resolveLessonSlug(), "FALLBACK_LEARN");
  }

  if (parsed.latestLesson && !hasLesson(parsed.latestLesson)) {
    return learnJourney(resolveLessonSlug(), "FALLBACK_LEARN");
  }

  const lessonSlug = resolveLessonSlug(parsed.latestLesson);
  return finishJourney(parsed, lessonSlug);
}
