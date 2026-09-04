"use client";

import type { ReactNode } from "react";
import { GFA_SECTION4_ART } from "@/lib/student-ui/gfaArtAssets";

type MemoryGardenProps = {
  children: ReactNode;
};

export function MemoryGarden({ children }: MemoryGardenProps) {
  const companion = GFA_SECTION4_ART.baiTongPauseGuide;

  return (
    <div className="gfaMemoryGarden">
      <div className="gfaMemoryGardenInner">
        <div className="gfaMemoryGardenBoard">{children}</div>
        <div className="gfaMemoryGardenCompanion" aria-hidden="true">
          <img
            className="gfaMemoryGardenCompanionImg"
            src={companion.src}
            alt=""
            width={1024}
            height={1229}
          />
        </div>
      </div>
    </div>
  );
}
