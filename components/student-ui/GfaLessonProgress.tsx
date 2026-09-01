type GfaLessonProgressProps = {
  total: number;
  currentStep: number;
  completedSteps: number[];
  onStepSelect: (index: number) => void;
};

export function GfaLessonProgress({
  total,
  currentStep,
  completedSteps,
  onStepSelect,
}: GfaLessonProgressProps) {
  return (
    <ol className="gfaPathStones" aria-label="เส้นทาง 8 ก้อนหิน">
      {Array.from({ length: total }, (_, index) => {
        const isCurrent = index === currentStep;
        const isDone = completedSteps.includes(index);
        const state = isCurrent ? "current" : isDone ? "done" : "future";

        return (
          <li key={index}>
            <button
              type="button"
              className={`gfaPathStone gfaPathStone-${state}`}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`บทที่ ${index + 1} จาก ${total}`}
              onClick={() => onStepSelect(index)}
            >
              {isDone && !isCurrent ? "✓" : index + 1}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
