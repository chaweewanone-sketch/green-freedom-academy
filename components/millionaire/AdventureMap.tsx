import type { StageVisualStatus } from "@/lib/millionaire/stageLadder";

type AdventureMapProps = {
  statuses: StageVisualStatus[];
};

type MapPoint = {
  x: number;
  y: number;
};

const DESKTOP_POINTS: MapPoint[] = [
  { x: 78, y: 168 },
  { x: 178, y: 78 },
  { x: 286, y: 186 },
  { x: 398, y: 86 },
  { x: 508, y: 198 },
  { x: 618, y: 92 },
  { x: 724, y: 188 },
  { x: 822, y: 84 },
  { x: 910, y: 162 },
  { x: 1002, y: 72 },
];

const MOBILE_POINTS: MapPoint[] = [
  { x: 70, y: 56 },
  { x: 268, y: 108 },
  { x: 78, y: 168 },
  { x: 270, y: 228 },
  { x: 80, y: 292 },
  { x: 268, y: 354 },
  { x: 78, y: 416 },
  { x: 266, y: 478 },
  { x: 96, y: 542 },
  { x: 252, y: 608 },
];

const NODE_FILL = [
  "#176b4d",
  "#e7f5ed",
  "#d7eefb",
  "#fff4c4",
  "#ffe4de",
  "#eee6ff",
  "#d7eefb",
  "#e7f5ed",
  "#fff4c4",
  "#f4c44a",
];

const NODE_STROKE = [
  "#0f4d36",
  "#176b4d",
  "#1d6fa3",
  "#c9891c",
  "#c45b3a",
  "#7a62c9",
  "#1d6fa3",
  "#176b4d",
  "#c9891c",
  "#8a5a12",
];

function windingPath(points: MapPoint[]): string {
  if (points.length === 0) {
    return "";
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const lift = (index % 2 === 0 ? 1 : -1) * 46;
    const controlX = from.x + (to.x - from.x) * 0.5;
    const controlY = from.y + (to.y - from.y) * 0.5 + lift;
    path += ` Q ${controlX} ${controlY} ${to.x} ${to.y}`;
  }

  return path;
}

function nodeLabel(
  status: StageVisualStatus,
  stageNumber: number,
  isDestination: boolean,
): string {
  if (status === "correct") return "⭐";
  if (status === "missed") return "○";
  if (isDestination) return "🏆";
  return String(stageNumber);
}

function MapScene({
  points,
  statuses,
  variant,
}: {
  points: MapPoint[];
  statuses: StageVisualStatus[];
  variant: "desktop" | "mobile";
}) {
  const trail = windingPath(points);
  const isDesktop = variant === "desktop";

  return (
    <svg
      className={`gfaAdventureMap gfaAdventureMap-${variant}`}
      viewBox={isDesktop ? "0 0 1080 280" : "0 0 360 680"}
      role="img"
      aria-label="แผนที่ผจญภัย 10 ด่าน จากจุดเริ่มถึงถ้วยด่าน 10"
    >
      {isDesktop ? (
        <g className="gfaAdventureDecor" aria-hidden="true">
          <ellipse cx="180" cy="250" rx="120" ry="22" fill="#8fd3a8" opacity="0.45" />
          <ellipse cx="520" cy="258" rx="150" ry="24" fill="#3f8a58" opacity="0.22" />
          <ellipse cx="880" cy="248" rx="110" ry="20" fill="#8fd3a8" opacity="0.4" />
          <ellipse cx="250" cy="36" rx="38" ry="14" fill="#fff" />
          <ellipse cx="720" cy="44" rx="30" ry="12" fill="#fff" />
          <text x="430" y="36" fontSize="22">⭐</text>
          <text x="640" y="250" fontSize="20">🌿</text>
          <text x="140" y="248" fontSize="18">📚</text>
          <text x="860" y="40" fontSize="20">☁️</text>
        </g>
      ) : (
        <g className="gfaAdventureDecor" aria-hidden="true">
          <text x="300" y="40" fontSize="18">⭐</text>
          <text x="24" y="340" fontSize="18">🌿</text>
          <text x="310" y="640" fontSize="18">☁️</text>
        </g>
      )}

      <path
        d={trail}
        fill="none"
        stroke="#e8d2a0"
        strokeWidth={isDesktop ? 22 : 18}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={trail}
        fill="none"
        stroke="#176b4d"
        strokeWidth={isDesktop ? 6 : 5}
        strokeLinecap="round"
        strokeDasharray={isDesktop ? "14 12" : "12 10"}
      />

      {points.map((point, index) => {
        const stageNumber = index + 1;
        const status = statuses[index] ?? "upcoming";
        const isStart = index === 0;
        const isDestination = index === points.length - 1;
        const radius = isDestination ? (isDesktop ? 46 : 40) : isDesktop ? 34 : 28;
        const fill = NODE_FILL[index] ?? "#e7f5ed";
        const stroke = NODE_STROKE[index] ?? "#176b4d";
        const label = nodeLabel(status, stageNumber, isDestination);
        const textFill = isStart || isDestination ? "#17352a" : "#143d2c";

        return (
          <g key={stageNumber} transform={`translate(${point.x} ${point.y})`}>
            {isStart ? (
              <text
                y={-radius - 12}
                textAnchor="middle"
                fontSize={isDesktop ? 16 : 13}
                fontWeight="800"
                fill="#176b4d"
              >
                START
              </text>
            ) : null}
            <circle
              r={radius}
              fill={isStart ? "#176b4d" : fill}
              stroke={stroke}
              strokeWidth={isDestination ? 6 : 4}
            />
            <text
              y={isDestination ? 6 : 8}
              textAnchor="middle"
              fontSize={isDestination ? (isDesktop ? 30 : 26) : isDesktop ? 24 : 20}
              fontWeight="800"
              fill={isStart ? "#fff" : textFill}
            >
              {label}
            </text>
            {isDestination ? (
              <text
                y={radius + 22}
                textAnchor="middle"
                fontSize={isDesktop ? 16 : 14}
                fontWeight="800"
                fill="#8a5a12"
              >
                ด่าน 10
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function AdventureMap({ statuses }: AdventureMapProps) {
  const desktopStatuses = statuses.slice(0, DESKTOP_POINTS.length);
  const mobileStatuses = statuses.slice(0, MOBILE_POINTS.length);

  return (
    <div className="gfaAdventureWrap">
      <MapScene
        points={DESKTOP_POINTS}
        statuses={desktopStatuses}
        variant="desktop"
      />
      <MapScene
        points={MOBILE_POINTS}
        statuses={mobileStatuses}
        variant="mobile"
      />
    </div>
  );
}
