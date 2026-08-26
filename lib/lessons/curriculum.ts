import { pastSimpleLesson } from "./past-simple";
import { presentSimpleLesson } from "./present-simple";
import { getLessonBySlug } from "./registry";
import type { LessonSummary } from "@/types/lesson";

const CURRICULUM_SLUGS = [
  presentSimpleLesson.slug,
  pastSimpleLesson.slug,
] as const;

export function getCurriculumLessons(): LessonSummary[] {
  return CURRICULUM_SLUGS.flatMap((slug) => {
    const lesson = getLessonBySlug(slug);
    return lesson ? [{ slug: lesson.slug, title: lesson.title }] : [];
  });
}

export function getFirstCurriculumLesson(): LessonSummary | null {
  return getCurriculumLessons()[0] ?? null;
}

export function getNextCurriculumLesson(
  lessonSlug: string,
): LessonSummary | null {
  const lessons = getCurriculumLessons();
  const index = lessons.findIndex((lesson) => lesson.slug === lessonSlug);

  if (index < 0 || index >= lessons.length - 1) {
    return null;
  }

  return lessons[index + 1] ?? null;
}

export function isFinalCurriculumLesson(lessonSlug: string): boolean {
  const lessons = getCurriculumLessons();
  const last = lessons[lessons.length - 1];
  return Boolean(last && last.slug === lessonSlug);
}
