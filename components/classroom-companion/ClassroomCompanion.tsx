"use client";

import { useEffect, useState } from "react";
import { LessonFooter } from "./LessonFooter";
import { LessonHeader } from "./LessonHeader";
import { LessonNavigator } from "./LessonNavigator";
import { LessonProgress } from "./LessonProgress";
import { LessonTimer } from "./LessonTimer";
import { PlanningPanel } from "./PlanningPanel";
import { TeachingPanel } from "./TeachingPanel";
import { LessonEntryView } from "./LessonEntryView";
import { useLessonTimer } from "@/lib/hooks/useLessonTimer";
import {
  hasLearnCompletion,
  loadDashboardLearningState,
  recordLearnCompletion,
} from "@/lib/history";
import { getStudentPath } from "@/lib/routes";
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
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [mode, setMode] = useState<CompanionMode>(defaultMode);
  const [learnSaved, setLearnSaved] = useState(false);
  const [historyEpoch, setHistoryEpoch] = useState(0);
  const timer = useLessonTimer();

  useEffect(() => {
    if (!showLearnerProgress) {
      return;
    }

    const { events } = loadDashboardLearningState();
    if (!hasLearnCompletion(events, lesson.slug)) {
      return;
    }

    setCompletedSteps(steps.map((_, index) => index));
    setCurrentStep(Math.max(0, steps.length - 1));
    setLearnSaved(true);
  }, [lesson.slug, showLearnerProgress, steps.length]);

  const progressPercent = Math.round(
    (completedSteps.length / steps.length) * 100,
  );
  const activeStep = steps[currentStep];

  function goToPrevious() {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }

  function goToNext() {
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  }

  function markComplete() {
    const isLastSlide = currentStep >= steps.length - 1;
    setCompletedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep],
    );

    if (!isLastSlide) {
      setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
      return;
    }

    if (!showLearnerProgress || learnSaved) {
      return;
    }

    const saved = recordLearnCompletion({ lessonSlug: lesson.slug });
    if (!saved) {
      return;
    }

    setLearnSaved(true);
    setHistoryEpoch((value) => value + 1);
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
      />

      <LessonProgress percent={progressPercent} />

      <section className="lessonShell companionShell">
        <div className="companionSidebar">
          <LessonNavigator
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepSelect={setCurrentStep}
          />
          <LessonTimer
            seconds={timer.seconds}
            isRunning={timer.isRunning}
            onStart={timer.start}
            onPause={timer.pause}
            onReset={timer.reset}
          />
        </div>

        <div className="companionMain">
          {showLearnerProgress ? (
            <LessonEntryView
              lessonSlug={lesson.slug}
              historyEpoch={historyEpoch}
            />
          ) : null}
          {mode === "teaching" ? (
            <TeachingPanel
              stepIndex={currentStep}
              totalSteps={steps.length}
              step={activeStep}
              lessonSlug={lesson.slug}
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
            onMarkComplete={markComplete}
            isLearnRecorded={learnSaved}
          />
        </div>
      </section>
    </main>
  );
}
