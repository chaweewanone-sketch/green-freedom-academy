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
import {
  EverydayGardenSection1,
  EverydayGardenPlaygroundSection2,
  EverydayGardenWorkshopSection3,
  EverydayGardenQuietShelterSection4,
  EverydayGardenQuestionBoothSection5,
  EverydayGardenClueTrailSection6,
  EverydayGardenClockGardenSection7,
  EverydayGardenClubhouseMapSection8,
  GfaContinueAction,
  GfaLearningWorld,
  GfaLessonProgress,
  GfaScene,
} from "@/components/student-ui";
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

  const teacherLessonBody = (
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
          isLearnRecorded={learnSaved}
        />
      </div>
    </section>
  );

  const isSection1Prototype =
    lesson.slug === "present-simple" && currentStep === 0;
  const isSection2Prototype =
    lesson.slug === "present-simple" && currentStep === 1;
  const isSection3Prototype =
    lesson.slug === "present-simple" && currentStep === 2;
  const isSection4Prototype =
    lesson.slug === "present-simple" && currentStep === 3;
  const isSection5Prototype =
    lesson.slug === "present-simple" && currentStep === 4;
  const isSection6Prototype =
    lesson.slug === "present-simple" && currentStep === 5;
  const isSection7Prototype =
    lesson.slug === "present-simple" && currentStep === 6;
  const isSection8Prototype =
    lesson.slug === "present-simple" && currentStep === 7;

  const studentSceneName = isSection1Prototype
    ? "everyday-garden-gate"
    : isSection2Prototype
      ? "everyday-garden-playground"
      : isSection3Prototype
        ? "everyday-garden-workshop"
        : isSection4Prototype
          ? "everyday-garden-shelter"
          : isSection5Prototype
            ? "everyday-garden-booth"
            : isSection6Prototype
              ? "everyday-garden-trail"
              : isSection7Prototype
                ? "everyday-garden-clock"
                : isSection8Prototype
                  ? "everyday-garden-clubhouse"
                  : "fallback";

  if (isStudentLearn) {
    return (
      <GfaLearningWorld plot="everyday-garden">
        <main className="gfaLearnPage">
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

          <GfaScene name={studentSceneName}>
            <GfaLessonProgress
              total={steps.length}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepSelect={setCurrentStep}
            />

            {isSection1Prototype ? (
              <EverydayGardenSection1
                step={activeStep}
                lessonTitle={title}
              />
            ) : isSection2Prototype ? (
              <EverydayGardenPlaygroundSection2
                step={activeStep}
                lessonTitle={title}
              />
            ) : isSection3Prototype ? (
              <EverydayGardenWorkshopSection3
                step={activeStep}
                lessonTitle={title}
              />
            ) : isSection4Prototype ? (
              <EverydayGardenQuietShelterSection4
                step={activeStep}
                lessonTitle={title}
              />
            ) : isSection5Prototype ? (
              <EverydayGardenQuestionBoothSection5
                step={activeStep}
                lessonTitle={title}
              />
            ) : isSection6Prototype ? (
              <EverydayGardenClueTrailSection6
                step={activeStep}
                lessonTitle={title}
              />
            ) : isSection7Prototype ? (
              <EverydayGardenClockGardenSection7
                step={activeStep}
                lessonTitle={title}
              />
            ) : isSection8Prototype ? (
              <EverydayGardenClubhouseMapSection8
                step={activeStep}
                lessonTitle={title}
              />
            ) : (
              <TeachingPanel
                stepIndex={currentStep}
                totalSteps={steps.length}
                step={activeStep}
                lessonSlug={lesson.slug}
                showActivityGrid={!isStudentLearn}
                showTeacherTip={!isStudentLearn}
              />
            )}

            <GfaContinueAction>
              <LessonFooter
                currentStep={currentStep}
                totalSteps={steps.length}
                onPrevious={goToPrevious}
                onNext={goToNext}
                onMarkComplete={finishLearnAndGoToQuiz}
                isLearnRecorded={learnSaved}
                guided={isStudentLearn}
              />
            </GfaContinueAction>
          </GfaScene>
        </main>
      </GfaLearningWorld>
    );
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
        showClassroomControls
      />
      <LessonProgress percent={progressPercent} />
      {teacherLessonBody}
    </main>
  );
}
