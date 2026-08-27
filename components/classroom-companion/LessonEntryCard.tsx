import Link from "next/link";
import type { LessonEntryState } from "@/types/analytics";

type LessonEntryCardProps = {
  model: LessonEntryState;
};

export function LessonEntryCard({ model }: LessonEntryCardProps) {
  const showPercent =
    model.isActiveLesson || model.isComplete || model.hasLessonHistory;

  return (
    <section
      className="panel lessonEntryCard"
      aria-label="ความก้าวหน้าในบทนี้"
    >
      <span className="eyebrow">LESSON PROGRESS</span>
      <p className="lessonEntryKicker">ความก้าวหน้าในบทนี้</p>
      <p className="lessonEntryTitle">
        <strong>{model.lessonTitle}</strong>
      </p>
      <p className="lessonEntryNotice">{model.notice}</p>
      <p>
        {model.statusLabel}
        {" · ขั้น"}
        {model.stageLabel}
        {showPercent ? ` · ${model.progressPercent}%` : null}
      </p>
      {showPercent ? (
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={model.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`ความก้าวหน้า ${model.lessonTitle}`}
        >
          <div style={{ width: `${model.progressPercent}%` }} />
        </div>
      ) : null}
      {model.noticeKind === "out-of-order" && model.activeLessonTitle ? (
        <p>
          บทเรียนปัจจุบัน: <strong>{model.activeLessonTitle}</strong>
        </p>
      ) : null}
      <div className="actions">
        <Link
          className="button primary"
          href={model.nextAction.href}
          aria-label={model.nextAction.label}
        >
          {model.nextAction.label}
        </Link>
      </div>
    </section>
  );
}
