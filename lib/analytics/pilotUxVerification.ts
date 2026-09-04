import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ACTIVITY_DEFAULTS } from "@/lib/assessment";
import { buildCurriculumProgress } from "@/lib/analytics/curriculumProgress";
import { buildLearningJourney } from "@/lib/analytics/journey";
import { buildLearningRecommendation } from "@/lib/analytics/recommendation";
import { buildResumeLearning } from "@/lib/analytics/resumeLearning";
import { buildStudentLearningHome } from "@/lib/analytics/studentHome";
import { resolveActiveLesson } from "@/lib/analytics/activeLesson";
import {
  LEARNER_LAUNCHABLE_LESSON_SLUGS,
  isLearnerLaunchableHref,
  isLearnerLaunchableLesson,
  learnerSafeNavigation,
} from "@/lib/analytics/learnerLessonLaunch";
import { evaluateLessonJourney, JOURNEY_PROGRESS } from "@/lib/analytics/lessonProgress";
import { buildLearningSummaryForLesson } from "@/lib/analytics/summary";
import {
  PILOT_COMPLETE_EYEBROW,
  PILOT_COMPLETE_MESSAGE,
  PILOT_COMPLETE_TITLE,
  PILOT_UNAVAILABLE_AVAILABILITY_LABEL,
  PILOT_UNAVAILABLE_STATUS_LABEL,
  isPilotPresentCompleteResume,
  presentActiveLessonCopy,
  presentCurriculumLesson,
  presentCurriculumProgress,
  presentHomeOverallProgressPercent,
  presentJourneyProgressPercent,
  shouldHideSamePageDashboardAction,
} from "@/lib/analytics/pilotLearnerPresentation";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import { getQuestionBank } from "@/lib/question-bank";
import { GAME_STAGE_COUNT } from "@/lib/millionaire/stageLadder";
import { PRESENT_SIMPLE_WORLD_TITLES } from "@/lib/student-ui/presentSimpleWorldTitles";
import { getDashboardPath, getLessonPath } from "@/lib/routes";
import { buildLearningSummary } from "@/lib/analytics/summary";
import type {
  AggregatableLearningEvent,
  LearningSummary,
} from "@/types/analytics";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function emptySummary(): LearningSummary {
  return {
    totalActivities: 0,
    quizAttempts: 0,
    millionaireAttempts: 0,
    flashCardAttempts: 0,
    averageQuizScore: 0,
    averageMillionaireScore: 0,
    flashEasy: 0,
    flashMedium: 0,
    flashHard: 0,
  };
}

function makeEvent(
  overrides: Partial<AggregatableLearningEvent> &
    Pick<AggregatableLearningEvent, "activity" | "lessonSlug">,
): AggregatableLearningEvent {
  return {
    sessionId: overrides.sessionId ?? "session",
    completedAt: overrides.completedAt ?? 1,
    activity: overrides.activity,
    lessonSlug: overrides.lessonSlug,
    scorePercentage: overrides.scorePercentage,
    lessonContentVersion: overrides.lessonContentVersion,
  };
}

function presentCompleteEvents(): AggregatableLearningEvent[] {
  return [
    makeEvent({
      activity: "learn",
      lessonSlug: "present-simple",
      lessonContentVersion: 2,
      completedAt: 1,
    }),
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 2,
    }),
    makeEvent({
      activity: "millionaire",
      lessonSlug: "present-simple",
      scorePercentage: 90,
      completedAt: 3,
    }),
  ];
}

export function verifyFirstVisitAndResumeFreeze(): void {
  const home = read("components/student/StudentLearningHome.tsx");
  const resumeCard = read("components/dashboard/ResumeLearningCard.tsx");
  const empty = buildStudentLearningHome(emptySummary(), []);
  const returningHistory = [
    makeEvent({
      activity: "quiz",
      lessonSlug: "present-simple",
      scorePercentage: 50,
    }),
  ];
  const returning = buildStudentLearningHome(
    buildLearningSummary(returningHistory),
    returningHistory,
  );

  assert(home.includes("เริ่มต้นการเรียนรู้ของคุณ"), "A: empty hero");
  assert(resumeCard.includes("START LEARNING"), "A: start eyebrow");
  assert(empty.resumeLearning.title === "เริ่มการเรียนรู้", "A: start title");
  assert(
    empty.resumeLearning.description === "เริ่มต้นบทเรียนแรกของคุณ",
    "A: start description",
  );
  assert(empty.resumeLearning.action.label === "เริ่มเรียน", "A: start CTA");
  assert(
    empty.resumeLearning.action.href === getLessonPath("present-simple"),
    "A: start href",
  );

  assert(home.includes("เรียนต่อจากจุดที่ค้างไว้"), "B: returning hero");
  assert(resumeCard.includes("RESUME LEARNING"), "B: resume eyebrow");
  assert(returning.hasHistory, "B: returning hasHistory");
  assert(
    returning.resumeLearning.action.href.includes("present-simple"),
    "B: returning stays on Present Simple",
  );
  assert(
    !isPilotPresentCompleteResume(returning.resumeLearning),
    "B: in-progress is not LEARNING COMPLETE",
  );
  assert(
    !isPilotPresentCompleteResume(empty.resumeLearning),
    "A: empty is not LEARNING COMPLETE",
  );
}

export function verifyPresentCompleteAndNoPastCta(): void {
  const complete = presentCompleteEvents();
  const home = buildStudentLearningHome(emptySummary(), complete);
  const journey = buildLearningJourney(emptySummary(), complete);
  const recommendation = buildLearningRecommendation(emptySummary(), complete);
  const resume = buildResumeLearning(emptySummary(), complete);
  const active = resolveActiveLesson(complete);

  assert(home.activeLesson?.lessonSlug === "past-simple", "C: model still Past");
  assert(active.lessonSlug === "past-simple", "C: engine active Past");
  assert(
    home.resumeLearning.action.href === getDashboardPath(),
    "C: complete resume dashboard",
  );
  assert(
    home.resumeLearning.action.href !== getLessonPath("past-simple"),
    "D: home resume not Past CTA",
  );
  assert(
    learnerSafeNavigation(journey.nextAction.href, journey.nextAction.label)
      .href !== getLessonPath("past-simple"),
    "D: journey not Past CTA",
  );
  assert(
    learnerSafeNavigation(recommendation.href, recommendation.ctaLabel)
      .href !== getLessonPath("past-simple"),
    "D: recommendation not Past CTA",
  );
  assert(
    resume.action.href !== getLessonPath("past-simple"),
    "D: resume not Past CTA",
  );
  assert(isPilotPresentCompleteResume(resume), "C: complete presentation flag");
  assert(isPilotPresentCompleteResume(home.resumeLearning), "C: home complete");
  assert(resume.action.label === "ดูผลการเรียน", "I: complete CTA label");
  assert(resume.action.href === getDashboardPath(), "I: complete CTA href");
}

export function verifyPastSimplePilotPresentation(): void {
  const complete = presentCompleteEvents();
  const curriculum = buildCurriculumProgress(complete);
  const journey = buildLearningJourney(emptySummary(), complete);
  const home = buildStudentLearningHome(emptySummary(), complete);
  const pastEngine = curriculum.lessons[1];

  assert(pastEngine?.lessonSlug === "past-simple", "H: engine Past row");
  assert(pastEngine?.status === "ACTIVE", "H: engine ACTIVE");
  assert(pastEngine?.stage === "LEARN", "H: engine LEARN");
  assert(
    pastEngine?.progressPercent === JOURNEY_PROGRESS.learn,
    "H: engine 20",
  );
  assert(journey.lessonSlug === "past-simple", "H: journey Past");
  assert(journey.stage === "LEARN", "H: journey LEARN");
  assert(journey.progressPercent === 20, "H: journey 20");
  const pastEngineJourney = evaluateLessonJourney(
    buildLearningSummaryForLesson(complete, "past-simple"),
    "past-simple",
    complete,
  );
  assert(pastEngineJourney.progressPercent === 20, "H: raw evaluator 20");
  assert(
    pastEngineJourney.message.includes("ขั้นเรียน"),
    "H: raw evaluator still says ขั้นเรียน",
  );

  const presentedPast = presentCurriculumLesson(pastEngine);
  const presentedCurriculum = presentCurriculumProgress(curriculum);
  const pastLine = [
    presentedPast.displayStatusLabel,
    presentedPast.displayAvailabilityLabel,
    `${presentedPast.displayPercent}%`,
  ].join(" · ");
  const journeyPercent = presentJourneyProgressPercent(journey);
  const activeCopy = presentActiveLessonCopy(home.activeLesson!);
  const homeOverall = presentHomeOverallProgressPercent({
    activeLessonSlug: home.activeLesson?.lessonSlug,
    completedLessons: home.curriculumProgress.completedLessons,
    totalLessons: home.curriculumProgress.totalLessons,
    engineOverallPercent: home.curriculumProgress.overallProgressPercent,
  });

  assert(presentedPast.displayPercent === 0, "E: pilot Past 0%");
  assert(
    presentedPast.displayStatusLabel === PILOT_UNAVAILABLE_STATUS_LABEL,
    "E: บทเรียนถัดไป",
  );
  assert(
    presentedPast.displayAvailabilityLabel ===
      PILOT_UNAVAILABLE_AVAILABILITY_LABEL,
    "E: ยังไม่เปิดให้เรียน",
  );
  assert(pastLine === "บทเรียนถัดไป · ยังไม่เปิดให้เรียน · 0%", "E: past line");
  assert(!pastLine.includes("กำลังเรียน"), "F: not กำลังเรียน");
  assert(!pastLine.includes("ขั้นเรียน"), "G: not ขั้นเรียน");
  assert(!pastLine.includes("20%"), "E: not 20%");
  assert(journeyPercent === 0, "E: journey display 0%");
  assert(activeCopy.heading === "บทเรียนถัดไป", "E: home heading");
  assert(
    activeCopy.availabilityLabel === "ยังไม่เปิดให้เรียน",
    "E: home availability",
  );
  assert(!activeCopy.availabilityLabel.includes("ขั้นเรียน"), "G: home not ขั้นเรียน");
  assert(!activeCopy.heading.includes("กำลังเรียน"), "F: home not กำลังเรียน");
  assert(homeOverall === 50, "E: home overall excludes synthetic 20");
  assert(
    home.curriculumProgress.overallProgressPercent === 60,
    "H: engine overall still 60",
  );
  assert(
    presentedCurriculum.displayOverallPercent === 50,
    "E: curriculum display overall 50",
  );
  assert(!presentedCurriculum.showActiveAsCurrent, "F: no กำลังเรียน banner");
  assert(!isLearnerLaunchableLesson("past-simple"), "P: Past not launchable");
  assert(!isLearnerLaunchableHref(getLessonPath("past-simple")), "P: Past href guarded");
}

export function verifyPastSimpleActiveExposureZero(): void {
  const complete = presentCompleteEvents();
  const curriculum = buildCurriculumProgress(complete);
  const journey = buildLearningJourney(emptySummary(), complete);
  const home = buildStudentLearningHome(emptySummary(), complete);
  const presentedPast = presentCurriculumLesson(curriculum.lessons[1]!);
  const activeCopy = presentActiveLessonCopy(home.activeLesson!);
  const surfaces = [
    presentedPast.displayStatusLabel,
    presentedPast.displayAvailabilityLabel ?? "",
    `${presentedPast.displayPercent}%`,
    activeCopy.heading,
    activeCopy.availabilityLabel,
    `${presentJourneyProgressPercent(journey)}%`,
  ].join(" | ");

  assert(!surfaces.includes("กำลังเรียน"), "exposure: no กำลังเรียน");
  assert(!surfaces.includes("ขั้นเรียน"), "exposure: no ขั้นเรียน");
  assert(!surfaces.includes("20%"), "exposure: no 20%");
  assert(!surfaces.includes(getLessonPath("past-simple")), "exposure: no Past CTA");
  assert(
    LEARNER_LAUNCHABLE_LESSON_SLUGS.join(",") === "present-simple",
    "P: 54D set unchanged",
  );
}

export function verifyDashboardSamePageCtas(): void {
  const dashboard = read("components/dashboard/StudentDashboard.tsx");
  const studentHome = read("components/student/StudentLearningHome.tsx");
  const resumeCard = read("components/dashboard/ResumeLearningCard.tsx");
  const brand = read("components/BrandHeader.tsx");
  const complete = presentCompleteEvents();
  const resume = buildResumeLearning(emptySummary(), complete);
  const journey = buildLearningJourney(emptySummary(), complete);
  const recommendation = buildLearningRecommendation(emptySummary(), complete);
  const journeyHref = learnerSafeNavigation(
    journey.nextAction.href,
    journey.nextAction.label,
  ).href;
  const recommendationHref = learnerSafeNavigation(
    recommendation.href,
    recommendation.ctaLabel,
  ).href;

  assert(dashboard.includes("suppressSamePageAction"), "J: dashboard opts in");
  assert(
    !studentHome.includes("suppressSamePageAction"),
    "I: student home does not suppress",
  );
  assert(
    resumeCard.includes("shouldHideSamePageDashboardAction"),
    "J: hide uses href not button text",
  );
  assert(
    shouldHideSamePageDashboardAction(true, getDashboardPath()),
    "J: dashboard complete hides",
  );
  assert(
    !shouldHideSamePageDashboardAction(false, getDashboardPath()),
    "I: student home still shows dashboard CTA",
  );
  assert(
    !shouldHideSamePageDashboardAction(true, getLessonPath("present-simple")),
    "J: empty/start CTA remains",
  );
  assert(resume.action.href === getDashboardPath(), "I: complete resume dashboard");
  assert(journeyHref === getDashboardPath(), "J: complete journey dashboard href");
  assert(
    recommendationHref === getDashboardPath(),
    "J: complete recommendation dashboard href",
  );
  assert(brand.includes("ผลการเรียน"), "I: BrandHeader results link kept");
  assert(brand.includes("getDashboardPath()"), "I: BrandHeader dashboard href");
}

export function verifyPresentCompleteResumeCopy(): void {
  const resumeCard = read("components/dashboard/ResumeLearningCard.tsx");
  const presentation = read("lib/analytics/pilotLearnerPresentation.ts");
  const complete = presentCompleteEvents();
  const resume = buildResumeLearning(emptySummary(), complete);

  assert(isPilotPresentCompleteResume(resume), "C: PRESENT COMPLETE flag");
  assert(
    presentation.includes(`PILOT_COMPLETE_EYEBROW = "${PILOT_COMPLETE_EYEBROW}"`),
    "C: LEARNING COMPLETE",
  );
  assert(resumeCard.includes("PILOT_COMPLETE_EYEBROW"), "C: card uses complete eyebrow");
  assert(resumeCard.includes("PILOT_COMPLETE_TITLE"), "D: complete title");
  assert(
    PILOT_COMPLETE_TITLE.includes("เรียน Present Simple ครบแล้ว"),
    "D: title keeps Present Simple complete copy",
  );
  assert(presentation.includes(PILOT_COMPLETE_MESSAGE), "E: complete message");
  assert(resumeCard.includes("PILOT_COMPLETE_MESSAGE"), "E: card uses complete message");
  assert(
    resumeCard.includes(`${PILOT_UNAVAILABLE_STATUS_LABEL}:`) ||
      resumeCard.includes("PILOT_UNAVAILABLE_STATUS_LABEL"),
    "F: next lesson label",
  );
  assert(
    resumeCard.includes("PILOT_UNAVAILABLE_AVAILABILITY_LABEL"),
    "G: unavailable",
  );
  assert(
    !resumeCard.includes("ดูผลการเรียนได้จากแดชบอร์ด"),
    "H: redundant dashboard sentence removed from card",
  );
  assert(
    resumeCard.includes("isPilotPresentCompleteResume"),
    "C: complete copy is gated",
  );
  assert(resumeCard.includes("RESUME LEARNING"), "B: in-progress eyebrow kept");
  assert(resumeCard.includes("START LEARNING"), "A: empty eyebrow kept");
  assert(resume.action.label === "ดูผลการเรียน", "I: CTA");
  assert(resume.action.href === getDashboardPath(), "I: /dashboard");
  assert(
    resume.action.href !== getLessonPath("past-simple"),
    "J: no Past Simple CTA",
  );
  assert(resume.action.lessonTitle === "Past Simple", "F: next lesson title");
}

export function verifyWorldTitlesAndCopy(): void {
  const titles = [...PRESENT_SIMPLE_WORLD_TITLES];
  assert(
    titles.join("|") ===
      "Garden Gate|Playground|One-Helper Workshop|Quiet Shelter|Question Booth|Clue Trail|Clock Garden|Clubhouse Map",
    "2: frozen English world titles",
  );

  const workshop = read(
    "components/student-ui/EverydayGardenWorkshopSection3.tsx",
  );
  const trail = read(
    "components/student-ui/EverydayGardenClueTrailSection6.tsx",
  );
  const clock = read(
    "components/student-ui/EverydayGardenClockGardenSection7.tsx",
  );
  const quiz = read("components/quiz/QuizGame.tsx");
  const lesson = read("lib/lessons/present-simple.ts");
  const sectionFiles = [
    "components/student-ui/EverydayGardenSection1.tsx",
    "components/student-ui/EverydayGardenPlaygroundSection2.tsx",
    "components/student-ui/EverydayGardenWorkshopSection3.tsx",
    "components/student-ui/EverydayGardenQuietShelterSection4.tsx",
    "components/student-ui/EverydayGardenQuestionBoothSection5.tsx",
    "components/student-ui/EverydayGardenClueTrailSection6.tsx",
    "components/student-ui/EverydayGardenClockGardenSection7.tsx",
    "components/student-ui/EverydayGardenClubhouseMapSection8.tsx",
  ].map(read);

  assert(workshop.includes("กริยาเติม"), "3: workshop เติม wording");
  assert(!workshop.includes("กริยาเปลี่ยน"), "3: workshop no เปลี่ยน phrase");
  assert(clock.includes("FREQUENCY_AIDS"), "4: clock frequency aids");
  assert(clock.includes("≈ 80–90%"), "4: usually aid");
  assert(!quiz.includes("gfaQuizCoin"), "5: quiz coin markup removed");
  assert(lesson.includes("contentVersion: 2"), "L: contentVersion unchanged");
  assert(presentSimpleLesson.contentVersion === 2, "L: runtime version 2");
  assert(
    trail.includes("PRESENT_SIMPLE_WORLD_TITLES[4]"),
    "L: Question Booth label",
  );
  assert(
    trail.includes("PRESENT_SIMPLE_WORLD_TITLES[5]"),
    "L: Clue Trail label",
  );
  assert(!trail.includes("ที่บูธถาม:"), "M: no Thai booth navigation label");
  assert(!trail.includes("ทางล่าคำใบ้:"), "M: no Thai trail navigation label");
  assert(
    !clock.includes("ทางล่าคำใบ้มี"),
    "M: clock bridge uses English world name",
  );
  sectionFiles.forEach((source, index) => {
    assert(
      source.includes("GfaWorldLeadTitles"),
      `L: section ${index + 1} uses shared world titles`,
    );
    assert(
      source.includes(`PRESENT_SIMPLE_WORLD_TITLES[${index}]`),
      `L: section ${index + 1} uses canonical world name`,
    );
  });
}

export function verifyAssessmentFreeze(): void {
  const bank = getQuestionBank("present-simple");
  const quiz = read("components/quiz/QuizGame.tsx");

  assert(bank?.questions.length === 50, "M: quiz bank 50");
  assert(ACTIVITY_DEFAULTS.quiz.questionCount === 10, "N: quiz attempt 10");
  assert(ACTIVITY_DEFAULTS.quiz.randomize === true, "K: quiz still randomized");
  assert(
    ACTIVITY_DEFAULTS.millionaire.questionCount === 10,
    "O: millionaire 10",
  );
  assert(GAME_STAGE_COUNT === 10, "O: millionaire stages 10");
  assert(quiz.includes("correctCount"), "K: quiz scoring counters remain");
  assert(!quiz.includes("gfaQuizCoin"), "K: coin removal only");
}

export function runPilotUxVerification(): void {
  verifyFirstVisitAndResumeFreeze();
  verifyPresentCompleteAndNoPastCta();
  verifyPastSimplePilotPresentation();
  verifyPastSimpleActiveExposureZero();
  verifyDashboardSamePageCtas();
  verifyPresentCompleteResumeCopy();
  verifyWorldTitlesAndCopy();
  verifyAssessmentFreeze();
}
