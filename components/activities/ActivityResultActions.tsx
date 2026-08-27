import Link from "next/link";
import { getStudentPath } from "@/lib/routes";

type ActivityResultActionsProps = {
  lessonPath: string;
  onRestart: () => void;
};

export function ActivityResultActions({
  lessonPath,
  onRestart,
}: ActivityResultActionsProps) {
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
