import { ActivityResultActions } from "@/components/activities/ActivityResultActions";
import { buildGameResultPresentation } from "@/lib/millionaire/gameResultPresentation";
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
  const presentation = buildGameResultPresentation(score, total);

  return (
    <section className="gfaGameResult panel">
      <span className="eyebrow">RESULT</span>
      <p className="gfaGameResultKicker">{presentation.kicker}</p>
      <h1>{presentation.title}</h1>
      <p className="gfaGameResultStars">{presentation.starsLabel}</p>
      <p className="gfaGameResultMessage">{presentation.message}</p>
      <ActivityResultActions
        lessonPath={lessonPath}
        onRestart={onRestart}
        nextAction={nextAction}
        guided
      />
    </section>
  );
}
