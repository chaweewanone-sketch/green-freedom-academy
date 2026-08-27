"use client";

import { useEffect, useState } from "react";
import { HistoryLoadingPanel } from "@/components/HistoryLoadingPanel";
import { buildLessonEntry } from "@/lib/analytics/lessonEntry";
import {
  loadDashboardLearningState,
  type DashboardLearningState,
} from "@/lib/history";
import { LessonEntryCard } from "./LessonEntryCard";

type LessonEntryViewProps = {
  lessonSlug: string;
};

export function LessonEntryView({ lessonSlug }: LessonEntryViewProps) {
  const [state, setState] = useState<DashboardLearningState | null>(null);

  useEffect(() => {
    setState(loadDashboardLearningState());
  }, []);

  if (!state) {
    return (
      <HistoryLoadingPanel
        eyebrow="LESSON PROGRESS"
        message="กำลังโหลดความก้าวหน้าในบทนี้..."
        className="lessonEntryLoading"
      />
    );
  }

  return <LessonEntryCard model={buildLessonEntry(lessonSlug, state.events)} />;
}
