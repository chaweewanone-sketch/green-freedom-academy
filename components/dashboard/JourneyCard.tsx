import Link from "next/link";
import { getLessonBySlug } from "@/lib/lessons";
import {
  JOURNEY_STAGE_LABELS,
  JOURNEY_TRACK,
} from "@/lib/analytics/journey";
import type { LearningJourney, LearningJourneyStage } from "@/types/analytics";

type JourneyCardProps = {
  journey: LearningJourney;
};

function stageClassName(
  stage: LearningJourneyStage,
  current: LearningJourneyStage,
): string {
  const currentIndex = JOURNEY_TRACK.indexOf(current);
  const stageIndex = JOURNEY_TRACK.indexOf(stage);

  if (stage === current) {
    return "current";
  }

  if (stageIndex >= 0 && stageIndex < currentIndex) {
    return "done";
  }

  return "";
}

export function JourneyCard({ journey }: JourneyCardProps) {
  const lessonTitle =
    getLessonBySlug(journey.lessonSlug)?.title ?? journey.lessonSlug;
  const nextLessonTitle = journey.nextLessonSlug
    ? getLessonBySlug(journey.nextLessonSlug)?.title
    : undefined;
  const stageLabel = JOURNEY_STAGE_LABELS[journey.stage];
  const action = journey.nextAction;

  return (
    <section className="panel studentDashboardSection" aria-label="เส้นทางการเรียน">
      <span className="eyebrow">LEARNING JOURNEY</span>
      <h2>เส้นทางการเรียน</h2>
      <p>
        <strong>{lessonTitle}</strong>
        {" · "}
        ขั้น{stageLabel}
        {" · "}
        {journey.progressPercent}%
      </p>
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={journey.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="ความคืบหน้าเส้นทางการเรียน"
      >
        <div style={{ width: `${journey.progressPercent}%` }} />
      </div>
      <p>{journey.message}</p>
      {nextLessonTitle ? <p>บทถัดไป: {nextLessonTitle}</p> : null}
      <ol className="journeyTrack" aria-label="ลำดับเส้นทางการเรียน">
        {JOURNEY_TRACK.map((stage) => (
          <li
            key={stage}
            className={stageClassName(stage, journey.stage)}
            aria-current={stage === journey.stage ? "step" : undefined}
          >
            {JOURNEY_STAGE_LABELS[stage]}
          </li>
        ))}
      </ol>
      <div className="actions">
        <Link
          className="button primary"
          href={action.href}
          aria-label={
            nextLessonTitle
              ? `${action.label}: ${nextLessonTitle}`
              : action.label
          }
        >
          {action.label}
        </Link>
      </div>
    </section>
  );
}
