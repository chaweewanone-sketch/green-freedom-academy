import type { ReactNode } from "react";

type GfaMissionProps = {
  children: ReactNode;
};

export function GfaMission({ children }: GfaMissionProps) {
  return (
    <p className="gfaMission">
      <span className="gfaMissionBadge" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <ellipse cx="24" cy="28" rx="14" ry="16" fill="#3f8a58" />
          <path d="M24 8c8 8 8 16 0 22-8-6-8-14 0-22z" fill="#176b4d" />
          <path d="M24 8v22" stroke="#7a4a24" strokeWidth="3" />
        </svg>
      </span>
      <span className="gfaMissionCopy">
        <span className="gfaMissionKicker">ภารกิจวันนี้</span>
        <span className="gfaMissionText">{children}</span>
      </span>
    </p>
  );
}
