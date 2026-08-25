import { runCompletionVerification } from "./completionVerification";
import { runHistoryVerification } from "./verification";

runHistoryVerification();
console.log("history verification passed");

runCompletionVerification();
console.log("completion verification passed");
