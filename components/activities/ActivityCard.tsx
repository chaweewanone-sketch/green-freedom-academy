import Link from "next/link";
import { getActivityPath } from "@/lib/activities";
import type { Activity, ActivityStatus } from "@/types/activity";

type ActivityCardProps = {
  activity: Activity;
  lessonSlug: string;
};

const statusLabels: Record<ActivityStatus, string> = {
  available: "Available",
  "coming-soon": "Coming Soon",
};

export function ActivityCard({ activity, lessonSlug }: ActivityCardProps) {
  const content = (
    <>
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
    </>
  );

  if (activity.status === "available") {
    return (
      <Link
        href={getActivityPath(lessonSlug, activity.id)}
        className="activityCard activityCardLink"
        aria-label={activity.title}
      >
        {content}
      </Link>
    );
  }

  return (
    <article
      className="activityCard activityCardDisabled"
      aria-label={activity.title}
      aria-disabled="true"
    >
      {content}
    </article>
  );
}
