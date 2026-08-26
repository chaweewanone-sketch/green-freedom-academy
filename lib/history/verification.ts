import type { LearningEvent } from "@/types/analytics";
import type { LearningHistoryRepository } from "@/types/history";
import { createLearningHistoryRepository } from "./createRepository";
import { loadDashboardHistory } from "./loadDashboardHistory";
import {
  LEARNING_HISTORY_STORAGE_KEY,
  LocalStorageLearningHistoryRepository,
  hasPersistedLearningHistory,
} from "./localStorageRepository";
import { MemoryLearningHistoryRepository } from "./memoryRepository";

type RepositoryFactory = () => LearningHistoryRepository;
type StorageStore = Record<string, string>;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function createMemoryRepository(): LearningHistoryRepository {
  return new MemoryLearningHistoryRepository();
}

function createLocalStorageRepository(): LearningHistoryRepository {
  return new LocalStorageLearningHistoryRepository();
}

function sampleEvent(
  overrides: Partial<LearningEvent> & Pick<LearningEvent, "sessionId">,
): LearningEvent {
  return {
    activity: "quiz",
    lessonSlug: "present-simple",
    completedAt: 1_700_000_000_000,
    ...overrides,
  };
}

function createMemoryStorage(store: StorageStore): Storage {
  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
  };
}

function withMockLocalStorage(
  run: (store: StorageStore) => void,
  initial: StorageStore = {},
): void {
  const store: StorageStore = { ...initial };
  const storage = createMemoryStorage(store);
  const globalObject = globalThis as typeof globalThis & {
    localStorage?: Storage;
    window?: Window & typeof globalThis;
  };
  const previousWindow = globalObject.window;
  const previousLocalStorage = globalObject.localStorage;
  const hadWindow = "window" in globalObject;
  const hadLocalStorage = "localStorage" in globalObject;

  globalObject.window = { localStorage: storage } as Window & typeof globalThis;
  globalObject.localStorage = storage;

  try {
    run(store);
  } finally {
    if (hadWindow) {
      globalObject.window = previousWindow;
    } else {
      Reflect.deleteProperty(globalObject, "window");
    }

    if (hadLocalStorage) {
      globalObject.localStorage = previousLocalStorage;
    } else {
      Reflect.deleteProperty(globalObject, "localStorage");
    }
  }
}

export function verifySave(
  createRepository: RepositoryFactory = createMemoryRepository,
): void {
  const repository = createRepository();
  repository.clear();

  repository.save(
    sampleEvent({
      sessionId: "verify_save_1",
    }),
  );

  const events = repository.getAll();
  assert(events.length === 1, "verifySave: expected one saved event");
  assert(
    events[0]?.sessionId === "verify_save_1",
    "verifySave: expected saved sessionId",
  );
}

export function verifyClear(
  createRepository: RepositoryFactory = createMemoryRepository,
): void {
  const repository = createRepository();
  repository.clear();

  repository.save(
    sampleEvent({
      sessionId: "verify_clear_1",
    }),
  );
  repository.clear();

  assert(
    repository.getAll().length === 0,
    "verifyClear: expected empty repository",
  );
}

export function verifyLatest(
  createRepository: RepositoryFactory = createMemoryRepository,
): void {
  const repository = createRepository();
  repository.clear();

  repository.save(
    sampleEvent({
      sessionId: "verify_latest_old",
      completedAt: 1_700_000_000_000,
    }),
  );
  repository.save(
    sampleEvent({
      sessionId: "verify_latest_new",
      activity: "flash-cards",
      lessonSlug: "past-simple",
      completedAt: 1_700_000_300_000,
    }),
  );

  const latest = repository.getLatest(1);
  assert(latest.length === 1, "verifyLatest: expected one latest event");
  assert(
    latest[0]?.sessionId === "verify_latest_new",
    "verifyLatest: expected most recent event",
  );
}

export function verifyGetLatestLimits(
  createRepository: RepositoryFactory = createMemoryRepository,
): void {
  const repository = createRepository();
  repository.clear();

  repository.save(
    sampleEvent({
      sessionId: "verify_limit_1",
      completedAt: 100,
    }),
  );
  repository.save(
    sampleEvent({
      sessionId: "verify_limit_2",
      lessonSlug: "past-simple",
      completedAt: 300,
    }),
  );
  repository.save(
    sampleEvent({
      sessionId: "verify_limit_3",
      activity: "millionaire",
      completedAt: 200,
    }),
  );

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

export function verifyReturnedArraysAreIsolated(
  createRepository: RepositoryFactory = createMemoryRepository,
): void {
  const repository = createRepository();
  repository.clear();

  repository.save(
    sampleEvent({
      sessionId: "verify_isolated_1",
      completedAt: 100,
    }),
  );
  repository.save(
    sampleEvent({
      sessionId: "verify_isolated_2",
      activity: "flash-cards",
      lessonSlug: "past-simple",
      completedAt: 200,
    }),
  );

  const allEvents = repository.getAll();
  allEvents.pop();
  allEvents[0] = sampleEvent({
    sessionId: "mutated",
    lessonSlug: "mutated",
    completedAt: 0,
  });

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

export function verifyInternalOrderIsPreserved(
  createRepository: RepositoryFactory = createMemoryRepository,
): void {
  const repository = createRepository();
  repository.clear();

  repository.save(
    sampleEvent({
      sessionId: "verify_order_1",
      completedAt: 100,
    }),
  );
  repository.save(
    sampleEvent({
      sessionId: "verify_order_2",
      lessonSlug: "past-simple",
      completedAt: 300,
    }),
  );
  repository.save(
    sampleEvent({
      sessionId: "verify_order_3",
      activity: "millionaire",
      completedAt: 200,
    }),
  );

  repository.getLatest();

  const storedEvents = repository.getAll();
  assert(
    storedEvents.map((event) => event.sessionId).join(",") ===
      "verify_order_1,verify_order_2,verify_order_3",
    "verifyInternalOrderIsPreserved: getLatest must not mutate storage order",
  );
}

function runRepositoryContract(createRepository: RepositoryFactory): void {
  verifySave(createRepository);
  verifyClear(createRepository);
  verifyLatest(createRepository);
  verifyGetLatestLimits(createRepository);
  verifyReturnedArraysAreIsolated(createRepository);
  verifyInternalOrderIsPreserved(createRepository);
}

export function verifyPersistenceAcrossInstances(): void {
  withMockLocalStorage(() => {
    const first = new LocalStorageLearningHistoryRepository();
    first.save(
      sampleEvent({
        sessionId: "verify_persist_1",
        completedAt: 1_700_000_400_000,
      }),
    );

    const second = new LocalStorageLearningHistoryRepository();
    const events = second.getAll();
    assert(events.length === 1, "verifyPersistenceAcrossInstances: expected one event");
    assert(
      events[0]?.sessionId === "verify_persist_1",
      "verifyPersistenceAcrossInstances: expected persisted sessionId",
    );
  });
}

export function verifyPersistedClearSurvivesReload(): void {
  withMockLocalStorage(() => {
    const first = new LocalStorageLearningHistoryRepository();
    first.save(sampleEvent({ sessionId: "verify_persist_clear_1" }));
    first.clear();

    const second = new LocalStorageLearningHistoryRepository();
    assert(
      second.getAll().length === 0,
      "verifyPersistedClearSurvivesReload: expected empty history after reload",
    );
  });
}

export function verifyMalformedStorageDoesNotCrash(): void {
  withMockLocalStorage(
    (store) => {
      const repository = new LocalStorageLearningHistoryRepository();
      const events = repository.getAll();
      assert(
        events.length === 0,
        "verifyMalformedStorageDoesNotCrash: expected empty history",
      );
      assert(
        store[LEARNING_HISTORY_STORAGE_KEY] === "{not-json",
        "verifyMalformedStorageDoesNotCrash: must not rewrite malformed data",
      );

      repository.save(sampleEvent({ sessionId: "after_malformed" }));
      repository.getLatest();
      repository.clear();
    },
    { [LEARNING_HISTORY_STORAGE_KEY]: "{not-json" },
  );
}

export function verifyUnknownEntriesAreSkipped(): void {
  const validEvent = sampleEvent({
    sessionId: "verify_unknown_valid",
    completedAt: 250,
  });

  withMockLocalStorage(
    () => {
      const repository = new LocalStorageLearningHistoryRepository();
      const events = repository.getAll();
      assert(
        events.length === 1,
        "verifyUnknownEntriesAreSkipped: expected only valid events",
      );
      assert(
        events[0]?.sessionId === "verify_unknown_valid",
        "verifyUnknownEntriesAreSkipped: expected valid event to remain",
      );
    },
    {
      [LEARNING_HISTORY_STORAGE_KEY]: JSON.stringify([
        { foo: "bar" },
        validEvent,
        null,
        "legacy",
        42,
      ]),
    },
  );
}

export function verifyReturnedArrayMutationDoesNotPersist(): void {
  withMockLocalStorage(() => {
    const repository = new LocalStorageLearningHistoryRepository();
    repository.save(
      sampleEvent({
        sessionId: "verify_persist_isolated_1",
        completedAt: 100,
      }),
    );

    const events = repository.getAll();
    events.pop();
    if (events[0]) {
      events[0].sessionId = "mutated";
    }

    const reloaded = new LocalStorageLearningHistoryRepository();
    const stored = reloaded.getAll();
    assert(
      stored.length === 1,
      "verifyReturnedArrayMutationDoesNotPersist: expected original length",
    );
    assert(
      stored[0]?.sessionId === "verify_persist_isolated_1",
      "verifyReturnedArrayMutationDoesNotPersist: expected original sessionId",
    );
  });
}

export function verifySsrSafe(): void {
  const globalObject = globalThis as typeof globalThis & {
    window?: Window & typeof globalThis;
  };
  assert(
    typeof globalObject.window === "undefined",
    "verifySsrSafe: expected no browser window",
  );

  const repository = new LocalStorageLearningHistoryRepository();
  repository.save(sampleEvent({ sessionId: "verify_ssr_1" }));
  assert(
    repository.getAll().length === 0,
    "verifySsrSafe: save must fail safely without storage",
  );
  assert(repository.getLatest().length === 0, "verifySsrSafe: getLatest");
  assert(
    repository.getByLesson("present-simple").length === 0,
    "verifySsrSafe: getByLesson",
  );
  assert(repository.getByActivity("quiz").length === 0, "verifySsrSafe: getByActivity");
  repository.clear();
}

export function verifyClearedHistoryRemainsInitialized(): void {
  withMockLocalStorage(() => {
    const repository = new LocalStorageLearningHistoryRepository();
    repository.save(sampleEvent({ sessionId: "verify_seed_guard_1" }));
    repository.clear();

    assert(repository.getAll().length === 0, "verifyClearedHistoryRemainsInitialized: empty");
    assert(
      hasPersistedLearningHistory(),
      "verifyClearedHistoryRemainsInitialized: cleared snapshot must remain stored",
    );
  });
}

export function verifyAggregatableFieldsPersist(): void {
  withMockLocalStorage(() => {
    const first = new LocalStorageLearningHistoryRepository();
    first.save({
      sessionId: "verify_aggregate_1",
      activity: "quiz",
      lessonSlug: "present-simple",
      completedAt: 100,
      scorePercentage: 80,
      flashEasy: 1,
      flashMedium: 2,
      flashHard: 3,
    } as LearningEvent);

    const second = new LocalStorageLearningHistoryRepository();
    const event = second.getAll()[0] as {
      scorePercentage?: number;
      flashEasy?: number;
      flashMedium?: number;
      flashHard?: number;
      sessionId?: string;
    };

    assert(event?.scorePercentage === 80, "verifyAggregatableFieldsPersist: score");
    assert(event?.flashEasy === 1, "verifyAggregatableFieldsPersist: flashEasy");
    assert(event?.flashMedium === 2, "verifyAggregatableFieldsPersist: flashMedium");
    assert(event?.flashHard === 3, "verifyAggregatableFieldsPersist: flashHard");
  });
}

export function verifyDashboardSeedBehavior(): void {
  withMockLocalStorage((store) => {
    function loadDashboard() {
      return {
        events: createLearningHistoryRepository().getAll(),
        summary: loadDashboardHistory(),
      };
    }

    const firstVisit = loadDashboard();
    assert(
      firstVisit.events.length === 0,
      "verifyDashboardSeedBehavior: first visit must not seed",
    );
    assert(
      firstVisit.summary.totalActivities === 0,
      "verifyDashboardSeedBehavior: empty summary on first visit",
    );
    assert(
      store[LEARNING_HISTORY_STORAGE_KEY] === undefined,
      "verifyDashboardSeedBehavior: empty load must not write storage",
    );

    const afterRefresh = loadDashboard();
    assert(
      afterRefresh.events.length === 0,
      "verifyDashboardSeedBehavior: refresh must stay empty",
    );

    const repository = new LocalStorageLearningHistoryRepository();
    repository.clear();

    const afterClearRefresh = loadDashboard();
    assert(
      afterClearRefresh.events.length === 0,
      "verifyDashboardSeedBehavior: cleared history must stay empty after reload",
    );
    assert(
      afterClearRefresh.summary.totalActivities === 0,
      "verifyDashboardSeedBehavior: cleared summary stays empty",
    );
  });
}

export function verifyFactorySelection(): void {
  const serverRepository = createLearningHistoryRepository();
  assert(
    serverRepository instanceof MemoryLearningHistoryRepository,
    "verifyFactorySelection: non-browser uses memory repository",
  );

  withMockLocalStorage(() => {
    const browserRepository = createLearningHistoryRepository();
    assert(
      browserRepository instanceof LocalStorageLearningHistoryRepository,
      "verifyFactorySelection: browser uses localStorage repository",
    );
  });
}

export function runHistoryVerification(): void {
  runRepositoryContract(createMemoryRepository);
  verifySsrSafe();
  verifyFactorySelection();
  withMockLocalStorage(() => {
    runRepositoryContract(createLocalStorageRepository);
  });
  verifyPersistenceAcrossInstances();
  verifyPersistedClearSurvivesReload();
  verifyMalformedStorageDoesNotCrash();
  verifyUnknownEntriesAreSkipped();
  verifyReturnedArrayMutationDoesNotPersist();
  verifyClearedHistoryRemainsInitialized();
  verifyAggregatableFieldsPersist();
  verifyDashboardSeedBehavior();
}
