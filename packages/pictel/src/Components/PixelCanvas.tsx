import { type ComponentPropsWithoutRef, useEffect, useRef } from "react";

type PixelCanvasProps = { data: ImageData } & ComponentPropsWithoutRef<"canvas">;

export function PixelCanvas({ data, style, ...rest }: PixelCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.width = data.width;
    ref.current.height = data.height;
    ref.current.getContext("2d")?.putImageData(data, 0, 0);
  }, [data]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: "100%", ...style }}
      {...rest}
    />
  );
}
