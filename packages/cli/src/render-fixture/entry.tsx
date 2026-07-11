import { ProceduralNoise, RadialGradient, Screen } from "@pictel/effects";
import { Canvas } from "pictel";

const width = 240;
const height = 160;

export default function RenderFixture() {
  return (
    <Canvas dimensions={{ width, height }}>
      <Screen
        apply={
          <ProceduralNoise
            width={width}
            height={height}
            type="simplex"
            seed={101}
            scale={0.5}
          />
        }
      >
        <RadialGradient
          width={width}
          height={height}
          stops={[
            { color: "#f6c970", position: 0 },
            { color: "#c25a2e", position: 0.5 },
            { color: "#1a1326", position: 1 },
          ]}
          centerX={0.4}
          centerY={0.4}
          radius={0.9}
        />
      </Screen>
    </Canvas>
  );
}
