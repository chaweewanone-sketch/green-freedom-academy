import { MILLIONAIRE_ACTIVITY_DISPLAY_NAME } from "@/lib/activities";
import { buildCurriculumProgress } from "@/lib/analytics/curriculumProgress";
import { isLessonComplete, resolveActiveLesson } from "@/lib/analytics/activeLesson";
import { buildLearningJourney } from "@/lib/analytics/journey";
import {
  JOURNEY_PROGRESS,
  JOURNEY_THRESHOLDS,
  evaluateLessonJourney,
} from "@/lib/analytics/lessonProgress";
import { LEARNER_LAUNCHABLE_LESSON_SLUGS } from "@/lib/analytics/learnerLessonLaunch";
import {
  PILOT_COMPLETE_TITLE,
  PILOT_UNAVAILABLE_AVAILABILITY_LABEL,
  PILOT_UNAVAILABLE_STATUS_LABEL,
  isPilotPresentCompleteResume,
  presentCurriculumLesson,
} from "@/lib/analytics/pilotLearnerPresentation";
import {
  RECOMMENDATION_THRESHOLDS,
  buildLearningRecommendation,
} from "@/lib/analytics/recommendation";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildLearningSummary } from "@/lib/analytics/summary";
import { ACTIVITY_DEFAULTS } from "@/lib/assessment";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import { GAME_STAGE_COUNT } from "@/lib/millionaire/stageLadder";
import { getQuestionBank } from "@/lib/question-bank";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
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

function weakFlashEvent(
  completedAt: number,
  sessionId: string,
): AggregatableLearningEvent {
  return makeEvent({
    sessionId,
    activity: "flash-cards",
    lessonSlug: "present-simple",
    completedAt,
    flashEasy: 1,
    flashMedium: 2,
    flashHard: 3,
  });
}

function strongFlashEvent(completedAt: number): AggregatableLearningEvent {
  return makeEvent({
    sessionId: "flash-strong",
    activity: "flash-cards",
    lessonSlug: "present-simple",
    completedAt,
    flashEasy: 8,
    flashMedium: 1,
    flashHard: 0,
  });
}

export function runFlashOptionalityVerification(): void {
  const completeOnly = presentCompleteEvents();
  const completeWeak = [...presentCompleteEvents(1), weakFlashEvent(3, "flash-1")];
  const completeMultipleWeak = [
    ...presentCompleteEvents(1),
    weakFlashEvent(3, "flash-1"),
    weakFlashEvent(4, "flash-2"),
  ];
  const completeStrong = [...presentCompleteEvents(1), strongFlashEvent(3)];
  const bank = getQuestionBank("present-simple");

  const noFlashJourney = evaluateLessonJourney(
    buildLearningSummary(completeOnly),
    "present-simple",
    completeOnly,
  );
  assert(noFlashJourney.stage === "COMPLETE", "A: complete without Flash");
  assert(isLessonComplete(completeOnly, "present-simple"), "T: Flash not required");

  const weakJourney = evaluateLessonJourney(
    buildLearningSummary(completeWeak),
    "present-simple",
    completeWeak,
  );
  assert(weakJourney.stage === "COMPLETE", "B: complete + weak Flash");
  assert(
    weakJourney.progressPercent === JOURNEY_PROGRESS.complete,
    "B: Present progress 100",
  );
  assert(
    weakJourney.reasonCode !== "FLASH_WEAK_OVERRIDE",
    "I: FLASH_WEAK_OVERRIDE does not win",
  );

  const multipleJourney = evaluateLessonJourney(
    buildLearningSummary(completeMultipleWeak),
    "present-simple",
    completeMultipleWeak,
  );
  assert(multipleJourney.stage === "COMPLETE", "C: complete + multiple weak Flash");

  const strongJourney = evaluateLessonJourney(
    buildLearningSummary(completeStrong),
    "present-simple",
    completeStrong,
  );
  assert(strongJourney.stage === "COMPLETE", "D: complete + strong Flash");

  const progress = buildCurriculumProgress(completeWeak);
  const presentRow = progress.lessons.find(
    (lesson) => lesson.lessonSlug === "present-simple",
  );
  assert(presentRow?.status === "COMPLETE", "E: Present remains COMPLETE");
  assert(presentRow?.progressPercent === 100, "E: Present 100%");
  assert(isLessonComplete(completeWeak, "present-simple"), "F: isLessonComplete");
  assert(
    resolveActiveLesson(completeWeak).lessonSlug === "past-simple",
    "F: active lesson still advances",
  );

  const resume = buildResumeLearning(emptySummary(), completeWeak);
  assert(resume.action.actionType === "SUMMARY", "G: SUMMARY");
  assert(resume.action.href === getDashboardPath(), "G: /dashboard");
  assert(resume.action.label === "ดูผลการเรียน", "G: ดูผลการเรียน");
  assert(isPilotPresentCompleteResume(resume), "H: 56C card eligible");
  assert(resume.title === "เรียน Present Simple ครบแล้ว", "H: complete title");
  assert(PILOT_COMPLETE_TITLE.includes("เรียน Present Simple ครบแล้ว"), "H: copy");

  const recommendation = buildLearningRecommendation(emptySummary(), completeWeak);
  assert(recommendation.reasonCode !== "FLASH_WEAK", "I: FLASH_WEAK does not override");
  assert(
    recommendation.href !== getActivityPath("present-simple", "flash-cards"),
    "I: CTA is not Flash Cards",
  );

  const flashOnly = buildLearningRecommendation({
    ...emptySummary(),
    totalActivities: 1,
    flashCardAttempts: 1,
    flashEasy: 1,
    flashMedium: 2,
    flashHard: 3,
    latestActivity: "flash-cards",
    latestLesson: "present-simple",
  });
  assert(flashOnly.reasonCode === "FLASH_WEAK", "FLASH_WEAK signal preserved before complete");

  const summary = buildLearningSummary(completeMultipleWeak);
  assert(summary.flashCardAttempts === 2, "K: flashCardAttempts increases");
  assert(summary.flashEasy === 2, "L: flashEasy aggregates");
  assert(summary.flashMedium === 4, "L: flashMedium aggregates");
  assert(summary.flashHard === 6, "L: flashHard aggregates");
  assert(summary.latestActivity === "flash-cards", "M: latestActivity may be flash-cards");
  assert(summary.totalActivities === 4, "N: Flash included in totalActivities");
  assert(summary.averageQuizScore === 90, "O: Quiz score unaffected");
  assert(summary.averageMillionaireScore === 90, "P: Millionaire score unaffected");

  const withoutFlash = buildLearningSummary(completeOnly);
  assert(withoutFlash.flashCardAttempts === 0, "J: no Flash still records zero");
  assert(withoutFlash.totalActivities === 2, "T: complete without Flash events");

  assert(JOURNEY_THRESHOLDS.quizReview === 70, "Q: quiz 70");
  assert(JOURNEY_THRESHOLDS.quizStrong === 85, "Q: quiz 85");
  assert(JOURNEY_THRESHOLDS.millionaireReview === 70, "Q: millionaire 70");
  assert(JOURNEY_THRESHOLDS.millionaireStrong === 85, "Q: millionaire 85");
  assert(RECOMMENDATION_THRESHOLDS.developingMin === 70, "Q: rec 70");
  assert(RECOMMENDATION_THRESHOLDS.strongMin === 85, "Q: rec 85");

  assert(
    LEARNER_LAUNCHABLE_LESSON_SLUGS.join(",") === "present-simple",
    "R: 54D guard",
  );
  const past = progress.lessons.find((lesson) => lesson.lessonSlug === "past-simple");
  const presentedPast = past ? presentCurriculumLesson(past) : undefined;
  assert(presentedPast?.displayStatusLabel === PILOT_UNAVAILABLE_STATUS_LABEL, "S: บทเรียนถัดไป");
  assert(
    presentedPast?.displayAvailabilityLabel === PILOT_UNAVAILABLE_AVAILABILITY_LABEL,
    "S: ยังไม่เปิดให้เรียน",
  );
  assert(presentedPast?.displayPercent === 0, "S: Past 0%");

  const curriculumJourney = buildLearningJourney(emptySummary(), completeWeak);
  assert(
    curriculumJourney.nextAction.href !== getLessonPath("past-simple"),
    "R: no Past Simple CTA",
  );
  assert(
    curriculumJourney.nextAction.href !==
      getActivityPath("present-simple", "flash-cards"),
    "I: journey CTA is not Flash Cards",
  );

  assert(presentSimpleLesson.contentVersion === 2, "freeze: contentVersion 2");
  assert(bank?.questions.length === 50, "freeze: quiz bank 50");
  assert(ACTIVITY_DEFAULTS.quiz.questionCount === 10, "freeze: quiz attempt 10");
  assert(ACTIVITY_DEFAULTS.millionaire.questionCount === 10, "freeze: millionaire 10");
  assert(GAME_STAGE_COUNT === 10, "freeze: millionaire stages 10");
  assert(
    MILLIONAIRE_ACTIVITY_DISPLAY_NAME === "Millionaire Challenge",
    "freeze: 57A name",
  );
}
