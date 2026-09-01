export type GfaCharacterName = "bai-tong";
export type GfaCharacterExpression =
  | "neutral"
  | "explaining"
  | "encouraging";
export type GfaCharacterSize = "hero" | "scene" | "companion" | "support";

type GfaCharacterProps = {
  name?: GfaCharacterName;
  expression?: GfaCharacterExpression;
  size?: GfaCharacterSize;
  decorative?: boolean;
  label?: string;
};

function mouthPath(expression: GfaCharacterExpression): string {
  if (expression === "encouraging") {
    return "M90 98c6 8 14 8 20 0";
  }

  if (expression === "explaining") {
    return "M92 97c5 7 11 7 16 0";
  }

  return "M94 99h12";
}

export function GfaCharacter({
  name = "bai-tong",
  expression = "neutral",
  size = "support",
  decorative = false,
  label,
}: GfaCharacterProps) {
  const resolvedLabel =
    label ??
    (expression === "explaining"
      ? "ใบตองกำลังอธิบาย"
      : expression === "encouraging"
        ? "ใบตองกำลังให้กำลังใจ"
        : "ใบตอง");

  return (
    <svg
      className={`gfaCharacter gfaCharacter-${name} gfaCharacter-${size}`}
      viewBox="0 0 200 240"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : resolvedLabel}
    >
      <ellipse cx="100" cy="226" rx="48" ry="8" fill="#176b4d" opacity="0.16" />
      <path d="M62 148c8 28 28 46 38 46s30-18 38-46" fill="#3aa0d8" />
      <path d="M70 92h60l8 62H62z" fill="#176b4d" />
      <path d="M78 108h44v12H78z" fill="#f4c44a" />
      <path
        d="M128 104c18 4 28 22 24 40-10 4-22 4-32-2l8-38z"
        fill="#e39b3a"
      />
      <circle cx="148" cy="128" r="7" fill="#f4c44a" />
      <circle cx="100" cy="78" r="42" fill="#f3c7a4" />
      <path
        d="M62 78c8-28 28-44 38-44s30 16 38 44c-12-10-24-14-38-14s-26 4-38 14z"
        fill="#2f6a45"
      />
      <path
        d="M92 34c4-14 14-20 20-8 8-4 16 6 10 16-10-6-20-6-30-8z"
        fill="#3f8a58"
      />
      <circle cx="86" cy="80" r="7" fill="#17352a" />
      <circle cx="114" cy="80" r="7" fill="#17352a" />
      <circle cx="88" cy="78" r="2" fill="#fff" />
      <circle cx="116" cy="78" r="2" fill="#fff" />
      <path
        d={mouthPath(expression)}
        fill="none"
        stroke="#c45b3a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="72" cy="92" r="6" fill="#f0a090" />
      <circle cx="128" cy="92" r="6" fill="#f0a090" />
      <circle cx="58" cy="118" r="11" fill="#f4c44a" />
      <path d="M53 118l5-7 5 7-5 3z" fill="#fff8dc" />
      {expression === "explaining" ? (
        <path
          d="M132 122c26 2 46-12 62-4 1 7-10 14-24 16-16 3-28 4-38-2z"
          fill="#f3c7a4"
        />
      ) : null}
    </svg>
  );
}
