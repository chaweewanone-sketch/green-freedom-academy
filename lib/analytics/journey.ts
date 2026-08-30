import { resolveActiveLesson } from "@/lib/analytics/activeLesson";
import {
  JOURNEY_ACTION_LABELS,
  evaluateLessonJourney,
  isLearningEvent,
  journey,
  learnFallbackJourney,
  parseLearningSummary,
  resolveKnownLessonSlug,
} from "@/lib/analytics/lessonProgress";
import { buildLearningSummaryForLesson } from "@/lib/analytics/summary";
import {
  getLessonBySlug,
  getNextCurriculumLesson,
  hasLesson,
} from "@/lib/lessons";
import { getLessonPath } from "@/lib/routes";
import type {
  AggregatableLearningEvent,
  LearningJourney,
} from "@/types/analytics";

/**
 * Journey answers "ตอนนี้อยู่ขั้นไหน" for the ACTIVE curriculum lesson.
 * Recommendation (buildLearningRecommendation) answers "ควรทำอะไรต่อ"
 * for the same active curriculum lesson. These engines stay separate.
 *
 * When events are provided:
 *   History by lesson → lesson completion evaluator → curriculum order
 *   → active lesson resolver → per-lesson stage rules → nextAction
 *
 * latestActivity / latestLesson on LearningSummary remain what the learner
 * did most recently. They do not select the active curriculum lesson.
 */
export {
  DEFAULT_JOURNEY_LESSON_SLUG,
  JOURNEY_ACTION_LABELS,
  JOURNEY_PROGRESS,
  JOURNEY_STAGE_LABELS,
  JOURNEY_THRESHOLDS,
  JOURNEY_TRACK,
} from "./lessonProgress";

function lessonTitle(lessonSlug: string): string {
  return getLessonBySlug(lessonSlug)?.title ?? "Present Simple";
}

function withCurriculumNavigation(pathJourney: LearningJourney): LearningJourney {
  if (pathJourney.stage !== "COMPLETE") {
    return pathJourney;
  }

  const nextLesson = getNextCurriculumLesson(pathJourney.lessonSlug);
  if (!nextLesson) {
    return journey({
      ...pathJourney,
      isCurriculumComplete: true,
    });
  }

  return journey({
    ...pathJourney,
    title: `เรียน ${lessonTitle(pathJourney.lessonSlug)} สำเร็จ`,
    message: "ผ่านขั้นเล่นแล้ว สามารถไปบทเรียนถัดไปได้",
    nextAction: {
      actionType: "LEARN",
      label: JOURNEY_ACTION_LABELS.nextLesson,
      href: getLessonPath(nextLesson.slug),
    },
    nextLessonSlug: nextLesson.slug,
    isCurriculumComplete: false,
  });
}

export function buildLearningJourney(
  summary: unknown,
  events?: AggregatableLearningEvent[],
): LearningJourney {
  if (Array.isArray(events)) {
    const validEvents = events.filter(isLearningEvent);
    const resolved = resolveActiveLesson(validEvents);
    const lessonSummary = buildLearningSummaryForLesson(
      validEvents,
      resolved.lessonSlug,
    );
    const pathJourney = evaluateLessonJourney(
      lessonSummary,
      resolved.lessonSlug,
      validEvents,
    );

    if (resolved.isCurriculumComplete) {
      return withCurriculumNavigation({
        ...pathJourney,
        isCurriculumComplete: true,
      });
    }

    return pathJourney;
  }

  const parsed = parseLearningSummary(summary);

  if (!parsed) {
    return learnFallbackJourney(resolveKnownLessonSlug(), "FALLBACK_LEARN");
  }

  if (parsed.latestLesson && !hasLesson(parsed.latestLesson)) {
    return learnFallbackJourney(resolveKnownLessonSlug(), "FALLBACK_LEARN");
  }

  const lessonSlug = resolveKnownLessonSlug(parsed.latestLesson);
  const pathJourney = evaluateLessonJourney(parsed, lessonSlug);

  if (parsed.totalActivities <= 0) {
    return pathJourney;
  }

  return withCurriculumNavigation(pathJourney);
}
