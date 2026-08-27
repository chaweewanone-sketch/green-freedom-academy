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
}: LessonHeaderProps) {
  return (
    <header className="companionHeader">
      <div className="companionHeaderStart">
        <Link href={backHref} aria-label={backLabel}>
          ← {backLabel}
        </Link>
        <strong>{title}</strong>
      </div>

      <div className="companionHeaderCenter">
        <span className="stepIndicator">
          ขั้นที่ {currentStep + 1} / {totalSteps}
        </span>
        <span className="companionPercent">{progressPercent}%</span>
      </div>

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
    </header>
  );
}
