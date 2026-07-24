import type { Question } from "@/types/question";

export function selectRandomQuestions(
  questions: Question[],
  count: number,
): Question[] {
  if (count <= 0 || questions.length === 0) {
    return [];
  }

  if (count >= questions.length) {
    return [...questions];
  }

  const pool = [...questions];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count);
}
