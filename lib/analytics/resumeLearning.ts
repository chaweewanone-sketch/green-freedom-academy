import { resolveActiveLesson } from "@/lib/analytics/activeLesson";
import {
  LEARNER_SAFE_COMPLETION_CTA_LABEL,
  isLearnerLaunchableHref,
} from "@/lib/analytics/learnerLessonLaunch";
import { JOURNEY_ACTION_LABELS, isLearningEvent } from "@/lib/analytics/lessonProgress";
import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import { getLessonBySlug, hasLesson } from "@/lib/lessons";
import { getActivityPath, getDashboardPath, getLessonPath } from "@/lib/routes";
import type {
  AggregatableLearningEvent,
  LearningRecommendation,
  ResumeLearning,
  ResumeLearningActionType,
} from "@/types/analytics";

function lessonTitle(lessonSlug: string): string {
  return getLessonBySlug(lessonSlug)?.title ?? lessonSlug;
}

function resumeActionType(
  recommendation: LearningRecommendation,
): ResumeLearningActionType {
  if (recommendation.href === getDashboardPath()) {
    return "SUMMARY";
  }

  if (recommendation.ctaLabel === JOURNEY_ACTION_LABELS.nextLesson) {
    return "NEXT_LESSON";
  }

  const slug = recommendation.lessonSlug;

  if (recommendation.href === getActivityPath(slug, "millionaire")) {
    return "PLAY";
  }

  if (recommendation.href === getActivityPath(slug, "flash-cards")) {
    return "REVIEW";
  }

  if (recommendation.href === getActivityPath(slug, "quiz")) {
    return "PRACTICE";
  }

  return "LEARN";
}

function resumeCopy(
  recommendation: LearningRecommendation,
  actionType: ResumeLearningActionType,
  title: string,
): Pick<ResumeLearning, "title" | "description"> {
  if (actionType === "SUMMARY") {
    return {
      title: "เรียนครบหลักสูตรแล้ว",
      description: "คุณเรียนครบทุกบทในหลักสูตรปัจจุบันแล้ว",
    };
  }

  if (actionType === "NEXT_LESSON") {
    return {
      title: "เรียนต่อ",
      description: `พร้อมเริ่มบท ${title}`,
    };
  }

  if (
    recommendation.kind === "START" &&
    recommendation.reasonCode === "EMPTY_HISTORY"
  ) {
    return {
      title: "เริ่มการเรียนรู้",
      description: "เริ่มต้นบทเรียนแรกของคุณ",
    };
  }

  return {
    title: "เรียนต่อจากครั้งล่าสุด",
    description: `ขั้นต่อไป: ${recommendation.title}`,
  };
}

function resumeCtaLabel(
  recommendation: LearningRecommendation,
  actionType: ResumeLearningActionType,
): string {
  if (actionType === "SUMMARY") {
    return JOURNEY_ACTION_LABELS.complete;
  }

  if (actionType === "NEXT_LESSON") {
    return JOURNEY_ACTION_LABELS.nextLesson;
  }

  if (actionType === "LEARN" && recommendation.kind === "START") {
    return JOURNEY_ACTION_LABELS.learn;
  }

  if (recommendation.ctaLabel === JOURNEY_ACTION_LABELS.practiceQuiz) {
    return JOURNEY_ACTION_LABELS.practiceQuiz;
  }

  if (recommendation.ctaLabel === JOURNEY_ACTION_LABELS.playMillionaire) {
    return JOURNEY_ACTION_LABELS.playMillionaire;
  }

  return "เรียนต่อ";
}

/**
 * Action-oriented projection of curriculum-aware Recommendation.
 * Does not score activities or decide curriculum progression.
 */
export function buildResumeLearning(
  summary: unknown,
  events?: AggregatableLearningEvent[],
): ResumeLearning {
  const recommendation = buildLearningRecommendation(summary, events);
  const actionType = resumeActionType(recommendation);

  const resolved = Array.isArray(events)
    ? resolveActiveLesson(events.filter(isLearningEvent))
    : undefined;

  const lessonSlug =
    resolved && !resolved.isCurriculumComplete
      ? resolved.lessonSlug
      : recommendation.lessonSlug;

  const title = lessonTitle(lessonSlug);

  if (!isLearnerLaunchableHref(recommendation.href)) {
    return {
      title: "เรียน Present Simple ครบแล้ว",
      description: "ดูผลการเรียนได้จากแดชบอร์ด",
      action: {
        lessonSlug,
        lessonTitle: title,
        label: LEARNER_SAFE_COMPLETION_CTA_LABEL,
        href: getDashboardPath(),
        actionType: "SUMMARY",
      },
    };
  }

  const copy = resumeCopy(recommendation, actionType, title);

  return {
    title: copy.title,
    description: copy.description,
    action: {
      lessonSlug,
      lessonTitle: title,
      label: resumeCtaLabel(recommendation, actionType),
      href: recommendation.href,
      actionType,
    },
  };
}

export function isKnownResumeHref(href: string, lessonSlug: string): boolean {
  if (href === getDashboardPath()) {
    return true;
  }

  if (!hasLesson(lessonSlug)) {
    return false;
  }

  return (
    href === getLessonPath(lessonSlug) ||
    href === getActivityPath(lessonSlug, "quiz") ||
    href === getActivityPath(lessonSlug, "millionaire") ||
    href === getActivityPath(lessonSlug, "flash-cards")
  );
}
