import { ProceduralNoise } from "@pictel/effects";
import { DepthMap } from "@pictel/ml";
import { Canvas } from "pictel";

/**
 * ML fixture: a Canvas wrapping a `DepthMap` (WebGPU) over a generative
 * ProceduralNoise child. No image asset. Exercises the headless WebGPU path.
 * The `mode` prop is intentionally unset so the CLI can drive render mode
 * through the URL.
 */
export default function MlCanvas() {
  return (
    <Canvas name="ML" dimensions={{ width: 256, height: 256 }}>
      <DepthMap>
        <ProceduralNoise width={256} height={256} type="simplex" seed={7} scale={0.02} octaves={3} />
      </DepthMap>
    </Canvas>
  );
}
