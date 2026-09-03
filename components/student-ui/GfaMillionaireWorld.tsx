"use client";

import type { ReactNode } from "react";
import { GfaArtSlot } from "./GfaArtSlot";
import { GFA_MILLIONAIRE_ART } from "@/lib/student-ui/gfaArtAssets";

type GfaMillionaireWorldProps = {
  children: ReactNode;
  ladder?: ReactNode;
};

/**
 * Desktop Millionaire: one 16:9 Adventure Clearing artboard.
 * Board, Bai Tong Game Companion, and optional Stage Ladder share the same ground plane.
 */
export function GfaMillionaireWorld({
  children,
  ladder,
}: GfaMillionaireWorldProps) {
  const background = GFA_MILLIONAIRE_ART.adventureClearing;
  const companion = GFA_MILLIONAIRE_ART.baiTongCompanion;

  return (
    <div className="gfaMillionaireWorld">
      <div className="gfaMillionaireWorldArt" aria-hidden="true">
        <GfaArtSlot
          src={background.src}
          alt=""
          aspect={background.aspect}
          decorative
          fallback={null}
          sizes="100vw"
          fit="cover"
          objectPosition="50% 62%"
          priority
        />
      </div>
      <div className="gfaMillionaireArtboard">
        <div
          className={
            ladder
              ? "gfaMillionaireComposition gfaMillionaireComposition-play"
              : "gfaMillionaireComposition"
          }
        >
          <div className="gfaMillionaireBoardArea">{children}</div>
          <div className="gfaMillionaireCompanionArea" aria-hidden="true">
            <img
              className="gfaMillionaireCompanionImg"
              src={companion.src}
              alt=""
              width={1024}
              height={1536}
            />
          </div>
          {ladder ? (
            <div className="gfaMillionaireLadderArea">{ladder}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
