import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import { pastSimpleLesson } from "@/lib/lessons/past-simple";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const PLURAL_SUBJECT = /^(I|You|We|They)\b/;
const THIRD_PERSON_SUBJECT = /^(He|She|It)\b/;
const THIRD_PERSON_VERB = /\b(He|She|It)\s+[A-Za-z]+s\b/;
const NEGATIVE_MARKERS = /\b(don't|doesn't|do not|does not)\b/i;
const OLD_REUSED_PAIR = [
  "I go to school every day.",
  "She reads every night.",
];

export function verifyPresentSimpleHasFourSlides(): void {
  assert(presentSimpleLesson.steps.length === 4, "1: exactly 4 slides");
}

export function verifyEachSlideHasExamples(): void {
  presentSimpleLesson.steps.forEach((step, index) => {
    assert(step.examples.length > 0, `2: slide ${index + 1} has examples`);
  });
}

export function verifyExamplesAreNotReusedOnEverySlide(): void {
  const serialized = presentSimpleLesson.steps.map((step) =>
    JSON.stringify(step.examples),
  );
  const unique = new Set(serialized);
  assert(unique.size === presentSimpleLesson.steps.length, "3: each slide has its own examples");
  assert(
    !serialized.every((value) => value === JSON.stringify(OLD_REUSED_PAIR)),
    "3: old duplicated pair is gone",
  );
}

export function verifyBaseVerbSlide(): void {
  const slide = presentSimpleLesson.steps[1];
  assert(slide?.title.includes("I / You / We / They"), "4: slide 2 title");
  assert(
    slide.examples.every((example) => PLURAL_SUBJECT.test(example)),
    "4: examples use I/You/We/They",
  );
  assert(
    slide.examples.every((example) => !THIRD_PERSON_SUBJECT.test(example)),
    "4: no He/She/It as primary examples",
  );
}

export function verifyThirdPersonSlide(): void {
  const slide = presentSimpleLesson.steps[2];
  assert(slide?.title.includes("He / She / It"), "5: slide 3 title");
  assert(
    slide.examples.every((example) => THIRD_PERSON_SUBJECT.test(example)),
    "5: examples use He/She/It",
  );
  assert(
    slide.examples.some((example) => THIRD_PERSON_VERB.test(example)),
    "5: visible -s / -es",
  );
}

export function verifyNegativeSlide(): void {
  const slide = presentSimpleLesson.steps[3];
  assert(slide?.title === "ประโยคปฏิเสธ", "6: slide 4 stays negatives");
  assert(
    slide.examples.some((example) => NEGATIVE_MARKERS.test(example)),
    "6: don't / doesn't present",
  );
  const hasDoNot = slide.examples.some((example) =>
    /\b(don't|do not)\b/i.test(example),
  );
  const hasDoesNot = slide.examples.some((example) =>
    /\b(doesn't|does not)\b/i.test(example),
  );
  assert(hasDoNot, "6: I/You/We/They negative");
  assert(hasDoesNot, "6: He/She/It negative");
}

export function verifyPastSimpleUnchanged(): void {
  assert(pastSimpleLesson.steps.length === 4, "7: Past still 4 slides");
  assert(
    pastSimpleLesson.steps[0]?.examples[0] === "I visited my grandma yesterday.",
    "7: Past first example unchanged",
  );
  assert(
    pastSimpleLesson.steps[3]?.examples[1] === "Did you finish your homework?",
    "7: Past question example unchanged",
  );
}

export function runPresentSimpleContentVerification(): void {
  verifyPresentSimpleHasFourSlides();
  verifyEachSlideHasExamples();
  verifyExamplesAreNotReusedOnEverySlide();
  verifyBaseVerbSlide();
  verifyThirdPersonSlide();
  verifyNegativeSlide();
  verifyPastSimpleUnchanged();
}
