import { getCurriculumLessons } from "@/lib/lessons";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";

/**
 * Present Simple pilot launchability policy.
 *
 * Curriculum engines may still identify Past Simple as next/active.
 * Learner-facing navigation must not launch a lesson that is not in this set.
 * When Past Simple is pilot-ready, add its slug here.
 */
export const LEARNER_LAUNCHABLE_LESSON_SLUGS = ["present-simple"] as const;

export const LEARNER_SAFE_COMPLETION_CTA_LABEL = "ดูผลการเรียน";

export type LearnerSafeNavigation = {
  href: string;
  label: string;
  rewritten: boolean;
};

export function isLearnerLaunchableLesson(lessonSlug: string): boolean {
  return LEARNER_LAUNCHABLE_LESSON_SLUGS.some((slug) => slug === lessonSlug);
}

function hrefTargetsLesson(href: string, lessonSlug: string): boolean {
  return (
    href === getLessonPath(lessonSlug) ||
    href === getActivityPath(lessonSlug, "quiz") ||
    href === getActivityPath(lessonSlug, "millionaire") ||
    href === getActivityPath(lessonSlug, "flash-cards")
  );
}

export function isLearnerLaunchableHref(href: string): boolean {
  for (const lesson of getCurriculumLessons()) {
    if (
      hrefTargetsLesson(href, lesson.slug) &&
      !isLearnerLaunchableLesson(lesson.slug)
    ) {
      return false;
    }
  }

  return true;
}

export function learnerSafeNavigation(
  href: string,
  label: string,
): LearnerSafeNavigation {
  if (isLearnerLaunchableHref(href)) {
    return { href, label, rewritten: false };
  }

  return {
    href: getDashboardPath(),
    label: LEARNER_SAFE_COMPLETION_CTA_LABEL,
    rewritten: true,
  };
}
