"use client";

import type { ReactNode } from "react";
import { GfaArtSlot } from "@/components/student-ui/GfaArtSlot";
import { GFA_FLASH_ART } from "@/lib/student-ui/gfaArtAssets";

type MemoryGardenProps = {
  children: ReactNode;
};

/**
 * Memory Garden v2: full-bleed world with seated Bai Tong baked into the scene.
 * HTML Flash Card panel stays left/center; no separate character overlay.
 * ART = atmosphere + companion storytelling. HTML = review / grammar authority.
 */
export function MemoryGarden({ children }: MemoryGardenProps) {
  const background = GFA_FLASH_ART.memoryGardenBackground;

  return (
    <div className="gfaMemoryGarden">
      <div className="gfaMemoryGardenArt" aria-hidden="true">
        <GfaArtSlot
          src={background.src}
          alt=""
          aspect={background.aspect}
          decorative
          fallback={null}
          sizes="100vw"
          fit="cover"
          objectPosition="46% 58%"
          priority
        />
      </div>
      <div className="gfaMemoryGardenInner">
        <div className="gfaMemoryGardenBoard">{children}</div>
        {/* Empty right gutter keeps seated Bai Tong visible on desktop. */}
        <div className="gfaMemoryGardenSceneSpacer" aria-hidden="true" />
      </div>
    </div>
  );
}
