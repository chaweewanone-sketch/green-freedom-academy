import { getQuestionBank } from "@/lib/question-bank";
import { createBankQuestion, createBankQuestions } from "@/lib/question-bank/helpers";
import {
  buildAssessmentResult,
  createAssessmentSession,
} from "@/lib/assessment";
import { getLessonBySlug } from "@/lib/lessons";
import {
  MemoryLearningHistoryRepository,
  recordActivityCompletion,
} from "@/lib/history";
import type { Question } from "@/types/question";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export type ChoiceDistribution = {
  A: number;
  B: number;
  C: number;
  D: number;
};

export function countCorrectPositions(
  questions: Question[],
): ChoiceDistribution {
  const counts: ChoiceDistribution = { A: 0, B: 0, C: 0, D: 0 };
  const keys = ["A", "B", "C", "D"] as const;

  for (const question of questions) {
    const index = question.choices.findIndex(
      (choice) => choice.id === question.correctChoiceId,
    );
    const key = keys[index];
    if (key) {
      counts[key] += 1;
    }
  }

  return counts;
}

function isNearBalanced(counts: ChoiceDistribution, total: number): boolean {
  const values = [counts.A, counts.B, counts.C, counts.D];
  const max = Math.max(...values);
  const min = Math.min(...values);

  if (total === 20) {
    return values.every((value) => value === 5);
  }

  return max - min <= 1;
}

function requireBank(slug: string) {
  const bank = getQuestionBank(slug);
  if (!bank) {
    throw new Error(`bank exists for ${slug}`);
  }
  return bank;
}

function requirePresentSimpleLesson() {
  const lesson = getLessonBySlug("present-simple");
  if (!lesson) {
    throw new Error("present-simple lesson exists");
  }
  return lesson;
}

function assertQuestionIntegrity(question: Question, message: string): void {
  assert(question.choices.length === 4, `${message}: exactly 4 options`);
  const texts = question.choices.map((choice) => choice.text);
  assert(new Set(texts).size === 4, `${message}: no duplicate option texts`);
  const correctMatches = question.choices.filter(
    (choice) => choice.id === question.correctChoiceId,
  );
  assert(correctMatches.length === 1, `${message}: exactly one correct answer`);
  const index = question.choices.findIndex(
    (choice) => choice.id === question.correctChoiceId,
  );
  assert(index >= 0 && index < 4, `${message}: correct index in range`);
  assert(
    question.choices.every((choice) => choice.text.trim().length > 0),
    `${message}: no empty option`,
  );
}

export function verifyEveryQuestionHasFourOptions(): void {
  for (const slug of ["present-simple", "past-simple"] as const) {
    const bank = requireBank(slug);
    for (const question of bank.questions) {
      assertQuestionIntegrity(question, `1: ${question.id}`);
    }
  }
}

export function verifyExactlyOneCorrectAnswer(): void {
  verifyEveryQuestionHasFourOptions();
}

export function verifyCorrectIndexInRange(): void {
  verifyEveryQuestionHasFourOptions();
}

export function verifyNoQuizAllInOnePosition(): void {
  for (const slug of ["present-simple", "past-simple"] as const) {
    const bank = requireBank(slug);
    const counts = countCorrectPositions(bank.questions);
    const values = [counts.A, counts.B, counts.C, counts.D];
    const total = bank.questions.length;
    assert(
      !values.some((value) => value === total),
      `4: ${slug} must not put every correct answer in one position`,
    );
  }
}

export function verifyPresentSimpleDistribution(): void {
  const bank = requireBank("present-simple");
  const counts = countCorrectPositions(bank.questions);
  assert(
    isNearBalanced(counts, bank.questions.length),
    `5: Present bank near-balanced ${JSON.stringify(counts)}`,
  );
  const quizSlice = bank.questions.slice(0, 20);
  const quizCounts = countCorrectPositions(quizSlice);
  assert(
    quizCounts.A === 5 &&
      quizCounts.B === 5 &&
      quizCounts.C === 5 &&
      quizCounts.D === 5,
    `5: first 20 Present questions are 5/5/5/5 ${JSON.stringify(quizCounts)}`,
  );
}

export function verifyPastSimpleDistribution(): void {
  const bank = requireBank("past-simple");
  const counts = countCorrectPositions(bank.questions);
  assert(
    isNearBalanced(counts, bank.questions.length),
    `6: Past bank near-balanced ${JSON.stringify(counts)}`,
  );
}

export function verifyDeterministicStructure(): void {
  const input = {
    prompt: "Choose the correct sentence: I ___ to school every day.",
    correct: "I go to school every day.",
    distractors: [
      "I goes to school every day.",
      "I going to school every day.",
      "I go to school yesterday.",
    ],
    explanation: "Use the base verb with I in Present Simple affirmative sentences.",
    difficulty: "easy" as const,
    grammarPoint: "Present Simple affirmative — I/You/We/They",
    tags: ["affirmative", "daily-routines"],
  };
  const first = createBankQuestion("present-simple", 1, input);
  const second = createBankQuestion("present-simple", 1, input);
  assert(JSON.stringify(first) === JSON.stringify(second), "7: same input same structure");
  assert(
    first.choices.findIndex((choice) => choice.id === first.correctChoiceId) ===
      1,
    "7: index 1 places correct at B",
  );
  const batchA = createBankQuestions("present-simple", [input, input, input, input]);
  const batchB = createBankQuestions("present-simple", [input, input, input, input]);
  assert(
    JSON.stringify(batchA) === JSON.stringify(batchB),
    "7: batch deterministic",
  );
}

export function verifyKnownAnswerScoringFixture(): void {
  const bank = requireBank("present-simple");
  const question = bank.questions[0];
  if (!question) {
    throw new Error("8: first question");
  }
  const correct = question.choices.find(
    (choice) => choice.id === question.correctChoiceId,
  );
  assert(correct?.text === "I go to school every day.", "8: correct text preserved");
  const distractor = question.choices.find(
    (choice) => choice.id !== question.correctChoiceId,
  );
  assert(distractor !== undefined, "8: distractor exists");
  assert(correct?.id !== distractor?.id, "8: selecting A-only is not assumed");

  const lesson = requirePresentSimpleLesson();
  const session = createAssessmentSession(lesson, "quiz", {
    questionCount: 20,
    randomize: false,
  });
  const result = buildAssessmentResult(session, 15, 5);
  assert(result.percentage === 75, "8: 15/20 = 75%");
  assert(result.correct === 15, "8: correct count");
  assert(result.incorrect === 5, "8: incorrect count");
  assert(result.activity === "quiz", "8: quiz result");
}

export function verifyQuizCompletionStillOneEvent(): void {
  const lesson = requirePresentSimpleLesson();
  const session = createAssessmentSession(lesson, "quiz", {
    questionCount: 20,
    randomize: false,
  });
  const result = buildAssessmentResult(session, 15, 5);
  const repository = new MemoryLearningHistoryRepository();
  recordActivityCompletion({
    result,
    lessonSlug: "present-simple",
    repository,
  });
  recordActivityCompletion({
    result,
    lessonSlug: "present-simple",
    repository,
  });
  assert(repository.getAll().length === 1, "9: one LearningEvent");
}

export function runQuizDistributionVerification(): void {
  verifyEveryQuestionHasFourOptions();
  verifyExactlyOneCorrectAnswer();
  verifyCorrectIndexInRange();
  verifyNoQuizAllInOnePosition();
  verifyPresentSimpleDistribution();
  verifyPastSimpleDistribution();
  verifyDeterministicStructure();
  verifyKnownAnswerScoringFixture();
  verifyQuizCompletionStillOneEvent();
}
