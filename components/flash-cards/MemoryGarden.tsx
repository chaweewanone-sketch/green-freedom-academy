"use client";

import type { ReactNode } from "react";
import { GfaArtSlot } from "@/components/student-ui/GfaArtSlot";
import { GFA_FLASH_ART } from "@/lib/student-ui/gfaArtAssets";

type MemoryGardenProps = {
  children: ReactNode;
};

/**
 * Memory Garden: full-bleed calm review world + cream Flash Card board + Bai Tong guide.
 * ART = atmosphere. HTML = review / grammar authority.
 */
export function MemoryGarden({ children }: MemoryGardenProps) {
  const background = GFA_FLASH_ART.memoryGardenBackground;
  const companion = GFA_FLASH_ART.baiTongPauseGuide;

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
          objectPosition="42% 58%"
          priority
        />
      </div>
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
