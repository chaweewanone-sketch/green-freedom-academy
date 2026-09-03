import { ActivityResultActions } from "@/components/activities/ActivityResultActions";
import { buildGameResultPresentation } from "@/lib/millionaire/gameResultPresentation";
import type { ResultNextAction } from "@/lib/analytics/resultNextAction";

type ResultPanelProps = {
  score: number;
  total: number;
  lessonTitle: string;
  lessonPath: string;
  onRestart: () => void;
  nextAction?: ResultNextAction;
};

export function ResultPanel({
  score,
  total,
  lessonTitle,
  lessonPath,
  onRestart,
  nextAction,
}: ResultPanelProps) {
  const presentation = buildGameResultPresentation(score, total, lessonTitle);

  return (
    <section className={`gfaGameResult gfaGameResult-${presentation.band}`}>
      <p className="gfaGameResultKicker">{presentation.kicker}</p>
      <h1>{presentation.title}</h1>
      <p className="gfaGameResultStars">⭐ {presentation.starsLabel}</p>
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
