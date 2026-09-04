import { runActiveLessonVerification } from "@/lib/analytics/activeLessonVerification";
import { runCurriculumProgressVerification } from "@/lib/analytics/curriculumProgressVerification";
import { runJourneyCurriculumVerification } from "@/lib/analytics/journeyCurriculumVerification";
import { runJourneyActionVerification, runJourneyVerification } from "@/lib/analytics/journeyVerification";
import { runRecommendationCurriculumVerification } from "@/lib/analytics/recommendationCurriculumVerification";
import { runResumeLearningVerification } from "@/lib/analytics/resumeLearningVerification";
import { runStudentHomeVerification } from "@/lib/analytics/studentHomeVerification";
import { runLessonEntryVerification } from "@/lib/analytics/lessonEntryVerification";
import { runQuizDistributionVerification } from "@/lib/question-bank/quizDistributionVerification";
import { runQuizPracticeLengthVerification } from "@/lib/question-bank/quizPracticeLengthVerification";
import { runRecommendationVerification } from "@/lib/analytics/recommendationVerification";
import { runCompletionVerification } from "./completionVerification";
import { runDashboardVerification } from "./dashboardVerification";
import { runFlowIntegrationVerification } from "./flowIntegrationVerification";
import { runStudentJourneyIntegrationVerification } from "./studentJourneyIntegrationVerification";
import { runLearnCompletionVerification } from "./learnCompletionVerification";
import { runPresentSimpleContentVerification } from "@/lib/lessons/presentSimpleContentVerification";
import { runGuidedLearnVerification } from "@/lib/lessons/guidedLearnVerification";
import { runLearnVersionVerification } from "@/lib/history/learnVersionVerification";
import { runResultNextActionVerification } from "@/lib/analytics/resultNextActionVerification";
import { runQuizAttemptResetVerification } from "@/lib/quiz/quizAttemptResetVerification";
import { runMillionaireAttemptResetVerification } from "@/lib/millionaire/millionaireAttemptResetVerification";
import { runStageLadderVerification } from "@/lib/millionaire/stageLadderVerification";
import { runMillionaireNamingVerification } from "@/lib/millionaire/millionaireNamingVerification";
import { runStudentVisualFoundationVerification } from "@/lib/student-ui/studentVisualFoundationVerification";
import { runLearnerLessonLaunchVerification } from "@/lib/analytics/learnerLessonLaunchVerification";
import { runPilotUxVerification } from "@/lib/analytics/pilotUxVerification";
import { runHistoryVerification } from "./verification";

runHistoryVerification();
console.log("history verification passed");

runCompletionVerification();
console.log("completion verification passed");

runDashboardVerification();
console.log("dashboard verification passed");

runRecommendationVerification();
console.log("recommendation verification passed");

runJourneyVerification();
console.log("journey verification passed");

runJourneyActionVerification();
console.log("journey action verification passed");

runJourneyCurriculumVerification();
console.log("journey curriculum verification passed");

runActiveLessonVerification();
console.log("active lesson verification passed");

runRecommendationCurriculumVerification();
console.log("recommendation curriculum verification passed");

runCurriculumProgressVerification();
console.log("curriculum progress verification passed");

runResumeLearningVerification();
console.log("resume learning verification passed");

runStudentHomeVerification();
console.log("student home verification passed");

runFlowIntegrationVerification();
console.log("flow integration verification passed");

runLessonEntryVerification();
console.log("lesson entry verification passed");

runQuizDistributionVerification();
console.log("quiz distribution verification passed");

runStudentJourneyIntegrationVerification();
console.log("student journey integration verification passed");

runLearnCompletionVerification();
console.log("learn completion verification passed");

runQuizPracticeLengthVerification();
console.log("quiz practice length verification passed");

runPresentSimpleContentVerification();
console.log("present simple content verification passed");

runGuidedLearnVerification();
console.log("guided learn verification passed");

runLearnVersionVerification();
console.log("learn version verification passed");

runResultNextActionVerification();
console.log("result next action verification passed");

runQuizAttemptResetVerification();
console.log("quiz attempt reset verification passed");

runMillionaireAttemptResetVerification();
console.log("millionaire attempt reset verification passed");

runStageLadderVerification();
console.log("stage ladder verification passed");

runMillionaireNamingVerification();
console.log("millionaire naming verification passed");

runStudentVisualFoundationVerification();
console.log("student visual foundation verification passed");

runLearnerLessonLaunchVerification();
console.log("learner lesson launch verification passed");

runPilotUxVerification();
console.log("pilot ux verification passed");
