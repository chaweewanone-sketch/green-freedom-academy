import Link from "next/link";
import {
  PILOT_COMPLETE_EYEBROW,
  PILOT_COMPLETE_MESSAGE,
  PILOT_COMPLETE_TITLE,
  PILOT_UNAVAILABLE_AVAILABILITY_LABEL,
  PILOT_UNAVAILABLE_STATUS_LABEL,
  isPilotPresentCompleteResume,
  shouldHideSamePageDashboardAction,
} from "@/lib/analytics/pilotLearnerPresentation";
import type { ResumeLearning } from "@/types/analytics";

type ResumeLearningCardProps = {
  resume: ResumeLearning;
  compact?: boolean;
  hasHistory?: boolean;
  suppressSamePageAction?: boolean;
};

export function ResumeLearningCard({
  resume,
  compact = false,
  hasHistory = false,
  suppressSamePageAction = false,
}: ResumeLearningCardProps) {
  const { action } = resume;
  const isPilotComplete = isPilotPresentCompleteResume(resume);
  const eyebrow = isPilotComplete
    ? PILOT_COMPLETE_EYEBROW
    : hasHistory
      ? "RESUME LEARNING"
      : "START LEARNING";
  const hideAction = shouldHideSamePageDashboardAction(
    suppressSamePageAction,
    action.href,
  );
  const heading = isPilotComplete ? PILOT_COMPLETE_TITLE : resume.title;
  const ariaLabel = isPilotComplete
    ? "เรียนจบแล้ว"
    : hasHistory
      ? "เรียนต่อ"
      : "เริ่มการเรียนรู้";

  return (
    <section
      className={
        compact
          ? "panel studentDashboardSection resumeLearningCard resumeLearningCardCompact"
          : "panel studentDashboardSection resumeLearningCard"
      }
      aria-label={ariaLabel}
    >
      <span className="eyebrow">{eyebrow}</span>
      {compact ? <h3>{heading}</h3> : <h2>{heading}</h2>}
      {isPilotComplete ? (
        <>
          <p>{PILOT_COMPLETE_MESSAGE}</p>
          <p>
            {PILOT_UNAVAILABLE_STATUS_LABEL}: <strong>{action.lessonTitle}</strong>
          </p>
          <p>{PILOT_UNAVAILABLE_AVAILABILITY_LABEL}</p>
        </>
      ) : (
        <>
          <p>
            <strong>{action.lessonTitle}</strong>
          </p>
          <p>{resume.description}</p>
        </>
      )}
      {hideAction ? null : (
        <div className="actions">
          <Link
            className="button primary"
            href={action.href}
            aria-label={action.label}
          >
            {action.label}
          </Link>
        </div>
      )}
    </section>
  );
}
