import type { ReactNode } from "react";

export type GfaSceneName = "everyday-garden-gate" | "fallback";

type GfaSceneProps = {
  name: GfaSceneName;
  children: ReactNode;
};

export function GfaScene({ name, children }: GfaSceneProps) {
  return (
    <section className={`gfaScene gfaScene-${name}`}>{children}</section>
  );
}
