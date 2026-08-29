import Link from "next/link";
import { getStudentPath } from "@/lib/routes";
import type { ResultNextAction } from "@/lib/analytics/resultNextAction";

type ActivityResultActionsProps = {
  lessonPath: string;
  onRestart: () => void;
  nextAction?: ResultNextAction;
};

export function ActivityResultActions({
  lessonPath,
  onRestart,
  nextAction,
}: ActivityResultActionsProps) {
  if (nextAction) {
    return (
      <div className="millionaireResultActions">
        <Link
          className="button primary"
          href={nextAction.href}
          aria-label={nextAction.label}
        >
          {nextAction.label}
        </Link>
        <button type="button" className="button secondary" onClick={onRestart}>
          เริ่มใหม่
        </button>
        <Link
          className="button secondary"
          href={getStudentPath()}
          aria-label="กลับหน้าหลักนักเรียน"
        >
          กลับหน้าหลักนักเรียน
        </Link>
      </div>
    );
  }

  return (
    <div className="millionaireResultActions">
      <Link
        className="button primary"
        href={getStudentPath()}
        aria-label="กลับหน้าหลักนักเรียน"
      >
        กลับหน้าหลักนักเรียน
      </Link>
      <button type="button" className="button secondary" onClick={onRestart}>
        เริ่มใหม่
      </button>
      <Link
        className="button secondary"
        href={lessonPath}
        aria-label="กลับไปบทเรียน"
      >
        กลับไปบทเรียน
      </Link>
    </div>
  );
}
