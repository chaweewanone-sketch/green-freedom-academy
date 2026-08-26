import { isLessonComplete } from "@/lib/analytics/lessonProgress";
import {
  getCurriculumLessons,
  getFirstCurriculumLesson,
} from "@/lib/lessons";
import type { AggregatableLearningEvent } from "@/types/analytics";

export type ActiveLessonResolution = {
  lessonSlug: string;
  isCurriculumComplete: boolean;
};

function fallbackLessonSlug(): string {
  return getFirstCurriculumLesson()?.slug ?? "present-simple";
}

/**
 * Resolves the lesson the learner should be working on now.
 *
 * Walks curriculum order and returns the first lesson that is not COMPLETE
 * under the shared Sprint 21–23 journey policy. Later-lesson history is kept
 * but does not advance the active lesson.
 *
 * latestActivity (summary) remains a separate concept.
 */
export function resolveActiveLesson(
  events: AggregatableLearningEvent[],
): ActiveLessonResolution {
  const lessons = getCurriculumLessons();
  const fallbackSlug = fallbackLessonSlug();

  if (lessons.length === 0) {
    return {
      lessonSlug: fallbackSlug,
      isCurriculumComplete: false,
    };
  }

  for (const lesson of lessons) {
    if (!isLessonComplete(events, lesson.slug)) {
      return {
        lessonSlug: lesson.slug,
        isCurriculumComplete: false,
      };
    }
  }

  const finalLesson = lessons[lessons.length - 1];

  return {
    lessonSlug: finalLesson?.slug ?? fallbackSlug,
    isCurriculumComplete: true,
  };
}

export { isLessonComplete };
