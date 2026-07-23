import type { LessonStep } from "@/types/lesson";

type TeachingPanelProps = {
  stepIndex: number;
  totalSteps: number;
  step: LessonStep;
};

export function TeachingPanel({
  stepIndex,
  totalSteps,
  step,
}: TeachingPanelProps) {
  return (
    <article className="lessonContent companionTeaching">
      <span className="eyebrow">
        บทที่ {stepIndex + 1} จาก {totalSteps}
      </span>
      <h1>{step.title}</h1>
      <p>{step.description}</p>
      <div className="formula">{step.formula}</div>
      <h2>ตัวอย่าง</h2>
      {step.examples.map((example) => (
        <div className="example" key={example}>
          {example}
        </div>
      ))}
      {step.teacherTip && (
        <>
          <h2>คำแนะนำสำหรับครู</h2>
          <div className="planningTip">{step.teacherTip}</div>
        </>
      )}
    </article>
  );
}
