import { pastSimpleLesson } from "./past-simple";
import { presentSimpleLesson } from "./present-simple";
import type { LessonData, LessonSummary } from "@/types/lesson";

const LESSON_REGISTRY: Record<string, LessonData> = {
  [presentSimpleLesson.slug]: presentSimpleLesson,
  [pastSimpleLesson.slug]: pastSimpleLesson,
};

for (const [key, lesson] of Object.entries(LESSON_REGISTRY)) {
  if (key !== lesson.slug) {
    throw new Error(
      `Registry key "${key}" does not match lesson.slug "${lesson.slug}"`,
    );
  }
}

export function getAllLessons(): LessonData[] {
  return Object.values(LESSON_REGISTRY);
}

export function getLessonBySlug(slug: string): LessonData | null {
  return LESSON_REGISTRY[slug] ?? null;
}

export function getLessonSummaries(): LessonSummary[] {
  return getAllLessons().map(({ slug, title }) => ({ slug, title }));
}

export function getTeachableLessons(): LessonSummary[] {
  return getLessonSummaries();
}

export function getLessonCount(): number {
  return Object.keys(LESSON_REGISTRY).length;
}

export function hasLesson(slug: string): boolean {
  return slug in LESSON_REGISTRY;
}

export function getLessonPath(slug: string): string {
  return `/lesson/${slug}`;
}
