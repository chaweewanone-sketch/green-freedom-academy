import type { LessonStep } from "@/types/lesson";

type PlanningPanelProps = {
  lessonTitle: string;
  steps: LessonStep[];
  currentStep: number;
  completedSteps: number[];
};

export function PlanningPanel({
  lessonTitle,
  steps,
  currentStep,
  completedSteps,
}: PlanningPanelProps) {
  const totalMinutes = steps.reduce(
    (sum, step) => sum + (step.estimatedMinutes ?? 0),
    0,
  );

  const activeStep = steps[currentStep];

  return (
    <article className="lessonContent companionPlanning">
      <span className="eyebrow">โหมดวางแผน</span>
      <h1>{lessonTitle}</h1>
      <p className="companionPlanningIntro">
        วางแผนก่อนสอน — ดูขั้นตอน เวลาโดยประมาณ และคำแนะนำสำหรับครู
      </p>

      <div className="planningSummary">
        <div>
          <span>จำนวนขั้นตอน</span>
          <strong>{steps.length} ขั้น</strong>
        </div>
        <div>
          <span>เวลาโดยประมาณ</span>
          <strong>{totalMinutes} นาที</strong>
        </div>
        <div>
          <span>ทำแล้ว</span>
          <strong>{completedSteps.length} / {steps.length}</strong>
        </div>
      </div>

      <h2>รายการขั้นตอน</h2>
      <ul className="planningStepList">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = completedSteps.includes(index);

          return (
            <li
              key={step.title}
              className={`${isActive ? "active " : ""}${isDone ? "done" : ""}`}
            >
              <span>{isDone ? "✓" : index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                {step.estimatedMinutes != null && (
                  <small>~{step.estimatedMinutes} นาที</small>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {activeStep?.teacherTip && (
        <>
          <h2>คำแนะนำสำหรับขั้นปัจจุบัน</h2>
          <div className="planningTip">{activeStep.teacherTip}</div>
        </>
      )}
    </article>
  );
}
