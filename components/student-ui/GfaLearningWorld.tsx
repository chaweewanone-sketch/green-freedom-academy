import type { ReactNode } from "react";
import { GfaArtSlot } from "./GfaArtSlot";
import { GFA_SECTION1_ART } from "@/lib/student-ui/gfaArtAssets";

export type GfaLearningPlot = "everyday-garden";

type GfaLearningWorldProps = {
  plot?: GfaLearningPlot;
  children: ReactNode;
};

export function GfaLearningWorld({
  plot = "everyday-garden",
  children,
}: GfaLearningWorldProps) {
  const background = GFA_SECTION1_ART.everydayGardenBackground;

  return (
    <div className={`gfaLearningWorld gfaLearningWorld-${plot}`}>
      <div className="gfaLearningWorldArt" aria-hidden="true">
        <GfaArtSlot
          src={background.src}
          alt=""
          aspect={background.aspect}
          decorative
          fallback={null}
          sizes="100vw"
        />
      </div>
      <div className="gfaLearningWorldInner">{children}</div>
    </div>
  );
}
