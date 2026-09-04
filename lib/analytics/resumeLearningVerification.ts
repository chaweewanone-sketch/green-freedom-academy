import { learnerSafeNavigation } from "@/lib/analytics/learnerLessonLaunch";
import { buildResumeLearning, isKnownResumeHref } from "@/lib/analytics/resumeLearning";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import type { AggregatableLearningEvent, LearningSummary } from "@/types/analytics";
import { buildLearningRecommendation } from "./recommendation";

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

function assertResumeMatchesRecommendation(
  events: AggregatableLearningEvent[],
  message: string,
): ReturnType<typeof buildResumeLearning> {
  const summary = emptySummary();
  const recommendation = buildLearningRecommendation(summary, events);
  const resume = buildResumeLearning(summary, events);
  const safe = learnerSafeNavigation(
    recommendation.href,
    recommendation.ctaLabel,
  );
  assert(resume.action.href === safe.href, `${message}: href from launchable recommendation`);
  assert(
    isKnownResumeHref(resume.action.href, resume.action.lessonSlug),
    `${message}: known route`,
  );
  return resume;
}

export function verifyEmptyHistoryResume(): void {
  const resume = assertResumeMatchesRecommendation([], "1");
  assert(resume.action.lessonSlug === "present-simple", "1: Present Simple");
  assert(resume.action.actionType === "LEARN", "1: LEARN");
  assert(resume.action.href === getLessonPath("present-simple"), "1: lesson path");
  assert(resume.action.label === "เริ่มเรียน", "1: เริ่มเรียน");
  assert(resume.title === "เริ่มการเรียนรู้", "1: empty heading");
}

export function verifyWeakPresentQuizResume(): void {
  const resume = assertResumeMatchesRecommendation(
    [
      makeEvent({
        activity: "quiz",
        lessonSlug: "present-simple",
        scorePercentage: 50,
      }),
    ],
    "2",
  );
  assert(resume.action.actionType === "PRACTICE", "2: PRACTICE");
  assert(
    resume.action.href === getActivityPath("present-simple", "quiz"),
    "2: Present Quiz",
  );
}

export function verifyMediumPresentQuizResume(): void {
  const resume = assertResumeMatchesRecommendation(
    [
      makeEvent({
        activity: "quiz",
        lessonSlug: "present-simple",
        scorePercentage: 75,
      }),
    ],
    "3",
  );
  assert(resume.action.actionType === "PRACTICE", "3: PRACTICE");
  assert(
    resume.action.href === getActivityPath("present-simple", "quiz"),
    "3: Present Quiz",
  );
}

export function verifyStrongPresentQuizResume(): void {
  const resume = assertResumeMatchesRecommendation(
    [
      makeEvent({
        activity: "quiz",
        lessonSlug: "present-simple",
        scorePercentage: 90,
      }),
    ],
    "4",
  );
  assert(resume.action.actionType === "PLAY", "4: PLAY");
  assert(
    resume.action.href === getActivityPath("present-simple", "millionaire"),
    "4: Present Millionaire",
  );
  assert(resume.action.label === "เล่น Millionaire", "4: เล่น Millionaire");
}

export function verifyWeakPresentMillionaireResume(): void {
  const resume = assertResumeMatchesRecommendation(
    [
      makeEvent({
        activity: "millionaire",
        lessonSlug: "present-simple",
        scorePercentage: 60,
      }),
    ],
    "5",
  );
  assert(resume.action.actionType === "PRACTICE", "5: PRACTICE");
  assert(
    resume.action.href === getActivityPath("present-simple", "quiz"),
    "5: Present Quiz",
  );
}

export function verifyMediumPresentMillionaireResume(): void {
  const resume = assertResumeMatchesRecommendation(
    [
      makeEvent({
        activity: "millionaire",
        lessonSlug: "present-simple",
        scorePercentage: 75,
      }),
    ],
    "6",
  );
  assert(resume.action.actionType === "PLAY", "6: PLAY");
  assert(
    resume.action.href === getActivityPath("present-simple", "millionaire"),
    "6: Present Millionaire",
  );
}

export function verifyActiveWeakFlashResume(): void {
  const resume = assertResumeMatchesRecommendation(
    [
      ...presentCompleteEvents(1),
      makeEvent({
        activity: "flash-cards",
        lessonSlug: "present-simple",
        completedAt: 3,
        flashEasy: 1,
        flashMedium: 2,
        flashHard: 3,
      }),
    ],
    "7",
  );
  assert(resume.action.lessonSlug === "past-simple", "7: Past Simple");
  assert(resume.action.actionType === "SUMMARY", "7: SUMMARY");
  assert(resume.action.href === getDashboardPath(), "7: /dashboard");
  assert(resume.action.label === "ดูผลการเรียน", "7: ดูผลการเรียน");
  assert(resume.title === "เรียน Present Simple ครบแล้ว", "7: complete title");
}

export function verifyPresentCompleteResumesPastLesson(): void {
  const resume = assertResumeMatchesRecommendation(presentCompleteEvents(), "8");
  assert(resume.action.lessonSlug === "past-simple", "8: Past Simple");
  assert(resume.action.actionType === "SUMMARY", "8: SUMMARY");
  assert(resume.action.href === getDashboardPath(), "8: /dashboard");
  assert(resume.action.label === "ดูผลการเรียน", "8: ดูผลการเรียน");
}

export function verifyPreexistingPastQuizProgressReused(): void {
  const resume = assertResumeMatchesRecommendation(
    [
      ...presentCompleteEvents(),
      makeEvent({
        activity: "quiz",
        lessonSlug: "past-simple",
        scorePercentage: 90,
        completedAt: 20,
      }),
    ],
    "9",
  );
  assert(resume.action.lessonSlug === "past-simple", "9: Past Simple");
  assert(resume.action.actionType === "SUMMARY", "9: SUMMARY");
  assert(resume.action.href === getDashboardPath(), "9: dashboard not Past Millionaire");
}

export function verifyOutOfOrderPastDoesNotHijack(): void {
  const resume = assertResumeMatchesRecommendation(
    [
      makeEvent({
        activity: "quiz",
        lessonSlug: "present-simple",
        scorePercentage: 50,
        completedAt: 1,
      }),
      makeEvent({
        activity: "quiz",
        lessonSlug: "past-simple",
        scorePercentage: 100,
        completedAt: 99,
      }),
    ],
    "10",
  );
  assert(resume.action.lessonSlug === "present-simple", "10: stays Present");
  assert(
    resume.action.href === getActivityPath("present-simple", "quiz"),
    "10: Present Quiz",
  );
}

export function verifyBothCompleteResumesDashboard(): void {
  const resume = assertResumeMatchesRecommendation(
    [...presentCompleteEvents(), ...pastCompleteEvents()],
    "11",
  );
  assert(resume.action.actionType === "SUMMARY", "11: SUMMARY");
  assert(resume.action.href === getDashboardPath(), "11: /dashboard");
  assert(resume.action.label === "ดูสรุปการเรียน", "11: dashboard CTA");
  assert(resume.title === "เรียนครบหลักสูตรแล้ว", "11: complete heading");
}

export function verifyUnknownLessonSafe(): void {
  const resume = assertResumeMatchesRecommendation(
    [
      makeEvent({
        activity: "quiz",
        lessonSlug: "not-a-real-lesson",
        scorePercentage: 100,
      }),
    ],
    "12",
  );
  assert(resume.action.lessonSlug === "present-simple", "12: Present Simple");
  assert(
    !resume.action.href.includes("not-a-real-lesson"),
    "12: no fake route",
  );
}

export function verifyCurriculumOrderPreserved(): void {
  const resume = assertResumeMatchesRecommendation(presentCompleteEvents(), "13");
  assert(resume.action.lessonSlug === "past-simple", "13: next is Past Simple");
}

export function verifyCrossLessonIsolation(): void {
  const resume = assertResumeMatchesRecommendation(
    [
      makeEvent({
        activity: "quiz",
        lessonSlug: "present-simple",
        scorePercentage: 50,
        completedAt: 1,
      }),
      makeEvent({
        activity: "quiz",
        lessonSlug: "past-simple",
        scorePercentage: 100,
        completedAt: 2,
      }),
    ],
    "14",
  );
  assert(resume.action.lessonSlug === "present-simple", "14: Present");
  assert(
    resume.action.href === getActivityPath("present-simple", "quiz"),
    "14: uses Present 50 not Past 100",
  );
}

export function verifyHistoryOrderIndependence(): void {
  const presentThenPast = [
    ...presentCompleteEvents(1),
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 50,
      completedAt: 3,
    }),
  ];
  const pastThenPresent = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "past-simple",
      scorePercentage: 50,
      completedAt: 1,
    }),
    ...presentCompleteEvents(10),
  ];
  const first = buildResumeLearning(emptySummary(), presentThenPast);
  const second = buildResumeLearning(emptySummary(), pastThenPresent);
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "15: order independent",
  );
}

export function verifySameInputSameOutput(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 75,
    }),
  ];
  const copy = events.map((event) => ({ ...event }));
  const first = buildResumeLearning(emptySummary(), events);
  const second = buildResumeLearning(emptySummary(), copy);
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "16: same input same output",
  );
}

export function verifyHistoryNotMutated(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ];
  const snapshot = JSON.stringify(events);
  Object.freeze(events);
  events.forEach((event) => Object.freeze(event));
  buildResumeLearning(emptySummary(), events);
  assert(JSON.stringify(events) === snapshot, "17: history not mutated");
}

export function verifySummaryNotMutated(): void {
  const summary = emptySummary();
  const snapshot = JSON.stringify(summary);
  Object.freeze(summary);
  buildResumeLearning(summary, []);
  assert(JSON.stringify(summary) === snapshot, "18: summary not mutated");
}

export function verifyKnownRoutes(): void {
  const cases: AggregatableLearningEvent[][] = [
    [],
    [
      makeEvent({
        activity: "quiz",
        lessonSlug: "present-simple",
        scorePercentage: 90,
      }),
    ],
    presentCompleteEvents(),
    [...presentCompleteEvents(), ...pastCompleteEvents()],
  ];

  for (const events of cases) {
    const resume = buildResumeLearning(emptySummary(), events);
    assert(
      isKnownResumeHref(resume.action.href, resume.action.lessonSlug),
      `19: known href ${resume.action.href}`,
    );
  }
}

export function verifyDoesNotIndependentlyScore(): void {
  const events = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ];
  const recommendation = buildLearningRecommendation(emptySummary(), events);
  const resume = buildResumeLearning(emptySummary(), events);
  assert(resume.action.href === recommendation.href, "20: no independent scoring");
  assert(
    resume.action.lessonSlug === recommendation.lessonSlug,
    "20: same lesson as recommendation",
  );
}

export function runResumeLearningVerification(): void {
  verifyEmptyHistoryResume();
  verifyWeakPresentQuizResume();
  verifyMediumPresentQuizResume();
  verifyStrongPresentQuizResume();
  verifyWeakPresentMillionaireResume();
  verifyMediumPresentMillionaireResume();
  verifyActiveWeakFlashResume();
  verifyPresentCompleteResumesPastLesson();
  verifyPreexistingPastQuizProgressReused();
  verifyOutOfOrderPastDoesNotHijack();
  verifyBothCompleteResumesDashboard();
  verifyUnknownLessonSafe();
  verifyCurriculumOrderPreserved();
  verifyCrossLessonIsolation();
  verifyHistoryOrderIndependence();
  verifySameInputSameOutput();
  verifyHistoryNotMutated();
  verifySummaryNotMutated();
  verifyKnownRoutes();
  verifyDoesNotIndependentlyScore();
}
