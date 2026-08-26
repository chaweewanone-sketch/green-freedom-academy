import Link from "next/link";
import type { ResumeLearning } from "@/types/analytics";

type ResumeLearningCardProps = {
  resume: ResumeLearning;
};

export function ResumeLearningCard({ resume }: ResumeLearningCardProps) {
  const { action } = resume;

  return (
    <section
      className="panel studentDashboardSection resumeLearningCard"
      aria-label="เรียนต่อ"
    >
      <span className="eyebrow">RESUME LEARNING</span>
      <h2>{resume.title}</h2>
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
