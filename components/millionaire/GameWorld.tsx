import type { ReactNode } from "react";

type GameWorldProps = {
  phase: "intro" | "playing" | "result";
  children: ReactNode;
};

export function GameWorld({ phase, children }: GameWorldProps) {
  return (
    <div className={`gfaGameWorld gfaGameWorld-${phase}`}>
      <div className="gfaGameDecor" aria-hidden="true">
        <span className="gfaDecor gfaDecor-blob1" />
        <span className="gfaDecor gfaDecor-blob2" />
        <span className="gfaDecor gfaDecor-blob3" />
        <span className="gfaDecor gfaDecor-ray" />
        <span className="gfaDecor gfaDecor-cloud1" />
        <span className="gfaDecor gfaDecor-cloud2" />
        <span className="gfaDecor gfaDecor-leaf1" />
        <span className="gfaDecor gfaDecor-leaf2" />
        <span className="gfaDecor gfaDecor-star1" />
        <span className="gfaDecor gfaDecor-star2" />
        <span className="gfaDecor gfaDecor-star3" />
        <span className="gfaDecor gfaDecor-star4" />
      </div>
      {children}
    </div>
  );
}
