import Link from "next/link";
import { ResumeLearningCard } from "@/components/dashboard/ResumeLearningCard";
import { FlashCardsReviewEntry } from "@/components/flash-cards/FlashCardsReviewEntry";
import { MILLIONAIRE_ACTIVITY_DISPLAY_NAME } from "@/lib/activities";
import {
  presentActiveLessonCopy,
  presentHomeOverallProgressPercent,
  presentStudentHomeHeroTitle,
} from "@/lib/analytics/pilotLearnerPresentation";
import { getLessonBySlug } from "@/lib/lessons";
import type { StudentLearningHomeModel } from "@/types/analytics";

type StudentLearningHomeProps = {
  model: StudentLearningHomeModel;
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

export function StudentLearningHome({ model }: StudentLearningHomeProps) {
  const {
    resumeLearning,
    activeLesson,
    curriculumProgress,
    latestActivity,
    dashboardHref,
    hasHistory,
  } = model;
  const isComplete = curriculumProgress.isCurriculumComplete;
  const heroTitle = presentStudentHomeHeroTitle({
    resume: resumeLearning,
    hasHistory,
    isCurriculumComplete: isComplete,
  });
  const latestLessonTitle = latestActivity
    ? getLessonBySlug(latestActivity.lessonSlug)?.title ??
      latestActivity.lessonSlug
    : undefined;
  const activeCopy = activeLesson
    ? presentActiveLessonCopy(activeLesson)
    : null;
  const displayOverallPercent = presentHomeOverallProgressPercent({
    activeLessonSlug: activeLesson?.lessonSlug,
    completedLessons: curriculumProgress.completedLessons,
    totalLessons: curriculumProgress.totalLessons,
    engineOverallPercent: curriculumProgress.overallProgressPercent,
  });

  return (
    <div className="studentHome">
      <section className="dashboardHero">
        <div>
          <span className="eyebrow">GREEN FREEDOM ACADEMY</span>
          <h1>{heroTitle}</h1>
          <p>
            {isComplete
              ? "คุณเรียนครบทุกบทในหลักสูตรปัจจุบันแล้ว"
              : "ฉันควรทำอะไรตอนนี้?"}
          </p>
        </div>
      </section>

      <ResumeLearningCard resume={resumeLearning} hasHistory={hasHistory} />

      <FlashCardsReviewEntry />

      <div className="studentHomeCompactGrid">
        {activeLesson && activeCopy ? (
          <section
            className="panel studentHomeCompactCard"
            aria-labelledby="student-home-active-lesson"
          >
            <h2 id="student-home-active-lesson">{activeCopy.heading}</h2>
            <p>
              <strong>{activeLesson.lessonTitle}</strong>
            </p>
            <p>{activeCopy.availabilityLabel}</p>
          </section>
        ) : null}

        <section
          className="panel studentHomeCompactCard"
          aria-labelledby="student-home-progress"
        >
          <h2 id="student-home-progress">ความก้าวหน้าของฉัน</h2>
          <p>
            เรียนจบแล้ว {curriculumProgress.completedLessons} จาก{" "}
            {curriculumProgress.totalLessons} บท
          </p>
          {hasHistory || isComplete ? (
            <>
              <p>{displayOverallPercent}%</p>
              <div
                className="progress"
                role="progressbar"
                aria-valuenow={displayOverallPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="ความก้าวหน้าหลักสูตรโดยรวม"
              >
                <div
                  style={{
                    width: `${displayOverallPercent}%`,
                  }}
                />
              </div>
            </>
          ) : null}
        </section>

        {latestActivity ? (
          <section
            className="panel studentHomeCompactCard"
            aria-labelledby="student-home-latest"
          >
            <h2 id="student-home-latest">กิจกรรมล่าสุด</h2>
            <p>
              <strong>{formatActivityLabel(latestActivity.activity)}</strong>
            </p>
            <p>{latestLessonTitle}</p>
          </section>
        ) : null}
      </div>

      {resumeLearning.action.actionType === "SUMMARY" ? null : (
        <div className="actions studentHomeDashboardLink">
          <Link
            className="button secondary"
            href={dashboardHref}
            aria-label="ดูผลการเรียนทั้งหมด"
          >
            ดูผลการเรียนทั้งหมด
          </Link>
        </div>
      )}
    </div>
  );
}
