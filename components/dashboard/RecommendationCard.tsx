import Link from "next/link";
import { learnerSafeNavigation } from "@/lib/analytics/learnerLessonLaunch";
import { getLessonBySlug } from "@/lib/lessons";
import type { LearningRecommendation } from "@/types/analytics";

type RecommendationCardProps = {
  recommendation: LearningRecommendation;
};

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const safe = learnerSafeNavigation(
    recommendation.href,
    recommendation.ctaLabel,
  );
  const lessonTitle = safe.rewritten
    ? "Present Simple"
    : getLessonBySlug(recommendation.lessonSlug)?.title ??
      recommendation.lessonSlug;
  const title = safe.rewritten
    ? "เรียน Present Simple ครบแล้ว"
    : recommendation.title;
  const message = safe.rewritten
    ? "ดูผลการเรียนได้จากแดชบอร์ด"
    : recommendation.message;

  return (
    <section className="panel studentDashboardSection" aria-label="แนะนำขั้นต่อไป">
      <span className="eyebrow">NEXT STEP</span>
      <h2>แนะนำขั้นต่อไป</h2>
      <p>บทเรียนปัจจุบัน: {lessonTitle}</p>
      <p>
        <strong>{title}</strong>
      </p>
      <p>{message}</p>
      <div className="actions">
        <Link
          className="button primary"
          href={safe.href}
          aria-label={safe.label}
        >
          {safe.label}
        </Link>
      </div>
    </section>
  );
}
