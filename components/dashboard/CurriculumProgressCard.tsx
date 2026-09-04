import {
  presentCurriculumProgress,
} from "@/lib/analytics/pilotLearnerPresentation";
import { getLessonBySlug } from "@/lib/lessons";
import type { CurriculumProgress } from "@/types/analytics";

type CurriculumProgressCardProps = {
  progress: CurriculumProgress;
  showOverallPercent?: boolean;
};

export function CurriculumProgressCard({
  progress,
  showOverallPercent = true,
}: CurriculumProgressCardProps) {
  const presented = presentCurriculumProgress(progress);
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
      {activeTitle && presented.showActiveAsCurrent ? (
        <p>
          ตอนนี้กำลังเรียน: <strong>{activeTitle}</strong>
        </p>
      ) : activeTitle ? (
        <p>
          บทเรียนถัดไป: <strong>{activeTitle}</strong>
          {" · "}
          ยังไม่เปิดให้เรียน
        </p>
      ) : (
        <p>
          <strong>เรียนจบหลักสูตรที่มีแล้ว</strong>
        </p>
      )}
      <p>
        เรียนจบแล้ว {progress.completedLessons}/{progress.totalLessons} บท
        {showOverallPercent ? ` · ${presented.displayOverallPercent}%` : null}
      </p>
      {showOverallPercent ? (
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={presented.displayOverallPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="ความก้าวหน้าหลักสูตรโดยรวม"
        >
          <div style={{ width: `${presented.displayOverallPercent}%` }} />
        </div>
      ) : null}
      <ol className="curriculumProgressList" aria-label="บทเรียนในหลักสูตร">
        {presented.lessons.map((lesson) => (
          <li
            key={lesson.lessonSlug}
            className={lesson.itemClassName}
            aria-current={lesson.highlightAsActive ? "step" : undefined}
          >
            <div>
              <strong>{lesson.lessonTitle}</strong>
              <span>
                {lesson.displayStatusLabel}
                {lesson.displayAvailabilityLabel
                  ? ` · ${lesson.displayAvailabilityLabel}`
                  : null}
                {lesson.displayStageLabel
                  ? ` · ขั้น${lesson.displayStageLabel}`
                  : null}
                {" · "}
                {lesson.displayPercent}%
              </span>
            </div>
            <div
              className="progress"
              role="progressbar"
              aria-valuenow={lesson.displayPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`ความก้าวหน้า ${lesson.lessonTitle}`}
            >
              <div style={{ width: `${lesson.displayPercent}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
