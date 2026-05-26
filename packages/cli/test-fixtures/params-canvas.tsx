import { LinearGradient } from "@pictel/effects";
import { Canvas, useParams } from "pictel";

interface ParamsCanvasProps {
  label?: string;
}

/**
 * Params-driven fixture: reads a `label` param via `useParams()` and varies its
 * generative content with it. Exercises the `?params=` query-param contract.
 * The `mode` prop is intentionally unset so the CLI can drive render mode
 * through the URL.
 */
export default function ParamsCanvas() {
  const { label } = useParams<ParamsCanvasProps>();

  // The label deterministically picks a gradient palette so different params
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
    <Canvas name="Params" dimensions={{ width: 200, height: 200 }}>
      <LinearGradient width={200} height={200} stops={stops} angle={45} />
    </Canvas>
  );
}
