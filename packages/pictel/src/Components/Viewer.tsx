import type { ReactNode } from "react";

interface ViewerProps {
  children?: ReactNode;
}

export function Viewer({ children }: ViewerProps) {
  return <div>{children}</div>;
}
