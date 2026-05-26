import { LinearGradient } from "@pictel/effects";
import { Canvas, Viewer } from "pictel";

/**
 * Multi-Canvas fixture: a Viewer wrapping two named Canvases. Exercises
 * `?canvas=` selection. The `mode` prop is intentionally unset so the CLI
 * can drive render mode through the URL.
 */
export default function ViewerMulti() {
  return (
    <Viewer>
      <Canvas name="Wide" dimensions={{ width: 320, height: 180 }}>
        <LinearGradient
          width={320}
          height={180}
          stops={[
            { color: "#2a9d8f", position: 0 },
            { color: "#264653", position: 1 },
          ]}
          angle={0}
        />
      </Canvas>
      <Canvas name="Tall" dimensions={{ width: 180, height: 320 }}>
        <LinearGradient
          width={180}
          height={320}
          stops={[
            { color: "#f4a261", position: 0 },
            { color: "#e76f51", position: 1 },
          ]}
          angle={90}
        />
      </Canvas>
    </Viewer>
  );
}
