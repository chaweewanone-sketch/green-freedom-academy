import Link from "next/link";
import type {
  AggregatableLearningEvent,
  LearningSummary,
} from "@/types/analytics";
import { buildCurriculumProgress } from "@/lib/analytics/curriculumProgress";
import { buildLearningJourney } from "@/lib/analytics/journey";
import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { MILLIONAIRE_ACTIVITY_DISPLAY_NAME } from "@/lib/activities";
import { getStudentPath } from "@/lib/routes";
import { CurriculumProgressCard } from "./CurriculumProgressCard";
import { JourneyCard } from "./JourneyCard";
import { RecommendationCard } from "./RecommendationCard";
import { ResumeLearningCard } from "./ResumeLearningCard";

type StudentDashboardProps = {
  summary: LearningSummary;
  events?: AggregatableLearningEvent[];
};

function formatActivityLabel(activity: string): string {
  const labels: Record<string, string> = {
    millionaire: MILLIONAIRE_ACTIVITY_DISPLAY_NAME,
    quiz: "Quiz",
    learn: "เรียน",
    "flash-cards": "Flash Cards",
    matching: "Matching Game",
    "final-test": "Final Test",
  };

  return labels[activity] ?? activity;
}

function formatLessonSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatScore(value: number): string {
  return `${value}%`;
}

export function StudentDashboard({
  summary,
  events,
}: StudentDashboardProps) {
  const history = events ?? [];
  const journey = buildLearningJourney(summary, events);
  const recommendation = buildLearningRecommendation(summary, events);
  const curriculumProgress = buildCurriculumProgress(history);
  const resume = buildResumeLearning(summary, events);

  if (summary.totalActivities === 0) {
    return (
      <>
        <section className="panel studentDashboardEmpty">
          <span className="eyebrow">LEARNING SUMMARY</span>
          <h2>ยังไม่มีกิจกรรมการเรียน</h2>
          <p className="studentDashboardEmptyMessage">
            เริ่มทำ Quiz, {MILLIONAIRE_ACTIVITY_DISPLAY_NAME} หรือ Flash Cards เพื่อดูสรุปการเรียนที่นี่
          </p>
          <div className="actions">
            <Link
              className="button secondary"
              href={getStudentPath()}
              aria-label="กลับไปหน้าเรียน"
            >
              กลับไปหน้าเรียน
            </Link>
          </div>
        </section>
        <CurriculumProgressCard progress={curriculumProgress} showOverallPercent={false} />
        <JourneyCard journey={journey} suppressSamePageAction />
        <RecommendationCard recommendation={recommendation} suppressSamePageAction />
        <ResumeLearningCard
          resume={resume}
          compact
          hasHistory={summary.totalActivities > 0}
          suppressSamePageAction
        />
      </>
    );
  }

  const activityStats = [
    { label: "กิจกรรมทั้งหมด", value: String(summary.totalActivities) },
    { label: "Quiz", value: String(summary.quizAttempts) },
    { label: MILLIONAIRE_ACTIVITY_DISPLAY_NAME, value: String(summary.millionaireAttempts) },
    { label: "Flash Cards", value: String(summary.flashCardAttempts) },
  ];

  const scoreStats = [
    {
      label: "คะแนนเฉลี่ย Quiz",
      value: formatScore(summary.averageQuizScore),
    },
    {
      label: `คะแนนเฉลี่ย ${MILLIONAIRE_ACTIVITY_DISPLAY_NAME}`,
      value: formatScore(summary.averageMillionaireScore),
    },
  ];

  const recallStats = [
    { label: "Easy · จำได้คล่อง", value: String(summary.flashEasy) },
    { label: "Medium · ยังต้องทบทวน", value: String(summary.flashMedium) },
    { label: "Hard · ควรฝึกซ้ำ", value: String(summary.flashHard) },
  ];

  return (
    <div className="studentDashboard">
      <section className="dashboardHero">
        <div>
          <span className="eyebrow">STUDENT DASHBOARD</span>
          <h1>สรุปการเรียนของฉัน</h1>
          <p>ภาพรวมกิจกรรมและความก้าวหน้าจาก Analytics</p>
          <div className="actions">
            <Link
              className="button secondary"
              href={getStudentPath()}
              aria-label="กลับไปหน้าเรียน"
            >
              กลับไปหน้าเรียน
            </Link>
          </div>
        </div>
      </section>

      <CurriculumProgressCard progress={curriculumProgress} />

      <JourneyCard journey={journey} suppressSamePageAction />

      <RecommendationCard recommendation={recommendation} suppressSamePageAction />

      <section className="statGrid" aria-label="สถิติกิจกรรม">
        {activityStats.map((stat) => (
          <article className="card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="statGrid studentDashboardScoreGrid" aria-label="คะแนนเฉลี่ย">
        {scoreStats.map((stat) => (
          <article className="card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="panel studentDashboardSection">
        <h2>สรุปการจำ Flash Cards</h2>
        <div className="planningSummary">
          {recallStats.map((stat) => (
            <div key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel studentDashboardSection">
        <h2>กิจกรรมล่าสุด</h2>
        <dl className="activityPlaceholderMeta studentDashboardLatest">
          <div>
            <dt>กิจกรรม</dt>
            <dd>
              {summary.latestActivity
                ? formatActivityLabel(summary.latestActivity)
                : "—"}
            </dd>
          </div>
          <div>
            <dt>บทเรียนของกิจกรรมล่าสุด</dt>
            <dd>
              {summary.latestLesson
                ? formatLessonSlug(summary.latestLesson)
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <ResumeLearningCard
        resume={resume}
        compact
        hasHistory={summary.totalActivities > 0}
        suppressSamePageAction
      />
    </div>
  );
}
