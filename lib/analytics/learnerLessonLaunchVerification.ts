import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  LEARNER_LAUNCHABLE_LESSON_SLUGS,
  LEARNER_SAFE_COMPLETION_CTA_LABEL,
  isLearnerLaunchableHref,
  isLearnerLaunchableLesson,
  learnerSafeNavigation,
} from "@/lib/analytics/learnerLessonLaunch";
import { buildLearningJourney } from "@/lib/analytics/journey";
import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildStudentLearningHome } from "@/lib/analytics/studentHome";
import { resolveActiveLesson } from "@/lib/analytics/activeLesson";
import { resolveForwardResultNextAction } from "@/lib/analytics/resultNextAction";
import { getNextCurriculumLesson, hasLesson } from "@/lib/lessons";
import {
  getActivityPath,
  getDashboardPath,
  getLessonPath,
  getStudentPath,
} from "@/lib/routes";
import type { AggregatableLearningEvent, LearningSummary } from "@/types/analytics";

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
    lessonContentVersion: overrides.lessonContentVersion,
  };
}

function presentCompleteEvents(): AggregatableLearningEvent[] {
  return [
    makeEvent({
      activity: "learn",
      lessonSlug: "present-simple",
      lessonContentVersion: 2,
      completedAt: 1,
    }),
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 2,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 3,
    }),
  ];
}

export function verifyLaunchPolicyKnowsPresentAndGuardsPast(): void {
  assert(isLearnerLaunchableLesson("present-simple"), "present launchable");
  assert(!isLearnerLaunchableLesson("past-simple"), "past not launchable");
  assert(
    LEARNER_LAUNCHABLE_LESSON_SLUGS.length === 1,
    "narrow present-simple-only set",
  );
  assert(
    isLearnerLaunchableHref(getLessonPath("present-simple")),
    "present lesson href launchable",
  );
  assert(
    !isLearnerLaunchableHref(getLessonPath("past-simple")),
    "past lesson href guarded",
  );
  assert(
    !isLearnerLaunchableHref(getActivityPath("past-simple", "quiz")),
    "past quiz href guarded",
  );
  const safe = learnerSafeNavigation(
    getLessonPath("past-simple"),
    "เรียนบทถัดไป",
  );
  assert(safe.rewritten, "past href rewritten");
  assert(safe.href === getDashboardPath(), "rewrites to dashboard");
  assert(safe.label === LEARNER_SAFE_COMPLETION_CTA_LABEL, "ดูผลการเรียน");
}

export function verifyGenericNextLessonStillPastSimple(): void {
  const next = getNextCurriculumLesson("present-simple");
  assert(next?.slug === "past-simple", "engine next is Past Simple");
  assert(hasLesson("past-simple"), "Past Simple still registered");
  assert(
    getLessonPath("past-simple") === "/lesson/past-simple",
    "direct Past Simple route intact",
  );
}

export function verifyPilotStates(): void {
  const homeA = buildStudentLearningHome(emptySummary(), []);
  assert(
    homeA.resumeLearning.action.href === getLessonPath("present-simple"),
    "A: Present Learn",
  );

  const learnOnly = [
    makeEvent({
      activity: "learn",
      lessonSlug: "present-simple",
      lessonContentVersion: 2,
    }),
  ];
  const homeB = buildStudentLearningHome(emptySummary(), learnOnly);
  assert(
    homeB.resumeLearning.action.href ===
      getActivityPath("present-simple", "quiz"),
    "B: Quiz",
  );

  const homeC = buildStudentLearningHome(emptySummary(), [
    ...learnOnly,
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 80,
      completedAt: 2,
    }),
  ]);
  assert(
    homeC.resumeLearning.action.href ===
      getActivityPath("present-simple", "quiz"),
    "C: Quiz stays",
  );

  const homeD = buildStudentLearningHome(emptySummary(), [
    ...learnOnly,
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 2,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 80,
      completedAt: 3,
    }),
  ]);
  assert(
    homeD.resumeLearning.action.href ===
      getActivityPath("present-simple", "millionaire"),
    "D: Millionaire replay",
  );

  const complete = presentCompleteEvents();
  const homeE = buildStudentLearningHome(emptySummary(), complete);
  const journeyE = buildLearningJourney(emptySummary(), complete);
  const recommendationE = buildLearningRecommendation(emptySummary(), complete);
  const resumeE = buildResumeLearning(emptySummary(), complete);
  const activeE = resolveActiveLesson(complete);

  assert(activeE.lessonSlug === "past-simple", "E: resolver still Past Simple");
  assert(
    recommendationE.href === getLessonPath("past-simple"),
    "E: recommendation engine still Past Simple",
  );
  assert(
    homeE.resumeLearning.action.href !== getLessonPath("past-simple"),
    "E: home resume not Past Simple",
  );
  assert(
    homeE.resumeLearning.action.href === getDashboardPath(),
    "E: home resume dashboard",
  );
  assert(
    homeE.resumeLearning.action.label === LEARNER_SAFE_COMPLETION_CTA_LABEL,
    "E: ดูผลการเรียน",
  );
  assert(journeyE.lessonSlug === "past-simple", "E: journey slug still Past");
  assert(
    journeyE.nextAction.href === getDashboardPath(),
    "E: journey CTA dashboard",
  );
  assert(resumeE.action.href === getDashboardPath(), "E: resume dashboard");
  assert(
    learnerSafeNavigation(recommendationE.href, recommendationE.ctaLabel)
      .href === getDashboardPath(),
    "E: recommendation card would rewrite",
  );

  const homeF = buildStudentLearningHome(emptySummary(), [
    ...complete,
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 60,
      completedAt: 4,
    }),
  ]);
  assert(
    homeF.resumeLearning.action.href ===
      getActivityPath("present-simple", "millionaire"),
    "F: poor replay returns to Present Millionaire",
  );
}

export function verifyResultBandsUnchanged(): void {
  const empty = emptySummary();
  const quiz69 = resolveForwardResultNextAction({
    currentActivity: "quiz",
    currentLessonSlug: "present-simple",
    summary: empty,
    currentResult: { activity: "quiz", percentage: 69 },
  });
  const quiz80 = resolveForwardResultNextAction({
    currentActivity: "quiz",
    currentLessonSlug: "present-simple",
    summary: empty,
    currentResult: { activity: "quiz", percentage: 80 },
  });
  const quiz85 = resolveForwardResultNextAction({
    currentActivity: "quiz",
    currentLessonSlug: "present-simple",
    summary: empty,
    currentResult: { activity: "quiz", percentage: 85 },
  });
  const mil69 = resolveForwardResultNextAction({
    currentActivity: "millionaire",
    currentLessonSlug: "present-simple",
    summary: empty,
    currentResult: { activity: "millionaire", percentage: 69 },
  });
  const mil80 = resolveForwardResultNextAction({
    currentActivity: "millionaire",
    currentLessonSlug: "present-simple",
    summary: empty,
    currentResult: { activity: "millionaire", percentage: 80 },
  });
  const mil85 = resolveForwardResultNextAction({
    currentActivity: "millionaire",
    currentLessonSlug: "present-simple",
    summary: empty,
    currentResult: { activity: "millionaire", percentage: 85 },
  });

  assert(quiz69?.href === getActivityPath("present-simple", "quiz"), "quiz <70");
  assert(quiz80?.href === getActivityPath("present-simple", "quiz"), "quiz 70-84");
  assert(
    quiz85?.href === getActivityPath("present-simple", "millionaire"),
    "quiz >=85",
  );
  assert(mil69?.href === getActivityPath("present-simple", "quiz"), "mil <70");
  assert(
    mil80?.href === getActivityPath("present-simple", "millionaire"),
    "mil 70-84",
  );
  assert(mil85?.href === getStudentPath(), "mil >=85 /student");
  assert(mil85?.label === "กลับหน้าหลัก", "mil >=85 copy");
}

export function verifyUiCardsApplyLaunchPolicy(): void {
  const recommendationCard = readFileSync(
    resolve(process.cwd(), "components/dashboard/RecommendationCard.tsx"),
    "utf8",
  );
  const journeyCard = readFileSync(
    resolve(process.cwd(), "components/dashboard/JourneyCard.tsx"),
    "utf8",
  );
  const resumeCard = readFileSync(
    resolve(process.cwd(), "components/dashboard/ResumeLearningCard.tsx"),
    "utf8",
  );
  assert(
    recommendationCard.includes("learnerSafeNavigation"),
    "RecommendationCard uses launch policy",
  );
  assert(
    journeyCard.includes("learnerSafeNavigation"),
    "JourneyCard uses launch policy",
  );
  assert(
    resumeCard.includes("action.href"),
    "ResumeLearningCard still renders resume href",
  );
}

export function runLearnerLessonLaunchVerification(): void {
  verifyLaunchPolicyKnowsPresentAndGuardsPast();
  verifyGenericNextLessonStillPastSimple();
  verifyPilotStates();
  verifyResultBandsUnchanged();
  verifyUiCardsApplyLaunchPolicy();
}
