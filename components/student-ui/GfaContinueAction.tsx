import type { ReactNode } from "react";

type GfaContinueActionProps = {
  children: ReactNode;
};

export function GfaContinueAction({ children }: GfaContinueActionProps) {
  return <div className="gfaContinueAction">{children}</div>;
}
