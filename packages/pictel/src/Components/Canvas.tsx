import type { ReactNode } from "react";

interface CanvasDimensions {
  width: number;
  height: number;
}

interface CanvasAspectRatio {
  aspectRatio: number;
}

interface CanvasProps {
  name?: string;
  dimensions: CanvasDimensions | CanvasAspectRatio;
  children?: ReactNode;
}

export function Canvas({ children }: CanvasProps) {
  return <div>{children}</div>;
}
