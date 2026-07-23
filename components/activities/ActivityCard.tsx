import type { Activity, ActivityStatus } from "@/types/activity";

type ActivityCardProps = {
  activity: Activity;
};

const statusLabels: Record<ActivityStatus, string> = {
  available: "Available",
  "coming-soon": "Coming Soon",
};

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <article className="activityCard" aria-label={activity.title}>
      <span className="activityCardIcon" aria-hidden="true">
        {activity.icon}
      </span>
      <span
        className={`activityBadge ${activity.status}`}
        aria-label={`Status: ${statusLabels[activity.status]}`}
      >
        {statusLabels[activity.status]}
      </span>
      <h3>{activity.title}</h3>
      <p>{activity.description}</p>
    </article>
  );
}
