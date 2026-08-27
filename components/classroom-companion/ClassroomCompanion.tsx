"use client";

import { useState } from "react";
import { LessonFooter } from "./LessonFooter";
import { LessonHeader } from "./LessonHeader";
import { LessonNavigator } from "./LessonNavigator";
import { LessonProgress } from "./LessonProgress";
import { LessonTimer } from "./LessonTimer";
import { PlanningPanel } from "./PlanningPanel";
import { TeachingPanel } from "./TeachingPanel";
import { useLessonTimer } from "@/lib/hooks/useLessonTimer";
import { getStudentPath } from "@/lib/routes";
import type { CompanionMode, LessonData } from "@/types/lesson";

type ClassroomCompanionProps = {
  lesson: LessonData;
  backHref?: string;
  backLabel?: string;
  defaultMode?: CompanionMode;
};

export function ClassroomCompanion({
  lesson,
  backHref = getStudentPath(),
  backLabel = "หน้าหลักนักเรียน",
  defaultMode = "teaching",
}: ClassroomCompanionProps) {
  const { steps, title } = lesson;
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [mode, setMode] = useState<CompanionMode>(defaultMode);
  const timer = useLessonTimer();

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
    setCompletedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep],
    );
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
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
          />
        </div>
      </section>
    </main>
  );
}
