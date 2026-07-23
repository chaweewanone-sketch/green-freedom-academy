type LessonProgressProps = {
  percent: number;
};

export function LessonProgress({ percent }: LessonProgressProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="progress companionProgress"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="ความคืบหน้าบทเรียน"
    >
      <div style={{ width: `${clamped}%` }} />
    </div>
  );
}
