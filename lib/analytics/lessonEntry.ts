import {
  CURRICULUM_LESSON_STATUS_LABELS,
  buildCurriculumProgress,
} from "@/lib/analytics/curriculumProgress";
import {
  JOURNEY_STAGE_LABELS,
  evaluateLessonJourney,
  isLearningEvent,
} from "@/lib/analytics/lessonProgress";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildLearningSummaryForLesson } from "@/lib/analytics/summary";
import {
  getFirstCurriculumLesson,
  getLessonBySlug,
  hasLesson,
} from "@/lib/lessons";
import { getLessonPath } from "@/lib/routes";
import type {
  AggregatableLearningEvent,
  LearningSummary,
  LessonEntryAction,
  LessonEntryNoticeKind,
  LessonEntryState,
  ResumeLearningActionType,
} from "@/types/analytics";

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

function fallbackSlug(): string {
  return getFirstCurriculumLesson()?.slug ?? "present-simple";
}

function titleFor(slug: string): string {
  return getLessonBySlug(slug)?.title ?? slug;
}

function asResumeActionType(actionType: string): ResumeLearningActionType {
  if (
    actionType === "LEARN" ||
    actionType === "PRACTICE" ||
    actionType === "PLAY" ||
    actionType === "REVIEW" ||
    actionType === "NEXT_LESSON" ||
    actionType === "SUMMARY"
  ) {
    return actionType;
  }

  return "LEARN";
}

function returnToActiveAction(
  activeLessonSlug: string,
  activeLessonTitle: string,
): LessonEntryAction {
  return {
    label: `กลับไป ${activeLessonTitle}`,
    href: getLessonPath(activeLessonSlug),
    actionType: "LEARN",
  };
}

/**
 * Progress-aware composition for a lesson page.
 * Reuses curriculum status, per-lesson journey evaluation, and Resume.
 * Does not score, lock routes, or persist anything.
 */
export function buildLessonEntry(
  lessonSlug: string,
  events: AggregatableLearningEvent[] = [],
): LessonEntryState {
  const history = events.filter(isLearningEvent);
  const isKnown = hasLesson(lessonSlug);
  const lessonTitle = isKnown ? titleFor(lessonSlug) : lessonSlug;
  const curriculum = buildCurriculumProgress(history);
  const viewedRow = isKnown
    ? curriculum.lessons.find((lesson) => lesson.lessonSlug === lessonSlug)
    : undefined;
  const lessonSummary = isKnown
    ? buildLearningSummaryForLesson(history, lessonSlug)
    : emptySummary();
  const viewedJourney = evaluateLessonJourney(
    lessonSummary,
    isKnown ? lessonSlug : fallbackSlug(),
    history,
  );
  const isComplete = Boolean(viewedRow && viewedRow.status === "COMPLETE");
  const isActiveLesson = Boolean(
    viewedRow &&
      viewedRow.status === "ACTIVE" &&
      !curriculum.isCurriculumComplete,
  );
  const isLockedInCurriculum = Boolean(
    viewedRow && viewedRow.status === "LOCKED",
  );
  const hasLessonHistory = isKnown && lessonSummary.totalActivities > 0;
  const activeLessonSlug = curriculum.activeLessonSlug;
  const activeLessonTitle = activeLessonSlug
    ? titleFor(activeLessonSlug)
    : undefined;

  let noticeKind: LessonEntryNoticeKind = "active";
  let notice = "กำลังเรียนบทนี้";
  let nextAction: LessonEntryAction = {
    label: viewedJourney.nextAction.label,
    href: viewedJourney.nextAction.href,
    actionType: asResumeActionType(viewedJourney.nextAction.actionType),
  };

  if (!isKnown) {
    noticeKind = "out-of-order";
    notice = "บทนี้ยังไม่ใช่บทเรียนปัจจุบันของคุณ";
    nextAction = returnToActiveAction(
      activeLessonSlug ?? fallbackSlug(),
      activeLessonTitle ?? titleFor(fallbackSlug()),
    );
  } else if (isComplete) {
    noticeKind = "complete";
    notice = "เรียนจบบทนี้แล้ว";
    const resume = buildResumeLearning(emptySummary(), history);
    nextAction = {
      label: resume.action.label,
      href: resume.action.href,
      actionType: resume.action.actionType,
    };
  } else if (isLockedInCurriculum && activeLessonSlug && activeLessonTitle) {
    noticeKind = "out-of-order";
    notice = "บทนี้ยังไม่ใช่บทเรียนปัจจุบันของคุณ";
    nextAction = returnToActiveAction(activeLessonSlug, activeLessonTitle);
  } else if (isActiveLesson) {
    noticeKind = "active";
    notice = "กำลังเรียนบทนี้";
    nextAction = {
      label: viewedJourney.nextAction.label,
      href: viewedJourney.nextAction.href,
      actionType: asResumeActionType(viewedJourney.nextAction.actionType),
    };
  }

  const showStoredProgress =
    isKnown && (isActiveLesson || isComplete || hasLessonHistory);

  return {
    lessonSlug,
    lessonTitle,
    isActiveLesson,
    isComplete,
    isLockedInCurriculum: isLockedInCurriculum || !isKnown,
    isCurriculumComplete: curriculum.isCurriculumComplete,
    hasLessonHistory,
    stage: isKnown ? viewedJourney.stage : "LEARN",
    stageLabel: JOURNEY_STAGE_LABELS[isKnown ? viewedJourney.stage : "LEARN"],
    progressPercent: showStoredProgress ? viewedJourney.progressPercent : 0,
    statusLabel: viewedRow
      ? CURRICULUM_LESSON_STATUS_LABELS[viewedRow.status]
      : CURRICULUM_LESSON_STATUS_LABELS.LOCKED,
    activeLessonSlug,
    activeLessonTitle,
    nextAction,
    noticeKind,
    notice,
  };
}
