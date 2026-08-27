type LessonFooterProps = {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onMarkComplete: () => void;
  isLearnRecorded?: boolean;
};

export function LessonFooter({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onMarkComplete,
  isLearnRecorded = false,
}: LessonFooterProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const completeDisabled = isLast && isLearnRecorded;

  return (
    <footer className="lessonActions companionFooter">
      <button
        type="button"
        className="button secondary"
        disabled={isFirst}
        onClick={onPrevious}
      >
        ← ก่อนหน้า
      </button>
      <button
        type="button"
        className="button primary"
        disabled={completeDisabled}
        onClick={onMarkComplete}
        aria-live="polite"
      >
        {completeDisabled ? "บันทึกแล้ว ✓" : "เข้าใจแล้ว ✓"}
      </button>
      <button
        type="button"
        className="button secondary"
        disabled={isLast}
        onClick={onNext}
      >
        ถัดไป →
      </button>
    </footer>
  );
}
