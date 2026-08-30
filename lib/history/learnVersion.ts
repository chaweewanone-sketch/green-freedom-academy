import { getLessonBySlug } from "@/lib/lessons";
import type { LearningEvent } from "@/types/analytics";

export const LEARN_ACTIVITY = "learn";
export const LEGACY_LEARN_CONTENT_VERSION = 1;

export function isLearnActivity(activity: string): boolean {
  return activity === LEARN_ACTIVITY;
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

/**
 * Interpret a Learn event's curriculum version without mutating it.
 * Missing or invalid lessonContentVersion is treated as version 1.
 */
export function getEffectiveLearnVersion(
  event: Pick<LearningEvent, "lessonContentVersion">,
): number {
  return isPositiveInteger(event.lessonContentVersion)
    ? event.lessonContentVersion
    : LEGACY_LEARN_CONTENT_VERSION;
}

export function getLessonContentVersion(lessonSlug: string): number {
  const version = getLessonBySlug(lessonSlug)?.contentVersion;
  return isPositiveInteger(version) ? version : LEGACY_LEARN_CONTENT_VERSION;
}

export function buildLearnSessionId(
  lessonSlug: string,
  contentVersion: number,
): string {
  return `${LEARN_ACTIVITY}:${lessonSlug}:v${contentVersion}`;
}

function isLearnForLesson(event: LearningEvent, lessonSlug: string): boolean {
  return isLearnActivity(event.activity) && event.lessonSlug === lessonSlug;
}

export function findHistoricalLearnCompletion(
  events: LearningEvent[],
  lessonSlug: string,
): LearningEvent | undefined {
  return events.find((event) => isLearnForLesson(event, lessonSlug));
}

export function hasHistoricalLearnCompletion(
  events: LearningEvent[],
  lessonSlug: string,
): boolean {
  return findHistoricalLearnCompletion(events, lessonSlug) !== undefined;
}

export function findCurrentLearnCompletion(
  events: LearningEvent[],
  lessonSlug: string,
  contentVersion: number = getLessonContentVersion(lessonSlug),
): LearningEvent | undefined {
  return events.find(
    (event) =>
      isLearnForLesson(event, lessonSlug) &&
      getEffectiveLearnVersion(event) === contentVersion,
  );
}

export function hasCurrentLearnCompletion(
  events: LearningEvent[],
  lessonSlug: string,
  contentVersion: number = getLessonContentVersion(lessonSlug),
): boolean {
  return findCurrentLearnCompletion(events, lessonSlug, contentVersion) !== undefined;
}
