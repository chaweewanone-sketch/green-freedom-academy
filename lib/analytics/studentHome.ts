import {
  JOURNEY_STAGE_LABELS,
  buildLearningJourney,
} from "@/lib/analytics/journey";
import { buildCurriculumProgress } from "@/lib/analytics/curriculumProgress";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { getLessonBySlug } from "@/lib/lessons";
import { getDashboardPath } from "@/lib/routes";
import type {
  AggregatableLearningEvent,
  LearningSummary,
  StudentLearningHomeModel,
} from "@/types/analytics";

function lessonTitle(lessonSlug: string): string {
  return getLessonBySlug(lessonSlug)?.title ?? lessonSlug;
}

/**
 * Action-oriented composition for Student Learning Home.
 * Reuses Resume, Journey, and Curriculum Progress. Does not score,
 * resolve active lesson independently, or persist anything.
 */
export function buildStudentLearningHome(
  summary: LearningSummary,
  events?: AggregatableLearningEvent[],
): StudentLearningHomeModel {
  const history = events ?? [];
  const resumeLearning = buildResumeLearning(summary, events);
  const journey = buildLearningJourney(summary, events);
  const curriculum = buildCurriculumProgress(history);

  const activeLesson = curriculum.isCurriculumComplete
    ? null
    : {
        lessonSlug: journey.lessonSlug,
        lessonTitle: lessonTitle(journey.lessonSlug),
        stage: journey.stage,
        stageLabel: JOURNEY_STAGE_LABELS[journey.stage],
      };

  const latestActivity =
    summary.latestActivity && summary.latestLesson
      ? {
          activity: summary.latestActivity,
          lessonSlug: summary.latestLesson,
        }
      : undefined;

  return {
    resumeLearning,
    activeLesson,
    curriculumProgress: {
      completedLessons: curriculum.completedLessons,
      totalLessons: curriculum.totalLessons,
      overallProgressPercent: curriculum.overallProgressPercent,
      isCurriculumComplete: curriculum.isCurriculumComplete,
    },
    latestActivity,
    dashboardHref: getDashboardPath(),
    hasHistory: summary.totalActivities > 0,
  };
}
