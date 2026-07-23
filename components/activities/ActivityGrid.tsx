import { ActivityCard } from "./ActivityCard";
import type { Activity } from "@/types/activity";

type ActivityGridProps = {
  activities: Activity[];
  title?: string;
};

export function ActivityGrid({
  activities,
  title = "Learning Activities",
}: ActivityGridProps) {
  return (
    <section className="activitySection" aria-labelledby="activity-section-title">
      <h2 id="activity-section-title">{title}</h2>
      <div className="activityGrid">
        {activities.map((activity) => (
          <ActivityCard activity={activity} key={activity.id} />
        ))}
      </div>
    </section>
  );
}
