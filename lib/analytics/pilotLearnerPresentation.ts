import { CURRICULUM_LESSON_STATUS_LABELS } from "@/lib/analytics/curriculumProgress";
import { JOURNEY_STAGE_LABELS } from "@/lib/analytics/journey";
import { isLearnerLaunchableLesson } from "@/lib/analytics/learnerLessonLaunch";
import { getDashboardPath } from "@/lib/routes";
import type {
  CurriculumLessonProgress,
  CurriculumProgress,
  LearningJourney,
  StudentLearningHomeActiveLesson,
} from "@/types/analytics";

export const PILOT_UNAVAILABLE_STATUS_LABEL = "บทเรียนถัดไป";
export const PILOT_UNAVAILABLE_AVAILABILITY_LABEL = "ยังไม่เปิดให้เรียน";

export function toPilotProgressPercent(
  lessonSlug: string,
  progressPercent: number,
): number {
  return isLearnerLaunchableLesson(lessonSlug) ? progressPercent : 0;
}

export function shouldHideSamePageDashboardAction(
  suppressSamePageAction: boolean,
  href: string,
): boolean {
  return suppressSamePageAction && href === getDashboardPath();
}

export type PresentedCurriculumLesson = {
  lessonSlug: string;
  lessonTitle: string;
  displayStatusLabel: string;
  displayAvailabilityLabel?: string;
  displayStageLabel?: string;
  displayPercent: number;
  highlightAsActive: boolean;
  itemClassName: string;
};

export function presentCurriculumLesson(
  lesson: CurriculumLessonProgress,
): PresentedCurriculumLesson {
  if (!isLearnerLaunchableLesson(lesson.lessonSlug)) {
    return {
      lessonSlug: lesson.lessonSlug,
      lessonTitle: lesson.lessonTitle,
      displayStatusLabel: PILOT_UNAVAILABLE_STATUS_LABEL,
      displayAvailabilityLabel: PILOT_UNAVAILABLE_AVAILABILITY_LABEL,
      displayPercent: 0,
      highlightAsActive: false,
      itemClassName: "curriculumProgressItem locked",
    };
  }

  return {
    lessonSlug: lesson.lessonSlug,
    lessonTitle: lesson.lessonTitle,
    displayStatusLabel: CURRICULUM_LESSON_STATUS_LABELS[lesson.status],
    displayStageLabel: JOURNEY_STAGE_LABELS[lesson.stage],
    displayPercent: lesson.progressPercent,
    highlightAsActive: lesson.status === "ACTIVE",
    itemClassName: `curriculumProgressItem ${lesson.status.toLowerCase()}`,
  };
}

export function presentCurriculumProgress(progress: CurriculumProgress): {
  lessons: PresentedCurriculumLesson[];
  displayOverallPercent: number;
  showActiveAsCurrent: boolean;
} {
  const lessons = progress.lessons.map(presentCurriculumLesson);
  const displayOverallPercent = Math.round(
    lessons.reduce((sum, lesson) => sum + lesson.displayPercent, 0) /
      Math.max(lessons.length, 1),
  );
  const showActiveAsCurrent = Boolean(
    progress.activeLessonSlug &&
      isLearnerLaunchableLesson(progress.activeLessonSlug),
  );

  return {
    lessons,
    displayOverallPercent,
    showActiveAsCurrent,
  };
}

export function presentJourneyProgressPercent(journey: LearningJourney): number {
  return toPilotProgressPercent(journey.lessonSlug, journey.progressPercent);
}

export function isPilotUnavailableLesson(lessonSlug: string): boolean {
  return !isLearnerLaunchableLesson(lessonSlug);
}

export function presentHomeOverallProgressPercent(params: {
  activeLessonSlug?: string;
  completedLessons: number;
  totalLessons: number;
  engineOverallPercent: number;
}): number {
  if (
    params.activeLessonSlug &&
    !isLearnerLaunchableLesson(params.activeLessonSlug)
  ) {
    if (params.totalLessons === 0) {
      return 0;
    }

    return Math.round(
      (params.completedLessons / params.totalLessons) * 100,
    );
  }

  return params.engineOverallPercent;
}

export function presentActiveLessonCopy(
  activeLesson: StudentLearningHomeActiveLesson,
): {
  heading: string;
  availabilityLabel: string;
} {
  if (!isLearnerLaunchableLesson(activeLesson.lessonSlug)) {
    return {
      heading: PILOT_UNAVAILABLE_STATUS_LABEL,
      availabilityLabel: PILOT_UNAVAILABLE_AVAILABILITY_LABEL,
    };
  }

  return {
    heading: "บทเรียนปัจจุบัน",
    availabilityLabel: `ขั้น${activeLesson.stageLabel}`,
  };
}
