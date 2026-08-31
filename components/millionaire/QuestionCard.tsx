import { ChoiceButton } from "./ChoiceButton";
import type { Question } from "@/types/question";

type QuestionCardProps = {
  question: Question;
  selectedChoiceId: string | null;
  revealed: boolean;
  stageNumber: number;
  totalStages: number;
  isFinalStage: boolean;
  onChoice: (choiceId: string) => void;
  onContinue: () => void;
};

export function QuestionCard({
  question,
  selectedChoiceId,
  revealed,
  stageNumber,
  totalStages,
  isFinalStage,
  onChoice,
  onContinue,
}: QuestionCardProps) {
  const selectedIsCorrect =
    selectedChoiceId !== null && selectedChoiceId === question.correctChoiceId;

  return (
    <article className="gfaGameQuestion">
      <header className="gfaGameQuestionHeader">
        <span className="eyebrow">
          ด่าน {stageNumber} จาก {totalStages}
        </span>
        {isFinalStage ? (
          <span className="gfaGameFinalBadge">ด่านสุดท้าย</span>
        ) : null}
      </header>
      <h2>{question.prompt}</h2>
      <div className="gfaGameChoices">
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
            <div key={choice.id} className={`gfaGameChoice gfaGameChoice-${state}`}>
              <ChoiceButton
                label={choice.text}
                onClick={() => onChoice(choice.id)}
                disabled={revealed}
                state={state}
              />
              {state === "correct" ? (
                <span className="gfaGameChoiceNote">คำตอบที่ถูก</span>
              ) : null}
              {state === "incorrect" ? (
                <span className="gfaGameChoiceNote">คำตอบที่เลือก</span>
              ) : null}
            </div>
          );
        })}
      </div>
      {revealed ? (
        <div
          className={`gfaGameFeedback ${
            selectedIsCorrect ? "gfaGameFeedbackCorrect" : "gfaGameFeedbackMissed"
          }`}
          role="status"
        >
          {selectedIsCorrect ? "ถูกต้อง! ⭐" : "ยังไม่ถูก ลองดูเหตุผลข้อนี้นะ"}
        </div>
      ) : null}
      {revealed ? (
        <div className="gfaGameExplanation">{question.explanation}</div>
      ) : null}
      {revealed ? (
        <div className="gfaGameContinue">
          <button type="button" className="button primary" onClick={onContinue}>
            {isFinalStage ? "ดูผลเกม" : "ไปด่านต่อไป →"}
          </button>
        </div>
      ) : null}
    </article>
  );
}
