import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MILLIONAIRE_ACTIVITY_DISPLAY_NAME } from "@/lib/activities";
import { LEARNER_LAUNCHABLE_LESSON_SLUGS } from "@/lib/analytics/learnerLessonLaunch";
import {
  PILOT_COMPLETE_EYEBROW,
  PILOT_COMPLETE_TITLE,
  PILOT_UNAVAILABLE_AVAILABILITY_LABEL,
  PILOT_UNAVAILABLE_STATUS_LABEL,
} from "@/lib/analytics/pilotLearnerPresentation";
import { ACTIVITY_DEFAULTS } from "@/lib/assessment";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import { buildGameResultPresentation } from "@/lib/millionaire/gameResultPresentation";
import { GAME_STAGE_COUNT } from "@/lib/millionaire/stageLadder";
import { getQuestionBank } from "@/lib/question-bank";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

export function runMillionaireNamingVerification(): void {
  const game = read("components/millionaire/MillionaireGame.tsx");
  const result = read("lib/millionaire/gameResultPresentation.ts");
  const activities = read("lib/activities/index.ts");
  const dashboard = read("components/dashboard/StudentDashboard.tsx");
  const home = read("components/student/StudentLearningHome.tsx");
  const card = read("components/activities/ActivityCard.tsx");
  const resumeCard = read("components/dashboard/ResumeLearningCard.tsx");
  const presentation = read("lib/analytics/pilotLearnerPresentation.ts");
  const launch = read("lib/analytics/learnerLessonLaunch.ts");
  const completion = read("lib/history/recordActivityCompletion.ts");
  const bank = getQuestionBank("present-simple");
  const resultKicker = buildGameResultPresentation(10, 10).kicker;

  assert(
    MILLIONAIRE_ACTIVITY_DISPLAY_NAME === "Millionaire Challenge",
    "A: canonical display name",
  );
  assert(
    activities.includes('id: "millionaire"'),
    "G: internal activity id unchanged",
  );
  assert(
    activities.includes("title: MILLIONAIRE_ACTIVITY_DISPLAY_NAME"),
    "D: activity card uses canonical name",
  );
  assert(card.includes("activity.title"), "D: activity card renders title");
  assert(game.includes("MILLIONAIRE_ACTIVITY_DISPLAY_NAME"), "A: intro/gameplay name");
  assert(game.includes("<h1>{MILLIONAIRE_ACTIVITY_DISPLAY_NAME}</h1>"), "D: intro h1");
  assert(
    game.includes('className="gfaGameTitle">{MILLIONAIRE_ACTIVITY_DISPLAY_NAME}'),
    "E: gameplay header name",
  );
  assert(!game.includes("เกมพิชิต 10 ด่าน"), "B: competing intro title gone");
  assert(!game.includes("<h1>เกมพิชิต"), "B: no พิชิต 10 heading");
  assert(
    game.includes("พิชิต 10 ด่าน ทดสอบความรู้"),
    "C: supporting gameplay copy kept",
  );
  assert(game.includes(">พิชิต 10 ด่าน<"), "C: mission objective remains descriptive");
  assert(game.includes("เริ่มพิชิตด่าน"), "F: replay/start CTA remains");
  assert(
    result.includes("MILLIONAIRE_ACTIVITY_DISPLAY_NAME"),
    "E: result kicker uses canonical name",
  );
  assert(
    resultKicker === MILLIONAIRE_ACTIVITY_DISPLAY_NAME,
    "E: result kicker equals canonical name",
  );
  assert(!result.includes("เกมพิชิต 10 ด่าน"), "B: result has no competing name");
  assert(
    completion.includes("normalizeActivityResult"),
    "H: completion still records via existing mapper",
  );
  assert(dashboard.includes("MILLIONAIRE_ACTIVITY_DISPLAY_NAME"), "D: dashboard mapping");
  assert(home.includes("MILLIONAIRE_ACTIVITY_DISPLAY_NAME"), "D: student home mapping");
  assert(
    !dashboard.includes('millionaire: "Millionaire"'),
    "D: dashboard mapping is not short Millionaire",
  );
  assert(GAME_STAGE_COUNT === 10, "J: millionaire count 10");
  assert(ACTIVITY_DEFAULTS.millionaire.questionCount === 10, "J: attempt 10");
  assert(bank?.questions.length === 50, "K: quiz bank 50");
  assert(ACTIVITY_DEFAULTS.quiz.questionCount === 10, "L: quiz attempt 10");
  assert(presentSimpleLesson.contentVersion === 2, "M: contentVersion 2");
  assert(
    LEARNER_LAUNCHABLE_LESSON_SLUGS.join(",") === "present-simple",
    "N: 54D guard unchanged",
  );
  assert(launch.includes('["present-simple"]'), "N: launch set source");
  assert(resumeCard.includes("PILOT_COMPLETE_EYEBROW"), "O: 56C complete eyebrow");
  assert(
    presentation.includes(`PILOT_COMPLETE_EYEBROW = "${PILOT_COMPLETE_EYEBROW}"`),
    "O: LEARNING COMPLETE",
  );
  assert(
    PILOT_COMPLETE_TITLE.includes("เรียน Present Simple ครบแล้ว"),
    "O: complete title",
  );
  assert(
    resumeCard.includes("PILOT_UNAVAILABLE_STATUS_LABEL"),
    "O: บทเรียนถัดไป",
  );
  assert(PILOT_UNAVAILABLE_STATUS_LABEL === "บทเรียนถัดไป", "O: next lesson copy");
  assert(
    PILOT_UNAVAILABLE_AVAILABILITY_LABEL === "ยังไม่เปิดให้เรียน",
    "O: unavailable",
  );
}
