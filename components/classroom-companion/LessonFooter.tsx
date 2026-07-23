type LessonFooterProps = {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onMarkComplete: () => void;
};

export function LessonFooter({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onMarkComplete,
}: LessonFooterProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

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
        onClick={onMarkComplete}
      >
        เข้าใจแล้ว ✓
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
