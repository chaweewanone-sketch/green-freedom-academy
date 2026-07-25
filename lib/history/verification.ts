import { MemoryLearningHistoryRepository } from "./memoryRepository";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function verifySave(): void {
  const repository = new MemoryLearningHistoryRepository();

  repository.save({
    sessionId: "verify_save_1",
    activity: "quiz",
    lessonSlug: "present-simple",
    completedAt: 1_700_000_000_000,
  });

  const events = repository.getAll();
  assert(events.length === 1, "verifySave: expected one saved event");
  assert(
    events[0]?.sessionId === "verify_save_1",
    "verifySave: expected saved sessionId",
  );
}

export function verifyClear(): void {
  const repository = new MemoryLearningHistoryRepository();

  repository.save({
    sessionId: "verify_clear_1",
    activity: "quiz",
    lessonSlug: "present-simple",
    completedAt: 1_700_000_000_000,
  });
  repository.clear();

  assert(
    repository.getAll().length === 0,
    "verifyClear: expected empty repository",
  );
}

export function verifyLatest(): void {
  const repository = new MemoryLearningHistoryRepository();

  repository.save({
    sessionId: "verify_latest_old",
    activity: "quiz",
    lessonSlug: "present-simple",
    completedAt: 1_700_000_000_000,
  });
  repository.save({
    sessionId: "verify_latest_new",
    activity: "flash-cards",
    lessonSlug: "past-simple",
    completedAt: 1_700_000_300_000,
  });

  const latest = repository.getLatest(1);
  assert(latest.length === 1, "verifyLatest: expected one latest event");
  assert(
    latest[0]?.sessionId === "verify_latest_new",
    "verifyLatest: expected most recent event",
  );
}

export function verifyGetLatestLimits(): void {
  const repository = new MemoryLearningHistoryRepository();

  repository.save({
    sessionId: "verify_limit_1",
    activity: "quiz",
    lessonSlug: "present-simple",
    completedAt: 100,
  });
  repository.save({
    sessionId: "verify_limit_2",
    activity: "quiz",
    lessonSlug: "past-simple",
    completedAt: 300,
  });
  repository.save({
    sessionId: "verify_limit_3",
    activity: "millionaire",
    lessonSlug: "present-simple",
    completedAt: 200,
  });

  const allLatest = repository.getLatest();
  assert(allLatest.length === 3, "verifyGetLatestLimits: undefined returns all");
  assert(
    allLatest[0]?.sessionId === "verify_limit_2",
    "verifyGetLatestLimits: undefined orders newest first",
  );
  assert(
    allLatest[2]?.sessionId === "verify_limit_1",
    "verifyGetLatestLimits: undefined orders oldest last",
  );

  assert(
    repository.getLatest(0).length === 0,
    "verifyGetLatestLimits: zero limit returns empty array",
  );
  assert(
    repository.getLatest(-1).length === 0,
    "verifyGetLatestLimits: negative limit returns empty array",
  );

  const capped = repository.getLatest(2);
  assert(capped.length === 2, "verifyGetLatestLimits: limit caps result count");
  assert(
    capped[0]?.sessionId === "verify_limit_2",
    "verifyGetLatestLimits: capped result is newest first",
  );

  const oversized = repository.getLatest(10);
  assert(
    oversized.length === 3,
    "verifyGetLatestLimits: oversized limit returns all available events",
  );
}

export function verifyReturnedArraysAreIsolated(): void {
  const repository = new MemoryLearningHistoryRepository();

  repository.save({
    sessionId: "verify_isolated_1",
    activity: "quiz",
    lessonSlug: "present-simple",
    completedAt: 100,
  });
  repository.save({
    sessionId: "verify_isolated_2",
    activity: "flash-cards",
    lessonSlug: "past-simple",
    completedAt: 200,
  });

  const allEvents = repository.getAll();
  allEvents.pop();
  allEvents[0] = {
    sessionId: "mutated",
    activity: "quiz",
    lessonSlug: "mutated",
    completedAt: 0,
  };

  const storedEvents = repository.getAll();
  assert(storedEvents.length === 2, "verifyReturnedArraysAreIsolated: getAll length");
  assert(
    storedEvents[0]?.sessionId === "verify_isolated_1",
    "verifyReturnedArraysAreIsolated: getAll event copy",
  );

  const lessonEvents = repository.getByLesson("present-simple");
  lessonEvents.length = 0;
  assert(
    repository.getByLesson("present-simple").length === 1,
    "verifyReturnedArraysAreIsolated: getByLesson array copy",
  );

  const activityEvents = repository.getByActivity("flash-cards");
  activityEvents.length = 0;
  assert(
    repository.getByActivity("flash-cards").length === 1,
    "verifyReturnedArraysAreIsolated: getByActivity array copy",
  );

  const latestEvents = repository.getLatest(1);
  latestEvents.length = 0;
  assert(
    repository.getLatest(1).length === 1,
    "verifyReturnedArraysAreIsolated: getLatest array copy",
  );
}

export function verifyInternalOrderIsPreserved(): void {
  const repository = new MemoryLearningHistoryRepository();

  repository.save({
    sessionId: "verify_order_1",
    activity: "quiz",
    lessonSlug: "present-simple",
    completedAt: 100,
  });
  repository.save({
    sessionId: "verify_order_2",
    activity: "quiz",
    lessonSlug: "past-simple",
    completedAt: 300,
  });
  repository.save({
    sessionId: "verify_order_3",
    activity: "millionaire",
    lessonSlug: "present-simple",
    completedAt: 200,
  });

  repository.getLatest();

  const storedEvents = repository.getAll();
  assert(
    storedEvents.map((event) => event.sessionId).join(",") ===
      "verify_order_1,verify_order_2,verify_order_3",
    "verifyInternalOrderIsPreserved: getLatest must not mutate storage order",
  );
}

export function runHistoryVerification(): void {
  verifySave();
  verifyClear();
  verifyLatest();
  verifyGetLatestLimits();
  verifyReturnedArraysAreIsolated();
  verifyInternalOrderIsPreserved();
}
