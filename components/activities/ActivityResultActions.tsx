import Link from "next/link";
import { getStudentPath } from "@/lib/routes";
import type { ResultNextAction } from "@/lib/analytics/resultNextAction";

type ActivityResultActionsProps = {
  lessonPath: string;
  onRestart: () => void;
  nextAction?: ResultNextAction;
  guided?: boolean;
};

function SecondaryNav({ lessonPath }: { lessonPath: string }) {
  return (
    <>
      <Link
        className="button secondary"
        href={lessonPath}
        aria-label="กลับไปบทเรียน"
      >
        กลับไปบทเรียน
      </Link>
      <Link
        className="button secondary"
        href={getStudentPath()}
        aria-label="กลับหน้าหลักนักเรียน"
      >
        กลับหน้าหลักนักเรียน
      </Link>
    </>
  );
}

export function ActivityResultActions({
  lessonPath,
  onRestart,
  nextAction,
  guided = false,
}: ActivityResultActionsProps) {
  if (guided && nextAction) {
    return (
      <div className="millionaireResultActions guidedResultActions">
        {nextAction.sameActivity ? (
          <button
            type="button"
            className="button primary"
            onClick={onRestart}
          >
            {nextAction.label}
          </button>
        ) : (
          <Link
            className="button primary"
            href={nextAction.href}
            aria-label={nextAction.label}
          >
            {nextAction.label}
          </Link>
        )}
        <SecondaryNav lessonPath={lessonPath} />
      </div>
    );
  }

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
