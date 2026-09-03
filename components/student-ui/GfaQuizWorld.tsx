"use client";

import type { ReactNode } from "react";
import { GfaArtSlot } from "./GfaArtSlot";
import { GFA_QUIZ_ART } from "@/lib/student-ui/gfaArtAssets";

type GfaQuizWorldProps = {
  children: ReactNode;
};

/**
 * Desktop Quiz: one fixed 16:9 artboard fitted to the browser content viewport.
 * Card + pointing Bai Tong are positioned only inside that artboard.
 */
export function GfaQuizWorld({ children }: GfaQuizWorldProps) {
  const background = GFA_QUIZ_ART.quizPracticeGarden;
  const coach = GFA_QUIZ_ART.baiTongQuizCoachPointing;

  return (
    <div className="gfaQuizWorld">
      <div className="gfaQuizArtboard">
        <div className="gfaQuizWorldArt" aria-hidden="true">
          <GfaArtSlot
            src={background.src}
            alt=""
            aspect={background.aspect}
            decorative
            fallback={null}
            sizes="100vw"
            fit="cover"
            objectPosition="40% 66%"
            priority
          />
        </div>
        <div className="gfaQuizComposition">
          <div className="gfaQuizCardArea">{children}</div>
          <div className="gfaQuizCoachArea" aria-hidden="true">
            <img
              className="gfaQuizCoachImg"
              src={coach.src}
              alt=""
              width={1024}
              height={1536}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
