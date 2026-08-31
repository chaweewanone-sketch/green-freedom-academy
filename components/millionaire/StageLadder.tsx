import type { StageVisualStatus } from "@/lib/millionaire/stageLadder";

type StageLadderProps = {
  statuses: StageVisualStatus[];
};

const statusLabels: Record<StageVisualStatus, string> = {
  current: "กำลังเล่น",
  correct: "ผ่านแล้ว",
  missed: "ยังไม่ถูก",
  upcoming: "ยังไม่ถึง",
};

export function StageLadder({ statuses }: StageLadderProps) {
  return (
    <ol className="gfaStageLadder" aria-label="ด่านทั้ง 10">
      {statuses.map((status, index) => {
        const stageNumber = index + 1;
        const isCurrent = status === "current";
        const mark =
          status === "correct" ? "⭐" : status === "missed" ? "○" : String(stageNumber);

        return (
          <li
            key={stageNumber}
            className={`gfaStage gfaStage${status.charAt(0).toUpperCase()}${status.slice(1)}`}
            aria-current={isCurrent ? "step" : undefined}
            aria-label={`ด่าน ${stageNumber} ${statusLabels[status]}`}
          >
            <span className="gfaStageMark" aria-hidden="true">
              {mark}
            </span>
            <span className="gfaStageName">ด่าน {stageNumber}</span>
          </li>
        );
      })}
    </ol>
  );
}
