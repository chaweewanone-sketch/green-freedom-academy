import Link from "next/link";
import type { CompanionMode } from "@/types/lesson";

type LessonHeaderProps = {
  backHref: string;
  backLabel?: string;
  title: string;
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  mode: CompanionMode;
  onModeChange: (mode: CompanionMode) => void;
  showClassroomControls?: boolean;
};

export function LessonHeader({
  backHref,
  backLabel = "หน้าหลักนักเรียน",
  title,
  currentStep,
  totalSteps,
  progressPercent,
  mode,
  onModeChange,
  showClassroomControls = true,
}: LessonHeaderProps) {
  return (
    <header
      className={
        showClassroomControls
          ? "companionHeader"
          : "companionHeader companionHeaderStudent"
      }
    >
      <div className="companionHeaderStart">
        <Link href={backHref} aria-label={backLabel}>
          ← {backLabel}
        </Link>
        <strong>{title}</strong>
      </div>

      <div className="companionHeaderCenter">
        <span className="stepIndicator">
          บทที่ {currentStep + 1} จาก {totalSteps}
        </span>
        <span className="companionPercent">{progressPercent}%</span>
      </div>

      {showClassroomControls ? (
        <div className="modeTabs" role="tablist" aria-label="โหมดการใช้งาน">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "teaching"}
            className={mode === "teaching" ? "active" : ""}
            onClick={() => onModeChange("teaching")}
          >
            โหมดสอน
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "planning"}
            className={mode === "planning" ? "active" : ""}
            onClick={() => onModeChange("planning")}
          >
            โหมดวางแผน
          </button>
        </div>
      ) : null}
    </header>
  );
}
