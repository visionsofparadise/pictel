import { Canvas, Viewer } from "pictel";

export function App() {
  return (
    <Viewer>
      <Canvas name="Demo" dimensions={{ width: 1080, height: 1080 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          <h1 style={{ color: "white", fontSize: 72 }}>Pictel</h1>
        </div>
      </Canvas>
    </Viewer>
  );
}
