import Link from "next/link";
import type { ResumeLearning } from "@/types/analytics";

type ResumeLearningCardProps = {
  resume: ResumeLearning;
  compact?: boolean;
};

export function ResumeLearningCard({
  resume,
  compact = false,
}: ResumeLearningCardProps) {
  const { action } = resume;

  return (
    <section
      className={
        compact
          ? "panel studentDashboardSection resumeLearningCard resumeLearningCardCompact"
          : "panel studentDashboardSection resumeLearningCard"
      }
      aria-label="เรียนต่อ"
    >
      <span className="eyebrow">RESUME LEARNING</span>
      {compact ? <h3>{resume.title}</h3> : <h2>{resume.title}</h2>}
      <p>
        <strong>{action.lessonTitle}</strong>
      </p>
      <p>{resume.description}</p>
      <div className="actions">
        <Link
          className="button primary"
          href={action.href}
          aria-label={action.label}
        >
          {action.label}
        </Link>
      </div>
    </section>
  );
}
