"use client";

import { useEffect, useState } from "react";
import {
  createLearningHistoryRepository,
  loadDashboardHistory,
} from "@/lib/history";
import type { LearningSummary } from "@/types/analytics";
import { StudentDashboard } from "./StudentDashboard";

export function DashboardHistoryView() {
  const [summary, setSummary] = useState<LearningSummary | null>(null);

  useEffect(() => {
    setSummary(loadDashboardHistory());
  }, []);

  function handleClear() {
    const repository = createLearningHistoryRepository();
    repository.clear();
    setSummary(loadDashboardHistory(repository));
  }

  if (!summary) {
    return (
      <section className="panel studentDashboardEmpty">
        <span className="eyebrow">LEARNING SUMMARY</span>
        <h2>กำลังโหลดสรุปการเรียน...</h2>
      </section>
    );
  }

  return (
    <>
      <StudentDashboard summary={summary} />
      {summary.totalActivities > 0 ? (
        <section className="panel studentDashboardSection">
          <button type="button" className="button primary" onClick={handleClear}>
            ล้างประวัติการเรียน
          </button>
        </section>
      ) : null}
    </>
  );
}
