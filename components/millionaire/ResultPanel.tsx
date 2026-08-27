import { ActivityResultActions } from "@/components/activities/ActivityResultActions";

type ResultPanelProps = {
  score: number;
  total: number;
  lessonPath: string;
  onRestart: () => void;
};

export function ResultPanel({
  score,
  total,
  lessonPath,
  onRestart,
}: ResultPanelProps) {
  return (
    <section className="millionaireResult panel">
      <span className="eyebrow">RESULT</span>
      <h1>จบเกม Millionaire Challenge</h1>
      <p className="millionaireResultScore">
        คะแนน <strong>{score}</strong> / {total}
      </p>
      <ActivityResultActions lessonPath={lessonPath} onRestart={onRestart} />
    </section>
  );
}
