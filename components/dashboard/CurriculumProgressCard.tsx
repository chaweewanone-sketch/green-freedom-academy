import {
  CURRICULUM_LESSON_STATUS_LABELS,
} from "@/lib/analytics/curriculumProgress";
import { JOURNEY_STAGE_LABELS } from "@/lib/analytics/journey";
import { getLessonBySlug } from "@/lib/lessons";
import type { CurriculumProgress } from "@/types/analytics";

type CurriculumProgressCardProps = {
  progress: CurriculumProgress;
};

export function CurriculumProgressCard({
  progress,
}: CurriculumProgressCardProps) {
  const activeTitle = progress.activeLessonSlug
    ? getLessonBySlug(progress.activeLessonSlug)?.title ??
      progress.activeLessonSlug
    : undefined;

  return (
    <section
      className="panel studentDashboardSection"
      aria-label="ความก้าวหน้าหลักสูตร"
    >
      <span className="eyebrow">CURRICULUM PROGRESS</span>
      <h2>ความก้าวหน้าหลักสูตร</h2>
      {activeTitle ? (
        <p>
          ตอนนี้กำลังเรียน: <strong>{activeTitle}</strong>
        </p>
      ) : (
        <p>
          <strong>เรียนจบหลักสูตรที่มีแล้ว</strong>
        </p>
      )}
      <p>
        เรียนจบแล้ว {progress.completedLessons}/{progress.totalLessons} บท ·{" "}
        {progress.overallProgressPercent}%
      </p>
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={progress.overallProgressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="ความก้าวหน้าหลักสูตรโดยรวม"
      >
        <div style={{ width: `${progress.overallProgressPercent}%` }} />
      </div>
      <ol className="curriculumProgressList" aria-label="บทเรียนในหลักสูตร">
        {progress.lessons.map((lesson) => {
          const statusLabel = CURRICULUM_LESSON_STATUS_LABELS[lesson.status];
          const stageLabel = JOURNEY_STAGE_LABELS[lesson.stage];
          const statusClass = lesson.status.toLowerCase();

          return (
            <li
              key={lesson.lessonSlug}
              className={`curriculumProgressItem ${statusClass}`}
              aria-current={lesson.status === "ACTIVE" ? "step" : undefined}
            >
              <div>
                <strong>{lesson.lessonTitle}</strong>
                <span>
                  {statusLabel}
                  {" · ขั้น"}
                  {stageLabel}
                  {" · "}
                  {lesson.progressPercent}%
                </span>
              </div>
              <div
                className="progress"
                role="progressbar"
                aria-valuenow={lesson.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`ความก้าวหน้า ${lesson.lessonTitle}`}
              >
                <div style={{ width: `${lesson.progressPercent}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
