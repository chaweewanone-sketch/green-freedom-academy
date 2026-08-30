import { resolveActiveLesson } from "@/lib/analytics/activeLesson";
import {
  evaluateLessonJourney,
  isLearningEvent,
} from "@/lib/analytics/lessonProgress";
import { buildLearningSummaryForLesson } from "@/lib/analytics/summary";
import { getCurriculumLessons } from "@/lib/lessons";
import type {
  AggregatableLearningEvent,
  CurriculumLessonProgress,
  CurriculumLessonStatus,
  CurriculumProgress,
} from "@/types/analytics";

export const CURRICULUM_LESSON_STATUS_LABELS: Record<
  CurriculumLessonStatus,
  string
> = {
  ACTIVE: "กำลังเรียน",
  COMPLETE: "เรียนจบแล้ว",
  LOCKED: "รอเรียน",
};

/**
 * Overall progress is the unweighted average of each curriculum lesson's
 * display progressPercent.
 *
 * ACTIVE / COMPLETE lessons use evaluateLessonJourney progress.
 * LOCKED lessons contribute 0 until curriculum progression reaches them,
 * even if out-of-order history already exists for that slug.
 */
function averageProgress(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
}

function lockedLessonProgress(
  lessonSlug: string,
  lessonTitle: string,
): CurriculumLessonProgress {
  return {
    lessonSlug,
    lessonTitle,
    status: "LOCKED",
    stage: "LEARN",
    progressPercent: 0,
  };
}

function evaluatedLessonProgress(
  events: AggregatableLearningEvent[],
  lessonSlug: string,
  lessonTitle: string,
  status: "ACTIVE" | "COMPLETE",
): CurriculumLessonProgress {
  const summary = buildLearningSummaryForLesson(events, lessonSlug);
  const journey = evaluateLessonJourney(summary, lessonSlug, events);

  return {
    lessonSlug,
    lessonTitle,
    status,
    stage: journey.stage,
    progressPercent: journey.progressPercent,
  };
}

export function buildCurriculumProgress(
  events: AggregatableLearningEvent[],
): CurriculumProgress {
  const validEvents = events.filter(isLearningEvent);
  const curriculum = getCurriculumLessons();
  const resolved = resolveActiveLesson(validEvents);
  const activeIndex = curriculum.findIndex(
    (item) => item.slug === resolved.lessonSlug,
  );

  const lessons = curriculum.map((lesson, index) => {
    if (resolved.isCurriculumComplete || index < activeIndex) {
      return evaluatedLessonProgress(
        validEvents,
        lesson.slug,
        lesson.title,
        "COMPLETE",
      );
    }

    if (lesson.slug === resolved.lessonSlug) {
      return evaluatedLessonProgress(
        validEvents,
        lesson.slug,
        lesson.title,
        "ACTIVE",
      );
    }

    return lockedLessonProgress(lesson.slug, lesson.title);
  });

  const completedLessons = lessons.filter(
    (lesson) => lesson.status === "COMPLETE",
  ).length;

  return {
    lessons,
    completedLessons,
    totalLessons: lessons.length,
    overallProgressPercent: averageProgress(
      lessons.map((lesson) => lesson.progressPercent),
    ),
    activeLessonSlug: resolved.isCurriculumComplete
      ? undefined
      : resolved.lessonSlug,
    isCurriculumComplete: resolved.isCurriculumComplete,
  };
}
