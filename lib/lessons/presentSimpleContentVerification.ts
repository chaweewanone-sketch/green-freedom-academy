import { ACTIVITY_DEFAULTS } from "@/lib/assessment";
import { getQuestionBank } from "@/lib/question-bank";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import { pastSimpleLesson } from "@/lib/lessons/past-simple";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const APPROVED_TITLES = [
  "Present Simple คืออะไร",
  "ประโยคบอกเล่า I / You / We / They",
  "ประโยคบอกเล่า He / She / It และ -s / -es",
  "ประโยคปฏิเสธ don't / doesn't",
  "คำถาม Yes/No และคำตอบสั้น",
  "คำถาม Wh-",
  "ความถี่และเวลา",
  "สรุปโครงสร้าง Present Simple",
] as const;

const OLD_REUSED_PAIR = [
  "I go to school every day.",
  "She reads every night.",
];

type BankFamily =
  | "usage"
  | "affirmativePlural"
  | "thirdPerson"
  | "negative"
  | "yesNoShort"
  | "whQuestion"
  | "frequencyTime";

function stepText(index: number): string {
  const step = presentSimpleLesson.steps[index];
  return [
    step?.title ?? "",
    step?.description ?? "",
    step?.formula ?? "",
    ...(step?.examples ?? []),
  ].join("\n");
}

function classifyBankGrammarPoint(grammarPoint: string): BankFamily | null {
  const point = grammarPoint.toLowerCase();

  if (point.includes("daily routines") || point.includes("general truths")) {
    return "usage";
  }

  if (
    point.includes("yes/no") ||
    point.includes("short answers")
  ) {
    return "yesNoShort";
  }

  if (point.includes("wh-questions")) {
    return "whQuestion";
  }

  if (
    point.includes("adverbs of frequency") ||
    point.startsWith("frequency") ||
    point.includes("time expressions")
  ) {
    return "frequencyTime";
  }

  if (point.includes("negative") || point.includes("contractions")) {
    return "negative";
  }

  if (
    point.includes("third person") ||
    point.includes("spelling —")
  ) {
    return "thirdPerson";
  }

  if (
    point.includes("affirmative") ||
    point.includes("present simple — you") ||
    point.includes("plural subject")
  ) {
    return "affirmativePlural";
  }

  return null;
}

export function verifyPresentSimpleHasApprovedSections(): void {
  assert(presentSimpleLesson.steps.length === 8, "1: exactly 8 sections");
  APPROVED_TITLES.forEach((title, index) => {
    assert(
      presentSimpleLesson.steps[index]?.title === title,
      `1: section ${index + 1} title`,
    );
  });
}

export function verifyTeachingCardsHaveEnoughExamples(): void {
  presentSimpleLesson.steps.slice(0, 7).forEach((step, index) => {
    assert(
      step.examples.length >= 3,
      `2: teaching card ${index + 1} has >=3 examples`,
    );
  });
  assert(
    (presentSimpleLesson.steps[7]?.examples.length ?? 0) >= 4,
    "2: summary has one example per structure",
  );
}

export function verifyExamplesAreNotReusedOnEverySlide(): void {
  const serialized = presentSimpleLesson.steps.map((step) =>
    JSON.stringify(step.examples),
  );
  const unique = new Set(serialized);
  assert(
    unique.size === presentSimpleLesson.steps.length,
    "3: each slide has its own examples",
  );
  assert(
    !serialized.every((value) => value === JSON.stringify(OLD_REUSED_PAIR)),
    "3: old duplicated pair is gone",
  );
}

export function verifyUsageAndFactsAreTaught(): void {
  const text = stepText(0);
  assert(text.includes("Subject + Verb 1"), "4: usage formula");
  assert(
    presentSimpleLesson.steps[0]?.examples.some((example) =>
      /every day|every morning|after school/i.test(example),
    ),
    "4: routine example",
  );
  assert(
    presentSimpleLesson.steps[0]?.examples.some((example) =>
      /sun rises|rises in the east/i.test(example),
    ),
    "4: general-truth example",
  );
}

export function verifyPluralAffirmativeIsTaught(): void {
  const slide = presentSimpleLesson.steps[1];
  const joined = slide.examples.join("\n");
  assert(/\bI\b/.test(joined), "5: I example");
  assert(/\bYou\b/.test(joined), "5: You example");
  assert(/\b(We|They)\b/.test(joined), "5: We/They example");
  assert(
    slide.examples.every((example) => !/^(He|She|It)\b/.test(example)),
    "5: no He/She/It as primary examples",
  );
  assert(
    slide.description.includes("They play football") &&
      slide.description.includes("They plays football"),
    "5: common-error contrast",
  );
}

export function verifyThirdPersonAndSpellingAreTaught(): void {
  const slide = presentSimpleLesson.steps[2];
  const joined = [slide.description, ...slide.examples].join("\n");
  assert(/\bHe\b/.test(joined), "6: He");
  assert(/\bShe\b/.test(joined), "6: She");
  assert(/\b(It|cat|dad)\b/i.test(joined), "6: It or singular noun");
  assert(/\bwatches\b/.test(joined), "6: -es watches");
  assert(/\bfixes\b/.test(joined), "6: -es fixes");
  assert(/ch|sh|x/.test(slide.description), "6: -es ending rule");
}

export function verifyNegativesAreTaught(): void {
  const slide = presentSimpleLesson.steps[3];
  const joined = [slide.description, slide.formula, ...slide.examples].join("\n");
  assert(/\bdon't\b/i.test(joined), "7: don't");
  assert(/\bdoesn't\b/i.test(joined), "7: doesn't");
  assert(/\bdo not\b/i.test(joined), "7: do not");
  assert(/\bdoes not\b/i.test(joined), "7: does not");
  assert(
    slide.description.includes("doesn't walk") &&
      slide.description.includes("doesn't walks"),
    "7: doesn't + Verb 1 contrast",
  );
}

export function verifyYesNoAndShortAnswersAreTaught(): void {
  const slide = presentSimpleLesson.steps[4];
  const joined = [slide.description, slide.formula, ...slide.examples].join("\n");
  assert(/\bDo\b/.test(joined), "8: Do");
  assert(/\bDoes\b/.test(joined), "8: Does");
  assert(/Yes, I do\./.test(joined), "8: short yes");
  assert(/No, she doesn't\./.test(joined), "8: short no");
  assert(
    slide.description.includes("Does she walk") &&
      slide.description.includes("Does she walks"),
    "8: Does + Verb 1 contrast",
  );
}

export function verifyWhQuestionsAreTaught(): void {
  const text = stepText(5);
  ["What", "Where", "When", "Why", "Who", "How", "What time"].forEach((word) => {
    assert(text.includes(word), `9: Wh-word ${word}`);
  });
  assert(
    presentSimpleLesson.steps[5]?.formula.includes("Wh-word + do/does"),
    "9: Wh formula",
  );
}

export function verifyFrequencyAndTimeAreTaught(): void {
  const text = stepText(6);
  ["always", "usually", "often", "sometimes", "rarely", "never"].forEach(
    (adverb) => {
      assert(text.includes(adverb), `10: adverb ${adverb}`);
    },
  );
  assert(/How often/.test(text), "10: How often");
  assert(/every day/.test(text), "10: every day");
  assert(/once a week/.test(text), "10: once a week");
  assert(/twice a day/.test(text), "10: twice a day");
  assert(/\bat\b/.test(text) && /\bon\b/.test(text) && /\bin\b/.test(text), "10: at/on/in");
  assert(
    presentSimpleLesson.steps[6]?.description.includes("usually finish") &&
      presentSimpleLesson.steps[6]?.description.includes("finish usually"),
    "10: adverb position contrast",
  );
}

export function verifySummaryReviewsFourStructures(): void {
  const slide = presentSimpleLesson.steps[7];
  const text = [slide.formula, ...slide.examples].join("\n");
  assert(/don't\/doesn't|Verb-s\/es/.test(slide.formula), "11: summary map");
  assert(slide.examples.some((example) => /^[A-Z][a-z]+ [a-z]+/.test(example) && !example.includes("?")), "11: affirmative example");
  assert(slide.examples.some((example) => /don't|doesn't/.test(example)), "11: negative example");
  assert(slide.examples.some((example) => /^Do |^Does /.test(example)), "11: Yes/No example");
  assert(slide.examples.some((example) => /^(What|Where|When|Who|Why|How)\b/.test(example)), "11: Wh example");
  assert(text.includes("Do/Does") || slide.formula.includes("Do/Does"), "11: question map");
}

export function verifyQuestionBankPrimaryFamiliesAreTaught(): void {
  const bank = getQuestionBank("present-simple");
  assert(bank !== null, "12: Present Simple bank exists");
  assert(bank?.questions.length === 50, "12: bank still 50 items");

  const seen = new Set<BankFamily>();

  for (const question of bank?.questions ?? []) {
    const family = classifyBankGrammarPoint(question.grammarPoint);
    assert(
      family !== null,
      `12: unmapped grammarPoint "${question.grammarPoint}"`,
    );
    if (family) {
      seen.add(family);
    }
  }

  (
    [
      "usage",
      "affirmativePlural",
      "thirdPerson",
      "negative",
      "yesNoShort",
      "whQuestion",
      "frequencyTime",
    ] as const
  ).forEach((family) => {
    assert(seen.has(family), `12: bank still tests ${family}`);
  });
}

export function verifyQuizAndMillionaireDefaultsUnchanged(): void {
  assert(ACTIVITY_DEFAULTS.quiz.questionCount === 10, "13: Quiz length 10");
  assert(
    ACTIVITY_DEFAULTS.millionaire.questionCount === 10,
    "13: Millionaire length 10",
  );
  assert(ACTIVITY_DEFAULTS.quiz.randomize === true, "13: Quiz still randomized");
}

export function verifyPastSimpleUnchanged(): void {
  assert(pastSimpleLesson.steps.length === 4, "14: Past still 4 slides");
  assert(
    pastSimpleLesson.steps[0]?.examples[0] === "I visited my grandma yesterday.",
    "14: Past first example unchanged",
  );
  assert(
    pastSimpleLesson.steps[3]?.examples[1] === "Did you finish your homework?",
    "14: Past question example unchanged",
  );
}

export function runPresentSimpleContentVerification(): void {
  verifyPresentSimpleHasApprovedSections();
  verifyTeachingCardsHaveEnoughExamples();
  verifyExamplesAreNotReusedOnEverySlide();
  verifyUsageAndFactsAreTaught();
  verifyPluralAffirmativeIsTaught();
  verifyThirdPersonAndSpellingAreTaught();
  verifyNegativesAreTaught();
  verifyYesNoAndShortAnswersAreTaught();
  verifyWhQuestionsAreTaught();
  verifyFrequencyAndTimeAreTaught();
  verifySummaryReviewsFourStructures();
  verifyQuestionBankPrimaryFamiliesAreTaught();
  verifyQuizAndMillionaireDefaultsUnchanged();
  verifyPastSimpleUnchanged();
}
