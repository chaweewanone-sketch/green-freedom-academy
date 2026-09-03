import Link from "next/link";
import { notFound } from "next/navigation";
import { StudentActivityPlayer } from "@/components/activities";
import { createAssessmentSession } from "@/lib/assessment";
import { getLearningActivities } from "@/lib/activities";
import { getLessonBySlug } from "@/lib/lessons";
import { getLessonPath } from "@/lib/routes";
import type { ActivityStatus } from "@/types/activity";

type ActivityPageProps = {
  params: Promise<{ slug: string; activity: string }>;
};

const recordedActivities = ["millionaire", "quiz", "flash-cards"] as const;

function isRecordedActivity(
  activityId: string,
): activityId is (typeof recordedActivities)[number] {
  return recordedActivities.some((item) => item === activityId);
}

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

  if (isRecordedActivity(activityId)) {
    const session = createAssessmentSession(lesson, activityId);
    const mainClass =
      activityId === "quiz"
        ? "gfaQuizPage"
        : activityId === "millionaire"
          ? "gfaMillionairePage"
          : "page";

    return (
      <main className={mainClass}>
        <StudentActivityPlayer
          session={session}
          lesson={lesson}
          lessonTitle={lesson.title}
          lessonPath={getLessonPath(slug)}
        />
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
        <Link className="button secondary" href={getLessonPath(slug)}>
          กลับไปบทเรียน
        </Link>
      </section>
    </main>
  );
}
