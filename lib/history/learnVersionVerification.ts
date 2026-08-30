import { buildLearningJourney } from "@/lib/analytics/journey";
import { buildLessonEntry } from "@/lib/analytics/lessonEntry";
import { JOURNEY_ACTION_LABELS, evaluateLessonJourney } from "@/lib/analytics/lessonProgress";
import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildStudentLearningHome } from "@/lib/analytics/studentHome";
import {
  buildLearningSummary,
  buildLearningSummaryForLesson,
} from "@/lib/analytics/summary";
import { getActivityPath, getLessonPath } from "@/lib/routes";
import { pastSimpleLesson } from "@/lib/lessons/past-simple";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import {
  LEARN_ACTIVITY,
  LEARNING_HISTORY_STORAGE_KEY,
  LocalStorageLearningHistoryRepository,
  MemoryLearningHistoryRepository,
  buildLearnSessionId,
  getEffectiveLearnVersion,
  getLessonContentVersion,
  hasCurrentLearnCompletion,
  hasHistoricalLearnCompletion,
  hasLearnCompletion,
  recordActivityCompletion,
  recordLearnCompletion,
} from "@/lib/history";
import type { AggregatableLearningEvent, LearningEvent } from "@/types/analytics";
import type { AssessmentResult } from "@/types/assessment-result";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function legacyLearn(lessonSlug: string, completedAt: number = 1): LearningEvent {
  return {
    sessionId: `${LEARN_ACTIVITY}:${lessonSlug}`,
    activity: LEARN_ACTIVITY,
    lessonSlug,
    completedAt,
  };
}

function versionedLearn(
  lessonSlug: string,
  version: number,
  completedAt: number = 2,
): LearningEvent {
  return {
    sessionId: buildLearnSessionId(lessonSlug, version),
    activity: LEARN_ACTIVITY,
    lessonSlug,
    completedAt,
    lessonContentVersion: version,
  };
}

function quizEvent(completedAt: number = 10): AggregatableLearningEvent {
  return {
    sessionId: "version_quiz",
    activity: "quiz",
    lessonSlug: "present-simple",
    completedAt,
    scorePercentage: 80,
  };
}

function millionaireEvent(completedAt: number = 11): AggregatableLearningEvent {
  return {
    sessionId: "version_millionaire",
    activity: "millionaire",
    lessonSlug: "present-simple",
    completedAt,
    scorePercentage: 90,
  };
}

function assessment(
  overrides: Partial<AssessmentResult> & Pick<AssessmentResult, "activity">,
): AssessmentResult {
  return {
    sessionId: overrides.sessionId ?? "version_activity",
    activity: overrides.activity,
    score: overrides.score ?? 8,
    correct: overrides.correct ?? 8,
    incorrect: overrides.incorrect ?? 2,
    percentage: overrides.percentage ?? 80,
    completedAt: overrides.completedAt ?? 20,
  };
}

type StorageStore = Record<string, string>;

function withMockLocalStorage(run: () => void): void {
  const store: StorageStore = {};
  const storage: Storage = {
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
    run();
  } finally {
    if (hadWindow) {
      globalObject.window = previousWindow as Window & typeof globalThis;
    } else {
      Reflect.deleteProperty(globalObject, "window");
    }

    if (hadLocalStorage) {
      globalObject.localStorage = previousLocalStorage as Storage;
    } else {
      Reflect.deleteProperty(globalObject, "localStorage");
    }
  }
}

export function verifyNoLearnHistory(): void {
  const events: LearningEvent[] = [];
  assert(!hasHistoricalLearnCompletion(events, "present-simple"), "A: historical false");
  assert(!hasCurrentLearnCompletion(events, "present-simple"), "A: current false");
  assert(!hasLearnCompletion(events, "present-simple"), "A: alias false");
}

export function verifyLegacyPresentSimpleStaysLearn(): void {
  const events = [legacyLearn("present-simple")];
  assert(hasHistoricalLearnCompletion(events, "present-simple"), "B: historical true");
  assert(getEffectiveLearnVersion(events[0]!) === 1, "B: effective v1");
  assert(!hasCurrentLearnCompletion(events, "present-simple"), "B: current v2 false");

  const summary = buildLearningSummary(events);
  const journey = buildLearningJourney(summary, events);
  const recommendation = buildLearningRecommendation(summary, events);
  const home = buildStudentLearningHome(summary, events);
  const resume = buildResumeLearning(summary, events);
  const entry = buildLessonEntry("present-simple", events);

  assert(journey.stage === "LEARN", "B: journey LEARN");
  assert(journey.nextAction.label === JOURNEY_ACTION_LABELS.learn, "B: เริ่มเรียน");
  assert(
    journey.nextAction.href === getLessonPath("present-simple"),
    "B: journey lesson href",
  );
  assert(recommendation.href === getLessonPath("present-simple"), "B: rec Learn");
  assert(recommendation.ctaLabel === JOURNEY_ACTION_LABELS.learn, "B: rec เริ่มเรียน");
  assert(recommendation.reasonCode !== "LEARN_COMPLETE", "B: not LEARN_COMPLETE");
  assert(home.resumeLearning.action.href === getLessonPath("present-simple"), "B: home Learn");
  assert(resume.action.href === getLessonPath("present-simple"), "B: resume Learn");
  assert(entry.nextAction.href === getLessonPath("present-simple"), "B: entry Learn");
}

export function verifyCurrentPresentSimpleAdvancesToPractice(): void {
  const events = [versionedLearn("present-simple", 2)];
  assert(hasHistoricalLearnCompletion(events, "present-simple"), "C: historical true");
  assert(hasCurrentLearnCompletion(events, "present-simple"), "C: current true");

  const summary = buildLearningSummary(events);
  const journey = buildLearningJourney(summary, events);
  const recommendation = buildLearningRecommendation(summary, events);

  assert(journey.stage === "PRACTICE", "C: journey PRACTICE");
  assert(journey.reasonCode === "LEARN_COMPLETE", "C: LEARN_COMPLETE");
  assert(
    journey.nextAction.href === getActivityPath("present-simple", "quiz"),
    "C: Quiz",
  );
  assert(
    recommendation.href === getActivityPath("present-simple", "quiz"),
    "C: rec Quiz",
  );
}

export function verifyLegacyAndCurrentCoexist(): void {
  const repository = new MemoryLearningHistoryRepository();
  repository.save(legacyLearn("present-simple", 1));
  const first = recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 2,
  });
  const second = recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 3,
  });

  const events = repository.getAll();
  assert(events.length === 2, "D: both events retained");
  assert(hasHistoricalLearnCompletion(events, "present-simple"), "D: historical");
  assert(hasCurrentLearnCompletion(events, "present-simple"), "D: current");
  assert(first?.lessonContentVersion === 2, "D: wrote v2");
  assert(first?.sessionId === second?.sessionId, "D: no duplicate v2");
  assert(first?.completedAt === second?.completedAt, "D: original v2 timestamp");
  assert(events.some((event) => !("lessonContentVersion" in event)), "D: v1 kept");
}

export function verifyPastSimpleLegacyIsCurrent(): void {
  const events = [legacyLearn("past-simple")];
  assert(getLessonContentVersion("past-simple") === 1, "E: Past version 1");
  assert(getEffectiveLearnVersion(events[0]!) === 1, "E: effective v1");
  assert(hasCurrentLearnCompletion(events, "past-simple"), "E: current true");

  const repository = new MemoryLearningHistoryRepository();
  repository.save(legacyLearn("past-simple", 1));
  const repeat = recordLearnCompletion({
    lessonSlug: "past-simple",
    repository,
    completedAt: 9,
  });
  assert(repository.getAll().length === 1, "E: no duplicate Past write");
  assert(repeat?.completedAt === 1, "E: original Past event returned");
}

export function verifyMinorEditKeepsCurrentCompletion(): void {
  assert(presentSimpleLesson.contentVersion === 2, "F: Present still v2");
  assert(pastSimpleLesson.contentVersion === 1, "F: Past still v1");
  const events = [versionedLearn("present-simple", 2)];
  assert(hasCurrentLearnCompletion(events, "present-simple", 2), "F: still current");
}

export function verifyVersionBumpInvalidatesCurrent(): void {
  const events = [versionedLearn("present-simple", 2)];
  assert(hasCurrentLearnCompletion(events, "present-simple", 2), "G: v2 current");
  assert(!hasCurrentLearnCompletion(events, "present-simple", 3), "G: v3 not current");
  assert(hasHistoricalLearnCompletion(events, "present-simple"), "G: history kept");
}

export function verifyQuizHistoryPreserved(): void {
  const events: AggregatableLearningEvent[] = [
    legacyLearn("present-simple"),
    quizEvent(),
  ];
  assert(events[1]?.activity === "quiz", "H: quiz kept");
  assert(events[1]?.scorePercentage === 80, "H: score kept");
  assert(!("lessonContentVersion" in events[1]!), "H: quiz unversioned");

  const journey = buildLearningJourney(buildLearningSummary(events), events);
  assert(journey.stage === "PRACTICE", "H: quiz still drives PRACTICE");
  assert(journey.reasonCode === "QUIZ_DEVELOPING", "H: later-stage unchanged");
}

export function verifyMillionaireHistoryPreserved(): void {
  const events: AggregatableLearningEvent[] = [
    legacyLearn("present-simple"),
    quizEvent(10),
    millionaireEvent(11),
  ];
  assert(events[2]?.activity === "millionaire", "I: millionaire kept");
  assert(events[2]?.scorePercentage === 90, "I: score kept");

  const presentJourney = evaluateLessonJourney(
    buildLearningSummaryForLesson(events, "present-simple"),
    "present-simple",
    events,
  );
  assert(presentJourney.stage === "COMPLETE", "I: strong millionaire still COMPLETE");
}

export function verifyLocalStorageRoundTrip(): void {
  withMockLocalStorage(() => {
    const first = new LocalStorageLearningHistoryRepository();
    first.save(legacyLearn("present-simple", 5));
    first.save(versionedLearn("present-simple", 2, 6));
    first.save({
      sessionId: "bad_version",
      activity: LEARN_ACTIVITY,
      lessonSlug: "present-simple",
      completedAt: 7,
      lessonContentVersion: -3,
    } as LearningEvent);
    first.save(quizEvent(8));

    assert(
      LEARNING_HISTORY_STORAGE_KEY === "gfa.learningHistory.v1",
      "J: storage key",
    );

    const second = new LocalStorageLearningHistoryRepository();
    const events = second.getAll() as AggregatableLearningEvent[];
    assert(events.length === 4, "J: all rows hydrate");
    assert(events[0]?.lessonContentVersion === undefined, "J: legacy field absent");
    assert(getEffectiveLearnVersion(events[0]!) === 1, "J: legacy effective v1");
    assert(events[1]?.lessonContentVersion === 2, "J: version survives");
    assert(events[2]?.lessonContentVersion === undefined, "J: invalid version dropped");
    assert(events[3]?.activity === "quiz", "J: quiz hydrate");
    assert(events[3]?.scorePercentage === 80, "J: quiz score");
  });
}

export function verifyRecordLearnCompletionByVersion(): void {
  const repository = new MemoryLearningHistoryRepository();
  const first = recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 1,
    lessonContentVersion: 1,
  });
  const repeatV1 = recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 2,
    lessonContentVersion: 1,
  });
  const v2 = recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 3,
  });
  const repeatV2 = recordLearnCompletion({
    lessonSlug: "present-simple",
    repository,
    completedAt: 4,
  });

  const events = repository.getAll();
  assert(events.length === 2, "K: one per version");
  assert(first?.lessonContentVersion === 1, "K: v1 written");
  assert(repeatV1?.completedAt === 1, "K: v1 no-op");
  assert(v2?.lessonContentVersion === 2, "K: newer version added");
  assert(v2?.sessionId === buildLearnSessionId("present-simple", 2), "K: versioned sessionId");
  assert(repeatV2?.completedAt === 3, "K: v2 no-op");
}

export function verifyActivityRecorderUnchanged(): void {
  const repository = new MemoryLearningHistoryRepository();
  recordActivityCompletion({
    result: assessment({ activity: "quiz", completedAt: 20 }),
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result: assessment({
      activity: "millionaire",
      sessionId: "version_millionaire",
      percentage: 90,
      completedAt: 21,
    }),
    lessonSlug: "present-simple",
    repository,
  });

  const events = repository.getAll() as AggregatableLearningEvent[];
  assert(events.every((event) => event.lessonContentVersion === undefined), "K: activities unversioned");
}

export function verifyLessonMetadata(): void {
  assert(presentSimpleLesson.contentVersion === 2, "meta: Present 2");
  assert(pastSimpleLesson.contentVersion === 1, "meta: Past 1");
  assert(presentSimpleLesson.steps.length === 8, "meta: 8 sections");
  assert(pastSimpleLesson.steps.length === 4, "meta: Past 4");
}

export function runLearnVersionVerification(): void {
  verifyLessonMetadata();
  verifyNoLearnHistory();
  verifyLegacyPresentSimpleStaysLearn();
  verifyCurrentPresentSimpleAdvancesToPractice();
  verifyLegacyAndCurrentCoexist();
  verifyPastSimpleLegacyIsCurrent();
  verifyMinorEditKeepsCurrentCompletion();
  verifyVersionBumpInvalidatesCurrent();
  verifyQuizHistoryPreserved();
  verifyMillionaireHistoryPreserved();
  verifyLocalStorageRoundTrip();
  verifyRecordLearnCompletionByVersion();
  verifyActivityRecorderUnchanged();
}
