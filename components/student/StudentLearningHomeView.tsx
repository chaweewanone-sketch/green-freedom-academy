"use client";

import { useEffect, useState } from "react";
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
      <section className="panel studentDashboardEmpty">
        <span className="eyebrow">LEARNING HOME</span>
        <h1>กำลังโหลดหน้าเรียน...</h1>
      </section>
    );
  }

  const model = buildStudentLearningHome(state.summary, state.events);

  return <StudentLearningHome model={model} />;
}
