"use client";

import { useState } from "react";
import {
  LessonFooter,
  LessonHeader,
  LessonNavigator,
  LessonProgress,
  LessonTimer,
  PlanningPanel,
  TeachingPanel,
} from "@/components/classroom-companion";
import { useLessonTimer } from "@/lib/hooks/useLessonTimer";
import { presentSimpleLesson } from "@/lib/lessons/present-simple";
import type { CompanionMode } from "@/types/lesson";

export default function PresentSimpleLessonPage() {
  const { steps, title } = presentSimpleLesson;
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [mode, setMode] = useState<CompanionMode>("teaching");
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
        backHref="/student"
        backLabel="Dashboard"
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
