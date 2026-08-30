"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LessonFooter } from "./LessonFooter";
import { LessonHeader } from "./LessonHeader";
import { LessonNavigator } from "./LessonNavigator";
import { LessonProgress } from "./LessonProgress";
import { LessonTimer } from "./LessonTimer";
import { PlanningPanel } from "./PlanningPanel";
import { TeachingPanel } from "./TeachingPanel";
import { useLessonTimer } from "@/lib/hooks/useLessonTimer";
import { shouldPersistLearnCompletion } from "@/lib/lessons/guidedLearnFooter";
import {
  hasCurrentLearnCompletion,
  loadDashboardLearningState,
  recordLearnCompletion,
} from "@/lib/history";
import { getActivityPath, getStudentPath } from "@/lib/routes";
import type { CompanionMode, LessonData } from "@/types/lesson";

type ClassroomCompanionProps = {
  lesson: LessonData;
  backHref?: string;
  backLabel?: string;
  defaultMode?: CompanionMode;
  showLearnerProgress?: boolean;
};

export function ClassroomCompanion({
  lesson,
  backHref = getStudentPath(),
  backLabel = "หน้าหลักนักเรียน",
  defaultMode = "teaching",
  showLearnerProgress = true,
}: ClassroomCompanionProps) {
  const { steps, title } = lesson;
  const isStudentLearn = showLearnerProgress;
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [mode, setMode] = useState<CompanionMode>(defaultMode);
  const [learnSaved, setLearnSaved] = useState(false);
  const timer = useLessonTimer();

  useEffect(() => {
    if (!isStudentLearn) {
      return;
    }

    const { events } = loadDashboardLearningState();
    if (!hasCurrentLearnCompletion(events, lesson.slug)) {
      return;
    }

    setLearnSaved(true);
  }, [isStudentLearn, lesson.slug]);

  const progressPercent = Math.round(
    (completedSteps.length / steps.length) * 100,
  );
  const activeStep = steps[currentStep];

  function markStepSeen(stepIndex: number) {
    setCompletedSteps((prev) =>
      prev.includes(stepIndex) ? prev : [...prev, stepIndex],
    );
  }

  function goToPrevious() {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }

  function goToNext() {
    markStepSeen(currentStep);
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  }

  function finishLearnAndGoToQuiz() {
    markStepSeen(currentStep);

    if (
      isStudentLearn &&
      !learnSaved &&
      shouldPersistLearnCompletion(currentStep, steps.length)
    ) {
      const saved = recordLearnCompletion({ lessonSlug: lesson.slug });
      if (saved) {
        setLearnSaved(true);
      }
    }

    router.push(getActivityPath(lesson.slug, "quiz"));
  }

  function markComplete() {
    const isLastSlide = shouldPersistLearnCompletion(currentStep, steps.length);
    markStepSeen(currentStep);

    if (!isLastSlide) {
      setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
      return;
    }

    if (!isStudentLearn || learnSaved) {
      return;
    }

    const saved = recordLearnCompletion({ lessonSlug: lesson.slug });
    if (!saved) {
      return;
    }

    setLearnSaved(true);
  }

  return (
    <main className="companionPage">
      <LessonHeader
        backHref={backHref}
        backLabel={backLabel}
        title={title}
        currentStep={currentStep}
        totalSteps={steps.length}
        progressPercent={progressPercent}
        mode={mode}
        onModeChange={setMode}
        showClassroomControls={!isStudentLearn}
      />

      <LessonProgress percent={progressPercent} />

      <section className="lessonShell companionShell">
        <div
          className={
            isStudentLearn
              ? "companionSidebar guidedLearnSidebar"
              : "companionSidebar"
          }
        >
          <LessonNavigator
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepSelect={setCurrentStep}
          />
          {!isStudentLearn ? (
            <LessonTimer
              seconds={timer.seconds}
              isRunning={timer.isRunning}
              onStart={timer.start}
              onPause={timer.pause}
              onReset={timer.reset}
            />
          ) : null}
        </div>

        <div className="companionMain">
          {mode === "teaching" ? (
            <TeachingPanel
              stepIndex={currentStep}
              totalSteps={steps.length}
              step={activeStep}
              lessonSlug={lesson.slug}
              showActivityGrid={!isStudentLearn}
              showTeacherTip={!isStudentLearn}
            />
          ) : (
            <PlanningPanel
              lessonTitle={title}
              steps={steps}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          )}

          <LessonFooter
            currentStep={currentStep}
            totalSteps={steps.length}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onMarkComplete={
              isStudentLearn ? finishLearnAndGoToQuiz : markComplete
            }
            isLearnRecorded={learnSaved}
            guided={isStudentLearn}
          />
        </div>
      </section>
    </main>
  );
}
