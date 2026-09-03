"use client";

import type { ReactNode } from "react";
import { GfaMillionaireWorld } from "@/components/student-ui/GfaMillionaireWorld";

type GameWorldProps = {
  phase: "intro" | "playing" | "result";
  children: ReactNode;
  ladder?: ReactNode;
};

export function GameWorld({ phase, children, ladder }: GameWorldProps) {
  return (
    <GfaMillionaireWorld ladder={ladder}>
      <div className={`gfaGameWorld gfaGameWorld-${phase}`}>{children}</div>
    </GfaMillionaireWorld>
  );
}
