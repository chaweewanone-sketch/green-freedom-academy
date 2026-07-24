import { ChoiceButton } from "./ChoiceButton";
import type { Question } from "@/types/question";

type QuestionCardProps = {
  question: Question;
  selectedChoiceId: string | null;
  revealed: boolean;
  onChoice: (choiceId: string) => void;
};

const difficultyLabels = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
} as const;

export function QuestionCard({
  question,
  selectedChoiceId,
  revealed,
  onChoice,
}: QuestionCardProps) {
  return (
    <article className="millionaireQuestion card">
      <span className="eyebrow">
        MILLIONAIRE CHALLENGE · {difficultyLabels[question.difficulty]}
      </span>
      <h2>{question.prompt}</h2>
      <div className="millionaireChoices">
        {question.choices.map((choice) => {
          let state: "default" | "correct" | "incorrect" = "default";

          if (revealed && choice.id === question.correctChoiceId) {
            state = "correct";
          } else if (
            revealed &&
            choice.id === selectedChoiceId &&
            choice.id !== question.correctChoiceId
          ) {
            state = "incorrect";
          }

          return (
            <ChoiceButton
              key={choice.id}
              label={choice.text}
              onClick={() => onChoice(choice.id)}
              disabled={revealed}
              state={state}
            />
          );
        })}
      </div>
      {revealed && (
        <div className="millionaireExplanation planningTip">
          {question.explanation}
        </div>
      )}
    </article>
  );
}
