import { resolveQuestionsForLesson } from "@/lib/questions/resolveQuestions";
import { selectRandomQuestions } from "@/lib/questions/selectQuestions";
import type { LessonData } from "@/types/lesson";
import type {
  AssessmentActivity,
  AssessmentOptions,
  AssessmentSession,
} from "@/types/assessment";
import type { Question } from "@/types/question";
import { resolveAssessmentOptions } from "./activityDefaults";

function generateSessionId(): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `assessment_${Date.now()}_${suffix}`;
}

function applyFilters(
  questions: Question[],
  options: ReturnType<typeof resolveAssessmentOptions>,
): Question[] {
  return questions.filter((question) => {
    if (
      options.difficulties &&
      !options.difficulties.includes(question.difficulty)
    ) {
      return false;
    }

    if (
      options.tags &&
      !options.tags.some((tag) => question.tags.includes(tag))
    ) {
      return false;
    }

    if (
      options.grammarPoints &&
      !options.grammarPoints.includes(question.grammarPoint)
    ) {
      return false;
    }

    return true;
  });
}

function selectSessionQuestions(
  questions: Question[],
  questionCount: number,
  randomize: boolean,
): Question[] {
  if (questionCount <= 0 || questions.length === 0) {
    return [];
  }

  const effectiveCount = Math.min(questionCount, questions.length);

  if (!randomize) {
    return questions.slice(0, effectiveCount);
  }

  return selectRandomQuestions(questions, effectiveCount);
}

export function createAssessmentSession(
  lesson: LessonData,
  activity: AssessmentActivity,
  options?: AssessmentOptions,
): AssessmentSession {
  const resolvedOptions = resolveAssessmentOptions(activity, options);
  const sourceQuestions = resolveQuestionsForLesson(lesson);
  const filteredQuestions = applyFilters(sourceQuestions, resolvedOptions);
  const selectedQuestions = selectSessionQuestions(
    filteredQuestions,
    resolvedOptions.questionCount,
    resolvedOptions.randomize,
  );

  return Object.freeze({
    lessonSlug: lesson.slug,
    activity,
    questions: Object.freeze([...selectedQuestions]) as Question[],
    totalAvailable: filteredQuestions.length,
    selectedCount: selectedQuestions.length,
    createdAt: Date.now(),
    sessionId: generateSessionId(),
  });
}
