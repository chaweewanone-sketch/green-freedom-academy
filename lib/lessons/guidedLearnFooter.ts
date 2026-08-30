export const GUIDED_LEARN_PREVIOUS_LABEL = "← ย้อนกลับ";
export const GUIDED_LEARN_NEXT_LABEL = "ต่อไป →";
export const GUIDED_LEARN_COMPLETE_LABEL = "เข้าใจแล้ว ✓ ไปฝึก Quiz";

export type GuidedLearnPrimaryKind = "next" | "complete";

export type GuidedLearnFooterState = {
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  showPrevious: boolean;
  previousLabel: string;
  primaryLabel: string;
  primaryKind: GuidedLearnPrimaryKind;
};

export function shouldPersistLearnCompletion(
  currentStep: number,
  totalSteps: number,
): boolean {
  return totalSteps > 0 && currentStep === totalSteps - 1;
}

export function buildGuidedLearnFooterState(
  currentStep: number,
  totalSteps: number,
): GuidedLearnFooterState {
  const safeTotal = Math.max(0, totalSteps);
  const safeCurrent = Math.min(Math.max(0, currentStep), Math.max(0, safeTotal - 1));
  const isFirst = safeCurrent === 0;
  const isLast = safeTotal > 0 && safeCurrent === safeTotal - 1;

  return {
    currentStep: safeCurrent,
    totalSteps: safeTotal,
    isFirst,
    isLast,
    showPrevious: !isFirst,
    previousLabel: GUIDED_LEARN_PREVIOUS_LABEL,
    primaryLabel: isLast ? GUIDED_LEARN_COMPLETE_LABEL : GUIDED_LEARN_NEXT_LABEL,
    primaryKind: isLast ? "complete" : "next",
  };
}
