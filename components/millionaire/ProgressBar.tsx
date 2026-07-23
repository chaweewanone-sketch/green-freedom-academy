type ProgressBarProps = {
  current: number;
  total: number;
  score: number;
};

export function ProgressBar({ current, total, score }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="millionaireProgress">
      <div className="millionaireProgressMeta">
        <span>
          คำถาม {current} / {total}
        </span>
        <span>
          คะแนนปัจจุบัน: <strong>{score}</strong>
        </span>
      </div>
      <div
        className="progress millionaireProgressBar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="ความคืบหน้าเกม"
      >
        <div style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
