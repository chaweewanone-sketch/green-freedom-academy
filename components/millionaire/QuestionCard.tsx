import { ChoiceButton } from "./ChoiceButton";
import type { MillionaireChoice } from "@/lib/millionaire/buildChallenges";

type QuestionCardProps = {
  title: string;
  description: string;
  choices: MillionaireChoice[];
  selectedChoiceId: string | null;
  revealed: boolean;
  onChoice: (choiceId: string) => void;
};

export function QuestionCard({
  title,
  description,
  choices,
  selectedChoiceId,
  revealed,
  onChoice,
}: QuestionCardProps) {
  return (
    <article className="millionaireQuestion card">
      <span className="eyebrow">MILLIONAIRE CHALLENGE</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="millionaireChoices">
        {choices.map((choice) => {
          let state: "default" | "correct" | "incorrect" = "default";

          if (revealed && choice.isCorrect) {
            state = "correct";
          } else if (revealed && choice.id === selectedChoiceId && !choice.isCorrect) {
            state = "incorrect";
          }

          return (
            <ChoiceButton
              key={choice.id}
              label={choice.label}
              onClick={() => onChoice(choice.id)}
              disabled={revealed}
              state={state}
            />
          );
        })}
      </div>
    </article>
  );
}
