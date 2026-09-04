import Link from "next/link";
import { shouldHideSamePageDashboardAction } from "@/lib/analytics/pilotLearnerPresentation";
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
  const eyebrow = hasHistory ? "RESUME LEARNING" : "START LEARNING";
  const hideAction = shouldHideSamePageDashboardAction(
    suppressSamePageAction,
    action.href,
  );

  return (
    <section
      className={
        compact
          ? "panel studentDashboardSection resumeLearningCard resumeLearningCardCompact"
          : "panel studentDashboardSection resumeLearningCard"
      }
      aria-label={hasHistory ? "เรียนต่อ" : "เริ่มการเรียนรู้"}
    >
      <span className="eyebrow">{eyebrow}</span>
      {compact ? <h3>{resume.title}</h3> : <h2>{resume.title}</h2>}
      <p>
        <strong>{action.lessonTitle}</strong>
      </p>
      <p>{resume.description}</p>
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
