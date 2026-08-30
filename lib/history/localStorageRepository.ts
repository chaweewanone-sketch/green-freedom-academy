import type { AggregatableLearningEvent, LearningEvent } from "@/types/analytics";
import type { LearningHistoryRepository } from "@/types/history";
import { isPositiveInteger } from "./learnVersion";

export const LEARNING_HISTORY_STORAGE_KEY = "gfa.learningHistory.v1";

function getBrowserLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function cloneEvent(event: LearningEvent): LearningEvent {
  const cloned: AggregatableLearningEvent = {
    sessionId: event.sessionId,
    activity: event.activity,
    lessonSlug: event.lessonSlug,
    completedAt: event.completedAt,
  };

  const source = event as AggregatableLearningEvent;

  if (typeof source.scorePercentage === "number") {
    cloned.scorePercentage = source.scorePercentage;
  }

  if (typeof source.flashEasy === "number") {
    cloned.flashEasy = source.flashEasy;
  }

  if (typeof source.flashMedium === "number") {
    cloned.flashMedium = source.flashMedium;
  }

  if (typeof source.flashHard === "number") {
    cloned.flashHard = source.flashHard;
  }

  if (isPositiveInteger(source.lessonContentVersion)) {
    cloned.lessonContentVersion = source.lessonContentVersion;
  }

  return cloned;
}

function parseCompletedAt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }

    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStoredEvent(value: unknown): LearningEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  const completedAt = parseCompletedAt(value.completedAt);

  if (
    typeof value.sessionId !== "string" ||
    typeof value.activity !== "string" ||
    typeof value.lessonSlug !== "string" ||
    completedAt === null
  ) {
    return null;
  }

  return cloneEvent({
    sessionId: value.sessionId,
    activity: value.activity,
    lessonSlug: value.lessonSlug,
    completedAt,
    ...(typeof value.scorePercentage === "number"
      ? { scorePercentage: value.scorePercentage }
      : {}),
    ...(typeof value.flashEasy === "number" ? { flashEasy: value.flashEasy } : {}),
    ...(typeof value.flashMedium === "number"
      ? { flashMedium: value.flashMedium }
      : {}),
    ...(typeof value.flashHard === "number" ? { flashHard: value.flashHard } : {}),
    ...(isPositiveInteger(value.lessonContentVersion)
      ? { lessonContentVersion: value.lessonContentVersion }
      : {}),
  } as AggregatableLearningEvent);
}

function readStoredEvents(): LearningEvent[] {
  const storage = getBrowserLocalStorage();
  if (!storage) {
    return [];
  }

  let raw: string | null;

  try {
    raw = storage.getItem(LEARNING_HISTORY_STORAGE_KEY);
  } catch {
    return [];
  }

  if (raw === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((entry) => {
      const event = parseStoredEvent(entry);
      return event ? [event] : [];
    });
  } catch {
    return [];
  }
}

function writeStoredEvents(events: LearningEvent[]): void {
  const storage = getBrowserLocalStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      LEARNING_HISTORY_STORAGE_KEY,
      JSON.stringify(events.map((event) => cloneEvent(event))),
    );
  } catch {
    // Keep existing stored data if the write fails.
  }
}

export function hasPersistedLearningHistory(): boolean {
  const storage = getBrowserLocalStorage();
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(LEARNING_HISTORY_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export class LocalStorageLearningHistoryRepository
  implements LearningHistoryRepository
{
  save(event: LearningEvent): void {
    const events = readStoredEvents();
    events.push(cloneEvent(event));
    writeStoredEvents(events);
  }

  getAll(): LearningEvent[] {
    return readStoredEvents().map((event) => cloneEvent(event));
  }

  getByLesson(lessonSlug: string): LearningEvent[] {
    return this.getAll().filter((event) => event.lessonSlug === lessonSlug);
  }

  getByActivity(activity: string): LearningEvent[] {
    return this.getAll().filter((event) => event.activity === activity);
  }

  getLatest(limit?: number): LearningEvent[] {
    const sorted = [...readStoredEvents()].sort(
      (a, b) => b.completedAt - a.completedAt,
    );

    if (limit === undefined) {
      return sorted.map((event) => cloneEvent(event));
    }

    if (limit <= 0) {
      return [];
    }

    return sorted.slice(0, limit).map((event) => cloneEvent(event));
  }

  clear(): void {
    writeStoredEvents([]);
  }
}
