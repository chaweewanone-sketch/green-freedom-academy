import type { ReactNode } from "react";

export type GfaSceneName =
  | "everyday-garden-gate"
  | "everyday-garden-playground"
  | "everyday-garden-workshop"
  | "everyday-garden-shelter"
  | "everyday-garden-booth"
  | "everyday-garden-trail"
  | "fallback";

type GfaSceneProps = {
  name: GfaSceneName;
  children: ReactNode;
};

export function GfaScene({ name, children }: GfaSceneProps) {
  return (
    <section className={`gfaScene gfaScene-${name}`}>{children}</section>
  );
}
