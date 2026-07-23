import Link from "next/link";
import { notFound } from "next/navigation";
import { MillionaireGame } from "@/components/millionaire";
import { getLearningActivities } from "@/lib/activities";
import { getLessonBySlug } from "@/lib/lessons";
import type { ActivityStatus } from "@/types/activity";

type ActivityPageProps = {
  params: Promise<{ slug: string; activity: string }>;
};

const statusLabels: Record<ActivityStatus, string> = {
  available: "Available",
  "coming-soon": "Coming Soon",
};

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { slug, activity: activityId } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  const activity = getLearningActivities().find((item) => item.id === activityId);

  if (!activity) {
    notFound();
  }

  if (activityId === "millionaire") {
    return (
      <main className="page">
        <MillionaireGame lesson={lesson} />
      </main>
    );
  }

  return (
    <main className="page">
      <section className="panel activityPlaceholder">
        <span className="activityCardIcon" aria-hidden="true">
          {activity.icon}
        </span>
        <h1>{activity.title}</h1>
        <dl className="activityPlaceholderMeta">
          <div>
            <dt>Lesson</dt>
            <dd>{lesson.title}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{statusLabels[activity.status]}</dd>
          </div>
        </dl>
        <p className="activityPlaceholderMessage">
          This activity is not implemented yet.
        </p>
        <Link className="button secondary" href={`/lesson/${slug}`}>
          ← Back to lesson
        </Link>
      </section>
    </main>
  );
}
