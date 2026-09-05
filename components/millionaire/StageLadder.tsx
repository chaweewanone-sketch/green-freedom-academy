import {
  formatGamePrize,
  getStagePrize,
  type StageVisualStatus,
} from "@/lib/millionaire/stageLadder";

type StageLadderProps = {
  statuses: StageVisualStatus[];
  variant?: "journey" | "preview";
};

const statusLabels: Record<StageVisualStatus, string> = {
  current: "กำลังเล่น",
  correct: "ผ่านแล้ว",
  missed: "ยังไม่ถูก",
  upcoming: "ยังไม่ถึง",
};

function stageMark(
  status: StageVisualStatus,
  isDestination: boolean,
): string {
  if (status === "correct") return "✓";
  if (status === "missed") return "○";
  if (isDestination) return "🏆";
  if (status === "current") return "▶";
  return "";
}

export function StageLadder({
  statuses,
  variant = "journey",
}: StageLadderProps) {
  return (
    <ol
      className={`gfaStageLadder gfaStageLadder-${variant}`}
      aria-label="บันไดเงินรางวัลในเกม 10 ด่าน"
    >
      {statuses.map((status, index) => {
        const stageNumber = index + 1;
        const isCurrent = status === "current";
        const isDestination = index === statuses.length - 1;
        const prize = formatGamePrize(getStagePrize(index));
        const mark = stageMark(status, isDestination);

        return (
          <li
            key={stageNumber}
            className={[
              "gfaStage",
              `gfaStage${status.charAt(0).toUpperCase()}${status.slice(1)}`,
              index === 0 ? "gfaStageStart" : "",
              isDestination ? "gfaStageDestination" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={isCurrent ? "step" : undefined}
            aria-label={`ด่าน ${stageNumber} ${prize} ${statusLabels[status]}${
              isDestination ? " จุดหมายหนึ่งล้าน" : ""
            }`}
          >
            <span className="gfaStageMark" aria-hidden="true">
              {mark || stageNumber}
            </span>
            <span className="gfaStagePrize" aria-hidden="true">
              {prize}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
