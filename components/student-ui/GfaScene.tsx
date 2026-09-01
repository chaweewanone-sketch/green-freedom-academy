import type { ReactNode } from "react";

export type GfaSceneName =
  | "everyday-garden-gate"
  | "everyday-garden-playground"
  | "everyday-garden-workshop"
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
