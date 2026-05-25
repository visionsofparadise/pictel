import { Canvas, LinearGradient, useProps } from "pictel";

interface PropsCanvasProps {
  label?: string;
}

/**
 * Props-driven fixture: reads a `label` prop via `useProps()` and varies its
 * generative content with it. Exercises the `?props=` query-param contract.
 * The `mode` prop is intentionally unset so the CLI can drive render mode
 * through the URL.
 */
export default function PropsCanvas() {
  const { label } = useProps<PropsCanvasProps>();

  // The label deterministically picks a gradient palette so different props
  // produce visibly different output.
  const warm = label === "warm";
  const stops = warm
    ? [
        { color: "#ffb703", position: 0 },
        { color: "#fb8500", position: 1 },
      ]
    : [
        { color: "#8ecae6", position: 0 },
        { color: "#023047", position: 1 },
      ];

  return (
    <Canvas name="Props" dimensions={{ width: 200, height: 200 }}>
      <LinearGradient width={200} height={200} stops={stops} angle={45} />
    </Canvas>
  );
}
