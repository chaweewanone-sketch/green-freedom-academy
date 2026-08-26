import { populateSampleHistory } from "@/lib/analytics/sample-data";
import type { AssessmentResult } from "@/types/assessment-result";
import type { LearningSummary } from "@/types/analytics";
import type { FlashCardResult } from "@/types/recall";
import { createLearningHistoryRepository } from "./createRepository";
import { loadDashboardHistory } from "./loadDashboardHistory";
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

function quizResult(overrides: Partial<AssessmentResult> = {}): AssessmentResult {
  return {
    sessionId: "sprint19_quiz_1",
    activity: "quiz",
    score: 16,
    correct: 16,
    incorrect: 4,
    percentage: 80,
    completedAt: 1_700_001_000_000,
    ...overrides,
  };
}

function millionaireResult(
  overrides: Partial<AssessmentResult> = {},
): AssessmentResult {
  return {
    sessionId: "sprint19_millionaire_1",
    activity: "millionaire",
    score: 8,
    correct: 8,
    incorrect: 2,
    percentage: 80,
    completedAt: 1_700_001_100_000,
    ...overrides,
  };
}

function flashResult(overrides: Partial<FlashCardResult> = {}): FlashCardResult {
  return {
    sessionId: "sprint19_flash_1",
    activity: "flash-cards",
    totalCards: 6,
    reviewedCards: 6,
    easy: 3,
    medium: 2,
    hard: 1,
    reviews: [],
    completedAt: 1_700_001_200_000,
    ...overrides,
  };
}

function assertEmptySummary(summary: LearningSummary, message: string): void {
  assert(summary.totalActivities === 0, `${message}: totalActivities`);
  assert(summary.quizAttempts === 0, `${message}: quizAttempts`);
  assert(summary.millionaireAttempts === 0, `${message}: millionaireAttempts`);
  assert(summary.flashCardAttempts === 0, `${message}: flashCardAttempts`);
  assert(summary.averageQuizScore === 0, `${message}: averageQuizScore`);
  assert(summary.averageMillionaireScore === 0, `${message}: averageMillionaireScore`);
  assert(summary.flashEasy === 0, `${message}: flashEasy`);
  assert(summary.flashMedium === 0, `${message}: flashMedium`);
  assert(summary.flashHard === 0, `${message}: flashHard`);
  assert(summary.latestActivity === undefined, `${message}: latestActivity`);
  assert(summary.latestLesson === undefined, `${message}: latestLesson`);
}

function verifyActivityPipeline(
  label: string,
  incomplete: { result: AssessmentResult | FlashCardResult | null; lessonSlug: string },
  first: { result: AssessmentResult | FlashCardResult; lessonSlug: string },
  second: { result: AssessmentResult | FlashCardResult; lessonSlug: string },
  expectedActivity: string,
): void {
  withMockLocalStorage(() => {
    const incompleteRepo = createLearningHistoryRepository();
    const skipped = recordActivityCompletion({
      result: incomplete.result,
      lessonSlug: incomplete.lessonSlug,
      repository: incompleteRepo,
    });
    assert(skipped === null, `${label}: incomplete must not save`);
    assert(incompleteRepo.getAll().length === 0, `${label}: incomplete history empty`);
    assertEmptySummary(
      loadDashboardHistory(incompleteRepo),
      `${label}: incomplete dashboard`,
    );

    recordActivityCompletion({
      result: first.result,
      lessonSlug: first.lessonSlug,
    });

    const afterFirst = new LocalStorageLearningHistoryRepository();
    assert(afterFirst.getAll().length === 1, `${label}: one event after complete`);
    assert(afterFirst.getAll()[0]?.activity === expectedActivity, `${label}: activity`);
    assert(
      afterFirst.getAll()[0]?.lessonSlug === first.lessonSlug,
      `${label}: lesson identity`,
    );

    const refreshed = loadDashboardHistory();
    assert(refreshed.totalActivities === 1, `${label}: dashboard persists after reload`);

    recordActivityCompletion({
      result: first.result,
      lessonSlug: first.lessonSlug,
    });
    assert(
      createLearningHistoryRepository().getAll().length === 1,
      `${label}: result-screen rerender must not duplicate`,
    );

    recordActivityCompletion({
      result: second.result,
      lessonSlug: second.lessonSlug,
    });

    const afterSecond = createLearningHistoryRepository();
    assert(afterSecond.getAll().length === 2, `${label}: second attempt saves new event`);
    const summary = loadDashboardHistory(afterSecond);
    assert(summary.totalActivities === 2, `${label}: dashboard shows two attempts`);
  });
}

export function verifyDashboardDoesNotAutoSeed(): void {
  withMockLocalStorage((store) => {
    const summary = loadDashboardHistory();
    assertEmptySummary(summary, "verifyDashboardDoesNotAutoSeed");
    assert(
      store[LEARNING_HISTORY_STORAGE_KEY] === undefined,
      "verifyDashboardDoesNotAutoSeed: must not write sample events",
    );
  });
}

export function verifyEmptyDashboardState(): void {
  const repository = new MemoryLearningHistoryRepository();
  assertEmptySummary(
    loadDashboardHistory(repository),
    "verifyEmptyDashboardState",
  );
}

export function verifyRealHistoryAnalytics(): void {
  const repository = new MemoryLearningHistoryRepository();

  recordActivityCompletion({
    result: quizResult({
      sessionId: "analytics_quiz_1",
      percentage: 80,
      completedAt: 100,
    }),
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: quizResult({
      sessionId: "analytics_quiz_2",
      percentage: 100,
      completedAt: 400,
    }),
    lessonSlug: "past-simple",
    repository,
  });
  recordActivityCompletion({
    result: millionaireResult({
      sessionId: "analytics_millionaire_1",
      percentage: 80,
      completedAt: 200,
    }),
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: millionaireResult({
      sessionId: "analytics_millionaire_2",
      percentage: 70,
      completedAt: 250,
    }),
    lessonSlug: "past-simple",
    repository,
  });
  recordActivityCompletion({
    result: flashResult({
      sessionId: "analytics_flash_1",
      easy: 3,
      medium: 2,
      hard: 1,
      completedAt: 300,
    }),
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: flashResult({
      sessionId: "analytics_flash_2",
      easy: 1,
      medium: 0,
      hard: 2,
      completedAt: 350,
    }),
    lessonSlug: "past-simple",
    repository,
  });

  const summary = loadDashboardHistory(repository);

  assert(summary.totalActivities === 6, "verifyRealHistoryAnalytics: total");
  assert(summary.quizAttempts === 2, "verifyRealHistoryAnalytics: quiz count");
  assert(
    summary.millionaireAttempts === 2,
    "verifyRealHistoryAnalytics: millionaire count",
  );
  assert(summary.flashCardAttempts === 2, "verifyRealHistoryAnalytics: flash count");
  assert(summary.averageQuizScore === 90, "verifyRealHistoryAnalytics: quiz average");
  assert(
    summary.averageMillionaireScore === 75,
    "verifyRealHistoryAnalytics: millionaire average",
  );
  assert(summary.flashEasy === 4, "verifyRealHistoryAnalytics: flashEasy");
  assert(summary.flashMedium === 2, "verifyRealHistoryAnalytics: flashMedium");
  assert(summary.flashHard === 3, "verifyRealHistoryAnalytics: flashHard");
  assert(summary.latestActivity === "quiz", "verifyRealHistoryAnalytics: latest activity");
  assert(summary.latestLesson === "past-simple", "verifyRealHistoryAnalytics: latest lesson");
}

export function verifyClearedDashboardStaysEmpty(): void {
  withMockLocalStorage(() => {
    recordActivityCompletion({
      result: quizResult(),
      lessonSlug: "present-simple",
    });

    const repository = createLearningHistoryRepository();
    assert(repository.getAll().length === 1, "verifyClearedDashboardStaysEmpty: seeded real event");
    repository.clear();

    assertEmptySummary(
      loadDashboardHistory(repository),
      "verifyClearedDashboardStaysEmpty: after clear",
    );

    const reloaded = new LocalStorageLearningHistoryRepository();
    assert(reloaded.getAll().length === 0, "verifyClearedDashboardStaysEmpty: reconstructed empty");
    assertEmptySummary(
      loadDashboardHistory(),
      "verifyClearedDashboardStaysEmpty: refresh after clear",
    );
  });
}

export function verifySampleFixtureStillWorks(): void {
  const repository = new MemoryLearningHistoryRepository();
  populateSampleHistory(repository);
  assert(
    repository.getAll().length === 5,
    "verifySampleFixtureStillWorks: explicit fixture helper still saves sample events",
  );
}

export function verifyQuizPipeline(): void {
  verifyActivityPipeline(
    "verifyQuizPipeline",
    { result: quizResult({ sessionId: "  " }), lessonSlug: "present-simple" },
    {
      result: quizResult({ sessionId: "quiz_complete_1", completedAt: 1_000 }),
      lessonSlug: "present-simple",
    },
    {
      result: quizResult({ sessionId: "quiz_complete_1", completedAt: 2_000 }),
      lessonSlug: "present-simple",
    },
    "quiz",
  );
}

export function verifyMillionairePipeline(): void {
  verifyActivityPipeline(
    "verifyMillionairePipeline",
    { result: millionaireResult(), lessonSlug: "" },
    {
      result: millionaireResult({
        sessionId: "millionaire_complete_1",
        completedAt: 1_000,
      }),
      lessonSlug: "present-simple",
    },
    {
      result: millionaireResult({
        sessionId: "millionaire_complete_1",
        completedAt: 2_000,
      }),
      lessonSlug: "present-simple",
    },
    "millionaire",
  );
}

export function verifyFlashCardsPipeline(): void {
  verifyActivityPipeline(
    "verifyFlashCardsPipeline",
    {
      result: flashResult({ reviewedCards: 2, totalCards: 6 }),
      lessonSlug: "present-simple",
    },
    {
      result: flashResult({ sessionId: "flash_complete_1", completedAt: 1_000 }),
      lessonSlug: "present-simple",
    },
    {
      result: flashResult({ sessionId: "flash_complete_1", completedAt: 2_000 }),
      lessonSlug: "present-simple",
    },
    "flash-cards",
  );
}

export function runDashboardVerification(): void {
  verifyDashboardDoesNotAutoSeed();
  verifyEmptyDashboardState();
  verifyRealHistoryAnalytics();
  verifyClearedDashboardStaysEmpty();
  verifySampleFixtureStillWorks();
  verifyQuizPipeline();
  verifyMillionairePipeline();
  verifyFlashCardsPipeline();
}
