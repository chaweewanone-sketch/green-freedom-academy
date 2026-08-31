import { ChoiceButton } from "./ChoiceButton";
import type { Question } from "@/types/question";

type QuestionCardProps = {
  question: Question;
  selectedChoiceId: string | null;
  revealed: boolean;
  isFinalStage: boolean;
  onChoice: (choiceId: string) => void;
  onContinue: () => void;
};

export function QuestionCard({
  question,
  selectedChoiceId,
  revealed,
  isFinalStage,
  onChoice,
  onContinue,
}: QuestionCardProps) {
  const selectedIsCorrect =
    selectedChoiceId !== null && selectedChoiceId === question.correctChoiceId;

  return (
    <article className="gfaGameQuestion">
      <h2>{question.prompt}</h2>
      <p className="gfaGameChoiceHint">เลือกคำตอบ</p>
      <div className="gfaGameChoices">
        {question.choices.map((choice, index) => {
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

          const letter = String.fromCharCode(65 + index);

          return (
            <div key={choice.id} className={`gfaGameChoice gfaGameChoice-${state}`}>
              <span className="gfaGameChoiceLetter" aria-hidden="true">
                {letter}
              </span>
              <ChoiceButton
                label={choice.text}
                onClick={() => onChoice(choice.id)}
                disabled={revealed}
                state={state}
              />
              {state === "correct" ? (
                <span className="gfaGameChoiceNote">⭐ คำตอบที่ถูก</span>
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
          className={`gfaGameFeedbackPanel ${
            selectedIsCorrect
              ? "gfaGameFeedbackPanel-correct"
              : "gfaGameFeedbackPanel-missed"
          }`}
          role="status"
        >
          {selectedIsCorrect ? (
            <>
              <p className="gfaGameFeedbackTitle">⭐ เยี่ยมมาก!</p>
              <p className="gfaGameFeedbackHint">ผ่านด่านนี้แล้ว</p>
            </>
          ) : (
            <>
              <p className="gfaGameFeedbackTitle">💡 เกือบแล้ว!</p>
              <p className="gfaGameFeedbackHint">มาดูเหตุผลข้อนี้กัน</p>
            </>
          )}
          <div className="gfaGameExplanation">{question.explanation}</div>
          <div className="gfaGameContinue">
            <button type="button" className="button primary" onClick={onContinue}>
              {isFinalStage ? "ดูผลเกม" : "ไปด่านต่อไป →"}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
