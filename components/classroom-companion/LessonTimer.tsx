import { formatTimer } from "@/lib/hooks/useLessonTimer";

type LessonTimerProps = {
  seconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
};

export function LessonTimer({
  seconds,
  isRunning,
  onStart,
  onPause,
  onReset,
}: LessonTimerProps) {
  return (
    <div className="lessonTimer" aria-label="ตัวจับเวลาสอน">
      <span className="lessonTimerLabel">เวลาสอน</span>
      <strong className="lessonTimerDisplay">{formatTimer(seconds)}</strong>
      <div className="lessonTimerActions">
        {isRunning ? (
          <button type="button" className="button secondary" onClick={onPause}>
            หยุดชั่วคราว
          </button>
        ) : (
          <button type="button" className="button primary" onClick={onStart}>
            เริ่มจับเวลา
          </button>
        )}
        <button type="button" className="button secondary" onClick={onReset}>
          รีเซ็ต
        </button>
      </div>
    </div>
  );
}
