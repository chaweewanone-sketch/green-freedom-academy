import Link from "next/link";
import type { LearningRecommendation } from "@/types/analytics";

type RecommendationCardProps = {
  recommendation: LearningRecommendation;
};

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <section className="panel studentDashboardSection" aria-label="แนะนำขั้นต่อไป">
      <span className="eyebrow">NEXT STEP</span>
      <h2>แนะนำขั้นต่อไป</h2>
      <p>
        <strong>{recommendation.title}</strong>
      </p>
      <p>{recommendation.message}</p>
      <div className="actions">
        <Link className="button primary" href={recommendation.href}>
          {recommendation.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
