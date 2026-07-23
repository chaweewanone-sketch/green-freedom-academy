import Link from "next/link";

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
      <h2>จบเกม Millionaire Challenge</h2>
      <p className="millionaireResultScore">
        คะแนน <strong>{score}</strong> / {total}
      </p>
      <div className="millionaireResultActions">
        <button type="button" className="button primary" onClick={onRestart}>
          เริ่มใหม่
        </button>
        <Link className="button secondary" href={lessonPath}>
          กลับไปบทเรียน
        </Link>
      </div>
    </section>
  );
}
