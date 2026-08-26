import { runJourneyActionVerification, runJourneyVerification } from "@/lib/analytics/journeyVerification";
import { runRecommendationVerification } from "@/lib/analytics/recommendationVerification";
import { runCompletionVerification } from "./completionVerification";
import { runDashboardVerification } from "./dashboardVerification";
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
