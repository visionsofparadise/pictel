import { LinearGradient } from "@pictel/effects";
import { Canvas } from "pictel";

/**
 * Minimal single-Canvas fixture: one Canvas containing a generative
 * LinearGradient. No assets, no ML. The `mode` prop is intentionally unset
 * so the CLI can drive render mode through the URL.
 */
export default function SingleCanvas() {
  return (
    <Canvas name="Test" dimensions={{ width: 200, height: 200 }}>
      <LinearGradient
        width={200}
        height={200}
        stops={[
          { color: "#1d3557", position: 0 },
          { color: "#e63946", position: 1 },
        ]}
        angle={45}
      />
    </Canvas>
  );
}
