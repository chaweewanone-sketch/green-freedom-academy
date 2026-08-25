import type { AggregatableLearningEvent } from "@/types/analytics";
import type { AssessmentResult } from "@/types/assessment-result";
import type { LearningEvent } from "@/types/analytics";
import type { LearningHistoryRepository } from "@/types/history";
import type { FlashCardResult } from "@/types/recall";
import { createLearningHistoryRepository } from "./createRepository";
import {
  LEARNING_HISTORY_STORAGE_KEY,
  LocalStorageLearningHistoryRepository,
} from "./localStorageRepository";
import { MemoryLearningHistoryRepository } from "./memoryRepository";
import { recordActivityCompletion } from "./recordActivityCompletion";

type StorageStore = Record<string, string>;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
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

class SpyRepository extends MemoryLearningHistoryRepository {
  saveCalls = 0;

  save(event: LearningEvent): void {
    this.saveCalls += 1;
    super.save(event);
  }
}

function quizResult(
  overrides: Partial<AssessmentResult> = {},
): AssessmentResult {
  return {
    sessionId: "assessment_quiz_1",
    activity: "quiz",
    score: 8,
    correct: 8,
    incorrect: 2,
    percentage: 80,
    completedAt: 1_700_000_500_000,
    ...overrides,
  };
}

function millionaireResult(
  overrides: Partial<AssessmentResult> = {},
): AssessmentResult {
  return {
    sessionId: "assessment_millionaire_1",
    activity: "millionaire",
    score: 7,
    correct: 7,
    incorrect: 3,
    percentage: 70,
    completedAt: 1_700_000_600_000,
    ...overrides,
  };
}

function flashResult(
  overrides: Partial<FlashCardResult> = {},
): FlashCardResult {
  return {
    sessionId: "assessment_flash_1",
    activity: "flash-cards",
    totalCards: 5,
    reviewedCards: 5,
    easy: 2,
    medium: 2,
    hard: 1,
    reviews: [],
    completedAt: 1_700_000_700_000,
    ...overrides,
  };
}

function asAggregatable(event: LearningEvent | undefined): AggregatableLearningEvent {
  assert(event !== undefined, "expected a learning event");
  return event as AggregatableLearningEvent;
}

export function verifyCompletedActivitySavesOneEvent(): void {
  const repository = new SpyRepository();
  const saved = recordActivityCompletion({
    result: quizResult(),
    lessonSlug: "present-simple",
    repository,
  });

  assert(saved !== null, "verifyCompletedActivitySavesOneEvent: expected saved event");
  assert(repository.saveCalls === 1, "verifyCompletedActivitySavesOneEvent: save once");
  assert(repository.getAll().length === 1, "verifyCompletedActivitySavesOneEvent: one event");
}

export function verifyIncompleteActivitySavesNone(): void {
  const repository = new SpyRepository();

  const skipped = [
    recordActivityCompletion({
      result: null,
      lessonSlug: "present-simple",
      repository,
    }),
    recordActivityCompletion({
      result: quizResult(),
      lessonSlug: "",
      repository,
    }),
    recordActivityCompletion({
      result: quizResult({ sessionId: "   " }),
      lessonSlug: "present-simple",
      repository,
    }),
    recordActivityCompletion({
      result: flashResult({ reviewedCards: 2, totalCards: 5 }),
      lessonSlug: "present-simple",
      repository,
    }),
    recordActivityCompletion({
      result: flashResult({ reviewedCards: 0, totalCards: 0 }),
      lessonSlug: "present-simple",
      repository,
    }),
  ];

  assert(
    skipped.every((event) => event === null),
    "verifyIncompleteActivitySavesNone: expected null results",
  );
  assert(repository.saveCalls === 0, "verifyIncompleteActivitySavesNone: no saves");
  assert(repository.getAll().length === 0, "verifyIncompleteActivitySavesNone: empty history");
}

export function verifyLessonAndActivityIdentity(): void {
  const repository = new MemoryLearningHistoryRepository();

  recordActivityCompletion({
    result: quizResult(),
    lessonSlug: "past-simple",
    repository,
  });
  recordActivityCompletion({
    result: millionaireResult(),
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: flashResult(),
    lessonSlug: "present-simple",
    repository,
  });

  const events = repository.getAll();
  assert(events.length === 3, "verifyLessonAndActivityIdentity: three events");
  assert(events[0]?.activity === "quiz", "verifyLessonAndActivityIdentity: quiz activity");
  assert(events[0]?.lessonSlug === "past-simple", "verifyLessonAndActivityIdentity: quiz lesson");
  assert(
    events[1]?.activity === "millionaire",
    "verifyLessonAndActivityIdentity: millionaire activity",
  );
  assert(
    events[2]?.activity === "flash-cards",
    "verifyLessonAndActivityIdentity: flash activity",
  );
}

export function verifyResultMetricsPreserved(): void {
  const repository = new MemoryLearningHistoryRepository();

  recordActivityCompletion({
    result: quizResult({ percentage: 80 }),
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: flashResult({ easy: 2, medium: 2, hard: 1 }),
    lessonSlug: "present-simple",
    repository,
  });

  const quizEvent = asAggregatable(repository.getByActivity("quiz")[0]);
  const flashEvent = asAggregatable(repository.getByActivity("flash-cards")[0]);

  assert(quizEvent.scorePercentage === 80, "verifyResultMetricsPreserved: quiz score");
  assert(flashEvent.flashEasy === 2, "verifyResultMetricsPreserved: flashEasy");
  assert(flashEvent.flashMedium === 2, "verifyResultMetricsPreserved: flashMedium");
  assert(flashEvent.flashHard === 1, "verifyResultMetricsPreserved: flashHard");
}

export function verifyCompletionTimestampPresent(): void {
  const repository = new MemoryLearningHistoryRepository();
  const result = quizResult({ completedAt: 1_700_000_888_000 });

  recordActivityCompletion({
    result,
    lessonSlug: "present-simple",
    repository,
  });

  assert(
    repository.getAll()[0]?.completedAt === 1_700_000_888_000,
    "verifyCompletionTimestampPresent: completedAt preserved",
  );
}

export function verifyDuplicateCompletionProtection(): void {
  const repository = new SpyRepository();
  const result = quizResult();

  recordActivityCompletion({
    result,
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result,
    lessonSlug: "present-simple",
    repository,
  });

  assert(repository.saveCalls === 1, "verifyDuplicateCompletionProtection: one save");
  assert(repository.getAll().length === 1, "verifyDuplicateCompletionProtection: one event");
}

export function verifySecondAttemptSavesNewEvent(): void {
  const repository = new SpyRepository();
  const first = quizResult({ completedAt: 1_700_000_500_000 });
  const second = quizResult({ completedAt: 1_700_000_500_500 });

  recordActivityCompletion({
    result: first,
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: second,
    lessonSlug: "present-simple",
    repository,
  });

  assert(repository.saveCalls === 2, "verifySecondAttemptSavesNewEvent: two saves");
  assert(repository.getAll().length === 2, "verifySecondAttemptSavesNewEvent: two events");
  assert(
    repository.getAll()[0]?.sessionId === repository.getAll()[1]?.sessionId,
    "verifySecondAttemptSavesNewEvent: same session can replay",
  );
}

export function verifyRecorderUsesInjectedRepository(): void {
  withMockLocalStorage((store) => {
    const repository = new MemoryLearningHistoryRepository();
    recordActivityCompletion({
      result: quizResult(),
      lessonSlug: "present-simple",
      repository,
    });

    assert(
      store[LEARNING_HISTORY_STORAGE_KEY] === undefined,
      "verifyRecorderUsesInjectedRepository: must not write localStorage directly",
    );
    assert(
      repository.getAll().length === 1,
      "verifyRecorderUsesInjectedRepository: injected repository received event",
    );
  });
}

export function verifyRecorderPersistsThroughFactory(): void {
  withMockLocalStorage(() => {
    const saved = recordActivityCompletion({
      result: quizResult({ sessionId: "factory_quiz_1" }),
      lessonSlug: "present-simple",
    });

    assert(saved !== null, "verifyRecorderPersistsThroughFactory: expected save");

    const reloaded = new LocalStorageLearningHistoryRepository();
    assert(
      reloaded.getAll().length === 1,
      "verifyRecorderPersistsThroughFactory: persisted after reload",
    );
    assert(
      reloaded.getAll()[0]?.sessionId === "factory_quiz_1",
      "verifyRecorderPersistsThroughFactory: sessionId persisted",
    );
  });
}

export function verifyClearStillWorksAfterCompletion(): void {
  withMockLocalStorage(() => {
    recordActivityCompletion({
      result: quizResult(),
      lessonSlug: "present-simple",
    });

    const repository = createLearningHistoryRepository();
    repository.clear();

    const reloaded = new LocalStorageLearningHistoryRepository();
    assert(
      reloaded.getAll().length === 0,
      "verifyClearStillWorksAfterCompletion: clear then reload stays empty",
    );
  });
}

export function runCompletionVerification(): void {
  verifyCompletedActivitySavesOneEvent();
  verifyIncompleteActivitySavesNone();
  verifyLessonAndActivityIdentity();
  verifyResultMetricsPreserved();
  verifyCompletionTimestampPresent();
  verifyDuplicateCompletionProtection();
  verifySecondAttemptSavesNewEvent();
  verifyRecorderUsesInjectedRepository();
  verifyRecorderPersistsThroughFactory();
  verifyClearStillWorksAfterCompletion();
}
