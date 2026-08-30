type LessonNavigatorProps = {
  steps: { title: string }[];
  currentStep: number;
  completedSteps: number[];
  onStepSelect: (index: number) => void;
};

export function LessonNavigator({
  steps,
  currentStep,
  completedSteps,
  onStepSelect,
}: LessonNavigatorProps) {
  return (
    <aside className="lessonNav companionNav">
      <p className="companionNavLabel">ขั้นตอนบทเรียน</p>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = completedSteps.includes(index);

        return (
          <button
            type="button"
            key={step.title}
            className={`${isActive ? "active " : "companionNavSecondary "}${isDone ? "done" : ""}`}
            onClick={() => onStepSelect(index)}
            aria-current={isActive ? "step" : undefined}
          >
            <span>{isDone ? "✓" : index + 1}</span>
            {step.title}
          </button>
        );
      })}
    </aside>
  );
}
