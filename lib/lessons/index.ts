import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import type { LessonData } from "@/types/lesson";

export type TeachableLessonSummary = Pick<LessonData, "slug" | "title">;

const teachableLessons: TeachableLessonSummary[] = [
  {
    slug: presentSimpleLesson.slug,
    title: presentSimpleLesson.title,
  },
];

export function getTeachableLessons(): TeachableLessonSummary[] {
  return teachableLessons;
}

export function getLessonPath(slug: string): string {
  return `/lesson/${slug}`;
}
