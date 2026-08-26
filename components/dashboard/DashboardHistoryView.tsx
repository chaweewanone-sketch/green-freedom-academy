"use client";

import { useEffect, useState } from "react";
import {
  createLearningHistoryRepository,
  loadDashboardLearningState,
  type DashboardLearningState,
} from "@/lib/history";
import { StudentDashboard } from "./StudentDashboard";

export function DashboardHistoryView() {
  const [state, setState] = useState<DashboardLearningState | null>(null);

  useEffect(() => {
    setState(loadDashboardLearningState());
  }, []);

  function handleClear() {
    const repository = createLearningHistoryRepository();
    repository.clear();
    setState(loadDashboardLearningState(repository));
  }

  if (!state) {
    return (
      <section className="panel studentDashboardEmpty">
        <span className="eyebrow">LEARNING SUMMARY</span>
        <h2>กำลังโหลดสรุปการเรียน...</h2>
      </section>
    );
  }

  return (
    <>
      <StudentDashboard summary={state.summary} events={state.events} />
      {state.summary.totalActivities > 0 ? (
        <section className="panel studentDashboardSection">
          <button type="button" className="button primary" onClick={handleClear}>
            ล้างประวัติการเรียน
          </button>
        </section>
      ) : null}
    </>
  );
}
