"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const PIECE_COLORS = ["#f4c44a", "#ff8a73", "#7ec8ff", "#176b4d", "#fff8e8", "#c9b6ff"];
const BURST_MS = 1000;

type StageCelebrationProps = {
  token: number;
};

function makePieces(token: number) {
  return Array.from({ length: 28 }, (_, index) => {
    const seed = (token * 19 + index * 37) % 1000;
    return {
      id: `${token}-${index}`,
      left: 16 + (seed % 68),
      dx: (seed % 90) - 45,
      delay: (index % 7) * 35,
      color: PIECE_COLORS[index % PIECE_COLORS.length],
      width: 6 + (seed % 6),
      height: 9 + (seed % 8),
      rotate: 160 + (seed % 240),
      kind: index % 5 === 0 ? "star" : "paper",
    };
  });
}

export function StageCelebration({ token }: StageCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const pieces = useMemo(() => makePieces(token), [token]);

  useEffect(() => {
    if (token <= 0) {
      setVisible(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), BURST_MS);
    return () => window.clearTimeout(timer);
  }, [token]);

  if (!visible) return null;

  const overlay = (
    <div
      className="gfaMillionaireCelebration"
      data-gfa-celebration="active"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={
            piece.kind === "star"
              ? "gfaMillionaireCelebrationPiece gfaMillionaireCelebrationPiece-star"
              : "gfaMillionaireCelebrationPiece"
          }
          style={{
            left: `${piece.left}%`,
            width: piece.width,
            height: piece.height,
            background: piece.color,
            animationDelay: `${piece.delay}ms`,
            ["--gfa-confetti-dx" as string]: `${piece.dx}vw`,
            ["--gfa-confetti-rot" as string]: `${piece.rotate}deg`,
          }}
        />
      ))}
    </div>
  );

  if (typeof document === "undefined") return overlay;
  return createPortal(overlay, document.body);
}
