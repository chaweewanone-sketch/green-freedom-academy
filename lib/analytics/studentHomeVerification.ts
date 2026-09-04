import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildCurriculumProgress } from "@/lib/analytics/curriculumProgress";
import { buildLearningJourney } from "@/lib/analytics/journey";
import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildStudentLearningHome } from "@/lib/analytics/studentHome";
import { buildLearningSummary } from "@/lib/analytics/summary";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import type {
  AggregatableLearningEvent,
  LearningSummary,
} from "@/types/analytics";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function emptySummary(): LearningSummary {
  return {
    totalActivities: 0,
    quizAttempts: 0,
    millionaireAttempts: 0,
    flashCardAttempts: 0,
    averageQuizScore: 0,
    averageMillionaireScore: 0,
    flashEasy: 0,
    flashMedium: 0,
    flashHard: 0,
  };
}

function makeEvent(
  overrides: Partial<AggregatableLearningEvent> &
    Pick<AggregatableLearningEvent, "activity" | "lessonSlug">,
): AggregatableLearningEvent {
  return {
    sessionId: overrides.sessionId ?? "session",
    completedAt: overrides.completedAt ?? 1,
    activity: overrides.activity,
    lessonSlug: overrides.lessonSlug,
    scorePercentage: overrides.scorePercentage,
    flashEasy: overrides.flashEasy,
    flashMedium: overrides.flashMedium,
    flashHard: overrides.flashHard,
  };
}

function presentCompleteEvents(
  startAt: number = 1,
): AggregatableLearningEvent[] {
  return [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: startAt,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: startAt + 1,
    }),
  ];
}

function pastCompleteEvents(startAt: number = 10): AggregatableLearningEvent[] {
  return [
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: startAt,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: startAt + 1,
    }),
  ];
}

function homeFromEvents(
  events: AggregatableLearningEvent[],
  summary: LearningSummary = emptySummary(),
) {
  return buildStudentLearningHome(summary, events);
}

export function verifyEmptyHistoryStartsPresent(): void {
  const model = homeFromEvents([]);
  const resume = buildResumeLearning(emptySummary(), []);
  assert(
    JSON.stringify(model.resumeLearning) === JSON.stringify(resume),
    "1: resume reused",
  );
  assert(model.resumeLearning.action.lessonSlug === "present-simple", "1: Present");
  assert(model.resumeLearning.action.actionType === "LEARN", "1: LEARN");
  assert(
    model.resumeLearning.action.href === getLessonPath("present-simple"),
    "1: lesson path",
  );
  assert(model.resumeLearning.action.label === "เริ่มเรียน", "1: เริ่มเรียน");
  assert(model.resumeLearning.title === "เริ่มการเรียนรู้", "1: empty heading");
  assert(model.activeLesson?.lessonSlug === "present-simple", "1: active Present");
  assert(model.activeLesson?.stage === "LEARN", "1: LEARN stage");
  assert(model.curriculumProgress.completedLessons === 0, "1: 0 complete");
  assert(model.curriculumProgress.totalLessons === 2, "1: 2 lessons");
  assert(model.latestActivity === undefined, "1: no latest activity");
  assert(!model.hasHistory, "1: empty history");
}

export function verifyWeakPresentQuizResumesQuiz(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ];
  const model = homeFromEvents(events);
  assert(model.resumeLearning.action.actionType === "PRACTICE", "2: PRACTICE");
  assert(
    model.resumeLearning.action.href === getActivityPath("present-simple", "quiz"),
    "2: Present Quiz",
  );
  assert(model.activeLesson?.lessonSlug === "present-simple", "2: active Present");
  assert(model.activeLesson?.stage === "PRACTICE", "2: PRACTICE stage");
}

export function verifyStrongPresentQuizResumesMillionaire(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
    }),
  ];
  const model = homeFromEvents(events);
  assert(model.resumeLearning.action.actionType === "PLAY", "3: PLAY");
  assert(
    model.resumeLearning.action.href ===
      getActivityPath("present-simple", "millionaire"),
    "3: Present Millionaire",
  );
  assert(
    model.resumeLearning.action.label === "เล่น Millionaire",
    "3: เล่น Millionaire",
  );
  assert(model.activeLesson?.lessonSlug === "present-simple", "3: active Present");
}

export function verifyPresentCompleteResumesPastLesson(): void {
  const events = presentCompleteEvents();
  const model = homeFromEvents(events);
  assert(model.resumeLearning.action.lessonSlug === "past-simple", "4: Past");
  assert(model.resumeLearning.action.actionType === "SUMMARY", "4: SUMMARY");
  assert(
    model.resumeLearning.action.href === getDashboardPath(),
    "4: /dashboard",
  );
  assert(model.activeLesson?.lessonSlug === "past-simple", "4: active Past");
  assert(model.activeLesson?.stage === "LEARN", "4: Past LEARN");
  assert(model.curriculumProgress.completedLessons === 1, "4: 1/2");
}

export function verifyPreexistingPastProgressReused(): void {
  const events = [
    ...presentCompleteEvents(),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 90,
      completedAt: 20,
    }),
  ];
  const model = homeFromEvents(events);
  assert(model.resumeLearning.action.lessonSlug === "past-simple", "5: Past");
  assert(model.resumeLearning.action.actionType === "SUMMARY", "5: SUMMARY");
  assert(
    model.resumeLearning.action.href === getDashboardPath(),
    "5: dashboard not Past Millionaire",
  );
  assert(model.activeLesson?.lessonSlug === "past-simple", "5: active Past");
}

export function verifyCurriculumCompleteShowsSummaryAction(): void {
  const events = [...presentCompleteEvents(), ...pastCompleteEvents()];
  const model = homeFromEvents(events);
  assert(model.resumeLearning.action.actionType === "SUMMARY", "6: SUMMARY");
  assert(
    model.resumeLearning.action.href === getDashboardPath(),
    "6: /dashboard",
  );
  assert(model.resumeLearning.title === "เรียนครบหลักสูตรแล้ว", "6: complete heading");
  assert(model.activeLesson === null, "6: no fake next lesson");
  assert(model.curriculumProgress.isCurriculumComplete, "6: complete");
  assert(
    model.curriculumProgress.completedLessons ===
      model.curriculumProgress.totalLessons,
    "6: all lessons complete",
  );
}

export function verifyActiveLessonDisplayedFromJourney(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ];
  const journey = buildLearningJourney(emptySummary(), events);
  const model = homeFromEvents(events);
  assert(model.activeLesson?.lessonSlug === journey.lessonSlug, "7: journey slug");
  assert(model.activeLesson?.stage === journey.stage, "7: journey stage");
  assert(model.activeLesson?.lessonTitle === "Present Simple", "7: title");
}

export function verifyLatestActivityRemainsDescriptive(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
      completedAt: 1,
    }),
    makeEvent({
      activity: "flash-cards",
      lessonSlug: "past-simple",
      completedAt: 99,
      flashEasy: 1,
      flashMedium: 0,
      flashHard: 0,
    }),
  ];
  const summary = buildLearningSummary(events);
  const model = buildStudentLearningHome(summary, events);
  assert(summary.latestActivity === "flash-cards", "8: summary latest activity");
  assert(summary.latestLesson === "past-simple", "8: summary latest lesson");
  assert(model.latestActivity?.activity === "flash-cards", "8: home latest activity");
  assert(model.latestActivity?.lessonSlug === "past-simple", "8: home latest lesson");
  assert(
    model.activeLesson?.lessonSlug === "present-simple",
    "8: active lesson still Present",
  );
}

export function verifyOverallProgressReusedFromCurriculum(): void {
  const events = presentCompleteEvents();
  const progress = buildCurriculumProgress(events);
  const model = homeFromEvents(events);
  assert(
    model.curriculumProgress.completedLessons === progress.completedLessons,
    "9: completed reused",
  );
  assert(
    model.curriculumProgress.totalLessons === progress.totalLessons,
    "9: total reused",
  );
  assert(
    model.curriculumProgress.overallProgressPercent ===
      progress.overallProgressPercent,
    "9: overall % reused",
  );
  assert(
    model.curriculumProgress.isCurriculumComplete ===
      progress.isCurriculumComplete,
    "9: complete flag reused",
  );
}

export function verifyNoPolicyDuplication(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ];
  const summary = emptySummary();
  const model = buildStudentLearningHome(summary, events);
  const resume = buildResumeLearning(summary, events);
  const recommendation = buildLearningRecommendation(summary, events);
  const journey = buildLearningJourney(summary, events);
  assert(
    JSON.stringify(model.resumeLearning) === JSON.stringify(resume),
    "10: resume not independently scored",
  );
  assert(model.resumeLearning.action.href === recommendation.href, "10: same href");
  assert(model.activeLesson?.lessonSlug === journey.lessonSlug, "10: same lesson");
  assert(model.activeLesson?.stage === journey.stage, "10: same stage");
}

export function verifyUnknownLessonSafe(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "not-a-real-lesson",
      scorePercentage: 100,
    }),
  ];
  const model = homeFromEvents(events);
  assert(model.resumeLearning.action.lessonSlug === "present-simple", "11: Present");
  assert(
    !model.resumeLearning.action.href.includes("not-a-real-lesson"),
    "11: no fake resume route",
  );
  assert(model.activeLesson?.lessonSlug === "present-simple", "11: active Present");
  assert(
    model.latestActivity === undefined,
    "11: empty summary has no latest",
  );
}

export function verifyDeterministicOutput(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 75,
    }),
  ];
  const copy = events.map((event) => ({ ...event }));
  const first = homeFromEvents(events);
  const second = homeFromEvents(copy);
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "12: same input same output",
  );
}

export function verifyInputsNotMutated(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ];
  const summary = emptySummary();
  const eventsSnapshot = JSON.stringify(events);
  const summarySnapshot = JSON.stringify(summary);
  Object.freeze(events);
  events.forEach((event) => Object.freeze(event));
  Object.freeze(summary);
  buildStudentLearningHome(summary, events);
  assert(JSON.stringify(events) === eventsSnapshot, "13: events not mutated");
  assert(JSON.stringify(summary) === summarySnapshot, "13: summary not mutated");
}

export function verifyDashboardHref(): void {
  const model = homeFromEvents([]);
  assert(model.dashboardHref === getDashboardPath(), "14: /dashboard");
}

export function verifyNoDirectStorageDependencies(): void {
  const source = readFileSync(
    resolve(process.cwd(), "lib/analytics/studentHome.ts"),
    "utf8",
  );
  assert(!source.includes("localStorage"), "15: no localStorage");
  assert(!source.includes("LearningHistoryRepository"), "15: no repository type");
  assert(
    !source.includes("createLearningHistoryRepository"),
    "15: no repository factory",
  );
  assert(!source.includes("loadDashboard"), "15: no dashboard loader");
}

export function runStudentHomeVerification(): void {
  verifyEmptyHistoryStartsPresent();
  verifyWeakPresentQuizResumesQuiz();
  verifyStrongPresentQuizResumesMillionaire();
  verifyPresentCompleteResumesPastLesson();
  verifyPreexistingPastProgressReused();
  verifyCurriculumCompleteShowsSummaryAction();
  verifyActiveLessonDisplayedFromJourney();
  verifyLatestActivityRemainsDescriptive();
  verifyOverallProgressReusedFromCurriculum();
  verifyNoPolicyDuplication();
  verifyUnknownLessonSafe();
  verifyDeterministicOutput();
  verifyInputsNotMutated();
  verifyDashboardHref();
  verifyNoDirectStorageDependencies();
}
