import {
  GUIDED_LEARN_COMPLETE_LABEL,
  GUIDED_LEARN_NEXT_LABEL,
  GUIDED_LEARN_PREVIOUS_LABEL,
  buildGuidedLearnFooterState,
} from "@/lib/lessons/guidedLearnFooter";

type LessonFooterProps = {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onMarkComplete: () => void;
  isLearnRecorded?: boolean;
  guided?: boolean;
};

export function LessonFooter({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onMarkComplete,
  isLearnRecorded = false,
  guided = false,
}: LessonFooterProps) {
  if (guided) {
    const state = buildGuidedLearnFooterState(currentStep, totalSteps);

    return (
      <footer className="lessonActions companionFooter guidedLearnFooter">
        {state.showPrevious ? (
          <button
            type="button"
            className="button secondary"
            onClick={onPrevious}
          >
            {GUIDED_LEARN_PREVIOUS_LABEL}
          </button>
        ) : null}
        <button
          type="button"
          className="button primary"
          onClick={state.primaryKind === "complete" ? onMarkComplete : onNext}
        >
          {state.primaryKind === "complete"
            ? GUIDED_LEARN_COMPLETE_LABEL
            : GUIDED_LEARN_NEXT_LABEL}
        </button>
      </footer>
    );
  }

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
