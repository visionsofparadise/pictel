import { Blur, Canvas, Grayscale, Multiply, Screen, Viewer } from "pictel";

export function App() {
  return (
    <Viewer>
      <Canvas
        name="Reference Demo"
        dimensions={{ reference: { width: 1080, height: 1080 } }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            gap: 24,
          }}
        >
          <h1 style={{ color: "white", fontSize: 72 }}>Pictel</h1>
          <Multiply>
            <div
              style={{
                width: "100%",
                height: 200,
                backgroundColor: "coral",
              }}
            />
          </Multiply>
          <Blur radius={4}>
            <p style={{ color: "white", fontSize: 24 }}>Blurred text</p>
          </Blur>
        </div>
      </Canvas>
      <Canvas name="Aspect Ratio Demo" dimensions={{ aspectRatio: 16 / 9 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            gap: 24,
          }}
        >
          <Grayscale>
            <h2 style={{ color: "white", fontSize: 48 }}>16:9 Canvas</h2>
          </Grayscale>
          <Screen>
            <div
              style={{
                width: "100%",
                height: 120,
                backgroundColor: "royalblue",
              }}
            />
          </Screen>
        </div>
      </Canvas>
    </Viewer>
  );
}
