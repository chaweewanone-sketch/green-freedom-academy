import type { ReactNode } from "react";
import { GfaLearningWorld } from "./GfaLearningWorld";

export type StudentWorldIntensity = "learn" | "quiz";

type GfaStudentWorldProps = {
  intensity: StudentWorldIntensity;
  children: ReactNode;
};

export function GfaStudentWorld({ intensity, children }: GfaStudentWorldProps) {
  if (intensity === "learn") {
    return (
      <GfaLearningWorld plot="everyday-garden">{children}</GfaLearningWorld>
    );
  }

  return (
    <div className="gfaStudentWorld gfaStudentWorld-quiz">
      <div className="gfaStudentDecor" aria-hidden="true">
        <span className="gfaStudentDecorShape gfaStudentDecor-skyblob" />
        <span className="gfaStudentDecorShape gfaStudentDecor-star1" />
        <span className="gfaStudentDecorShape gfaStudentDecor-star2" />
      </div>
      <div className="gfaStudentWorldInner">{children}</div>
    </div>
  );
}
