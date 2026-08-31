import { ActivityResultActions } from "@/components/activities/ActivityResultActions";
import type { ResultNextAction } from "@/lib/analytics/resultNextAction";

type ResultPanelProps = {
  score: number;
  total: number;
  lessonPath: string;
  onRestart: () => void;
  nextAction?: ResultNextAction;
};

export function ResultPanel({
  score,
  total,
  lessonPath,
  onRestart,
  nextAction,
}: ResultPanelProps) {
  return (
    <section className="millionaireResult panel">
      <span className="eyebrow">RESULT</span>
      <h1>จบเกม Millionaire Challenge</h1>
      <p className="millionaireResultScore">
        คะแนน <strong>{score}</strong> / {total}
      </p>
      <ActivityResultActions
        lessonPath={lessonPath}
        onRestart={onRestart}
        nextAction={nextAction}
        guided
      />
    </section>
  );
}
