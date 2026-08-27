"use client";

import { useEffect, useState } from "react";
import { HistoryLoadingPanel } from "@/components/HistoryLoadingPanel";
import { buildStudentLearningHome } from "@/lib/analytics/studentHome";
import {
  loadDashboardLearningState,
  type DashboardLearningState,
} from "@/lib/history";
import { StudentLearningHome } from "./StudentLearningHome";

export function StudentLearningHomeView() {
  const [state, setState] = useState<DashboardLearningState | null>(null);

  useEffect(() => {
    setState(loadDashboardLearningState());
  }, []);

  if (!state) {
    return (
      <HistoryLoadingPanel
        eyebrow="LEARNING HOME"
        message="กำลังโหลดหน้าเรียน..."
      />
    );
  }

  const model = buildStudentLearningHome(state.summary, state.events);

  return <StudentLearningHome model={model} />;
}
