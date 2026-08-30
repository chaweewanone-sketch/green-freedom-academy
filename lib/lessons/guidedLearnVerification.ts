import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ACTIVITY_DEFAULTS } from "@/lib/assessment";
import { getActivityPath } from "@/lib/routes";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import { pastSimpleLesson } from "@/lib/lessons/past-simple";
import {
  GUIDED_LEARN_COMPLETE_LABEL,
  GUIDED_LEARN_NEXT_LABEL,
  GUIDED_LEARN_PREVIOUS_LABEL,
  buildGuidedLearnFooterState,
  shouldPersistLearnCompletion,
} from "@/lib/lessons/guidedLearnFooter";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function verifyGuidedFooterStartsAtSectionOne(): void {
  const state = buildGuidedLearnFooterState(0, 8);
  assert(state.currentStep === 0, "1: section 1");
  assert(state.showPrevious === false, "1: no Previous");
  assert(state.primaryKind === "next", "1: primary is Next");
  assert(state.primaryLabel === GUIDED_LEARN_NEXT_LABEL, "1: ต่อไป");
  assert(!shouldPersistLearnCompletion(0, 8), "1: no Learn persist");
}

export function verifyGuidedFooterMiddleSections(): void {
  for (const step of [1, 2, 3, 4, 5, 6]) {
    const state = buildGuidedLearnFooterState(step, 8);
    assert(state.showPrevious === true, `${step + 1}: Previous exists`);
    assert(
      state.previousLabel === GUIDED_LEARN_PREVIOUS_LABEL,
      `${step + 1}: ย้อนกลับ`,
    );
    assert(state.primaryKind === "next", `${step + 1}: primary is Next`);
    assert(
      state.primaryLabel === GUIDED_LEARN_NEXT_LABEL,
      `${step + 1}: ต่อไป`,
    );
    assert(
      !shouldPersistLearnCompletion(step, 8),
      `${step + 1}: no Learn persist`,
    );
  }
}

export function verifyGuidedFooterFinalSection(): void {
  const state = buildGuidedLearnFooterState(7, 8);
  assert(state.isLast === true, "8: last section");
  assert(state.showPrevious === true, "8: Previous exists");
  assert(state.primaryKind === "complete", "8: primary completes Learn");
  assert(
    state.primaryLabel === GUIDED_LEARN_COMPLETE_LABEL,
    "8: เข้าใจแล้ว ✓ ไปฝึก Quiz",
  );
  assert(shouldPersistLearnCompletion(7, 8), "8: persist Learn");
  assert(
    getActivityPath("present-simple", "quiz") ===
      "/lesson/present-simple/activity/quiz",
    "8: Quiz destination",
  );
}

export function verifyStudentGuidedChromeIsHidden(): void {
  const companion = readFileSync(
    resolve(process.cwd(), "components/classroom-companion/ClassroomCompanion.tsx"),
    "utf8",
  );
  assert(companion.includes("isStudentLearn"), "ui: student/teacher split");
  assert(
    companion.includes("showClassroomControls={!isStudentLearn}"),
    "ui: teacher chrome gated",
  );
  assert(
    !companion.includes("<LessonEntryView"),
    "ui: student Learn does not mount LessonEntryView",
  );
  assert(
    companion.includes("showActivityGrid={!isStudentLearn}"),
    "ui: ActivityGrid gated",
  );
  assert(
    companion.includes('getActivityPath(lesson.slug, "quiz")'),
    "ui: final action uses Quiz path helper",
  );
  assert(
    companion.includes("shouldPersistLearnCompletion"),
    "ui: persist only via helper",
  );
  assert(companion.includes("useState(0)"), "ui: new session opens at section 1");
  assert(
    !companion.includes("setCurrentStep(steps.length"),
    "ui: existing Learn does not jump to last section",
  );

  const footer = readFileSync(
    resolve(process.cwd(), "components/classroom-companion/LessonFooter.tsx"),
    "utf8",
  );
  assert(footer.includes("buildGuidedLearnFooterState"), "ui: footer uses helper");
  assert(footer.includes("GUIDED_LEARN_NEXT_LABEL"), "ui: ต่อไป label");
  assert(footer.includes("GUIDED_LEARN_COMPLETE_LABEL"), "ui: final Quiz label");
  assert(
    footer.includes('state.primaryKind === "complete" ? onMarkComplete : onNext'),
    "ui: guided primary uses helper kind",
  );

  const header = readFileSync(
    resolve(process.cwd(), "components/classroom-companion/LessonHeader.tsx"),
    "utf8",
  );
  assert(header.includes("showClassroomControls"), "ui: header can hide modes");

  const teaching = readFileSync(
    resolve(process.cwd(), "components/classroom-companion/TeachingPanel.tsx"),
    "utf8",
  );
  assert(teaching.includes("showActivityGrid"), "ui: grid optional");
  assert(teaching.includes("showTeacherTip"), "ui: teacher tip optional");
  assert(teaching.includes("ActivityGrid"), "ui: ActivityGrid remains for teacher");
}

export function verifyTeacherClassroomChromePreserved(): void {
  const companion = readFileSync(
    resolve(process.cwd(), "components/classroom-companion/ClassroomCompanion.tsx"),
    "utf8",
  );
  assert(companion.includes("LessonTimer"), "teacher: timer still imported");
  assert(companion.includes("PlanningPanel"), "teacher: planning still imported");
  assert(companion.includes("useLessonTimer"), "teacher: timer hook remains");

  const header = readFileSync(
    resolve(process.cwd(), "components/classroom-companion/LessonHeader.tsx"),
    "utf8",
  );
  assert(header.includes("โหมดสอน"), "teacher: mode tabs remain");
  assert(header.includes("โหมดวางแผน"), "teacher: planning tab remains");
}

export function verifyCurriculumAndQuizDefaultsHold(): void {
  assert(presentSimpleLesson.steps.length === 8, "curriculum: 8 sections");
  assert(pastSimpleLesson.steps.length === 4, "curriculum: Past unchanged");
  assert(
    pastSimpleLesson.steps[0]?.examples[0] === "I visited my grandma yesterday.",
    "curriculum: Past first example",
  );
  assert(ACTIVITY_DEFAULTS.quiz.questionCount === 10, "quiz: length 10");
  assert(
    ACTIVITY_DEFAULTS.millionaire.questionCount === 10,
    "millionaire: length 10",
  );

  const section7 = presentSimpleLesson.steps[6]?.description ?? "";
  assert(section7.includes("A. คำบอกความถี่"), "section 7: frequency group");
  assert(section7.includes("B. How often"), "section 7: How often group");
  assert(section7.includes("C. การบอกเวลา"), "section 7: time group");
  assert(
    getActivityPath("present-simple", "quiz") ===
      "/lesson/present-simple/activity/quiz",
    "routes: Quiz remains directly reachable",
  );
  assert(
    getActivityPath("present-simple", "millionaire") ===
      "/lesson/present-simple/activity/millionaire",
    "routes: Millionaire remains directly reachable",
  );
}

export function runGuidedLearnVerification(): void {
  verifyGuidedFooterStartsAtSectionOne();
  verifyGuidedFooterMiddleSections();
  verifyGuidedFooterFinalSection();
  verifyStudentGuidedChromeIsHidden();
  verifyTeacherClassroomChromePreserved();
  verifyCurriculumAndQuizDefaultsHold();
}
