import { Blur, Canvas, Grayscale, Map, Multiply, Screen, Viewer } from "pictel";
import { DepthMap, RemoveBackground, Sam2, SegFormer, Upscale } from "@pictel/ml";

const sampleImage = "https://picsum.photos/id/237/256/256";

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
      <Canvas
        name="ML Effects Demo"
        dimensions={{ reference: { width: 1080, height: 1080 } }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            padding: 24,
            width: "100%",
            height: "100%",
          }}
        >
          <div>
            <p style={{ color: "white", marginBottom: 8 }}>RemoveBackground</p>
            <RemoveBackground>
              <img src={sampleImage} crossOrigin="anonymous" />
            </RemoveBackground>
          </div>
          <div>
            <p style={{ color: "white", marginBottom: 8 }}>DepthMap</p>
            <DepthMap>
              <img src={sampleImage} crossOrigin="anonymous" />
            </DepthMap>
          </div>
          <div>
            <p style={{ color: "white", marginBottom: 8 }}>Sam2</p>
            <Sam2 points={[{ x: 128, y: 128 }]}>
              <img src={sampleImage} crossOrigin="anonymous" />
            </Sam2>
          </div>
          <div>
            <p style={{ color: "white", marginBottom: 8 }}>SegFormer</p>
            <SegFormer>
              <img src={sampleImage} crossOrigin="anonymous" />
            </SegFormer>
          </div>
          <div>
            <p style={{ color: "white", marginBottom: 8 }}>Upscale</p>
            <Upscale>
              <img
                src={sampleImage}
                crossOrigin="anonymous"
                style={{ width: 128, height: 128 }}
              />
            </Upscale>
          </div>
        </div>
      </Canvas>
      <Canvas
        name="Blur Modes Demo"
        dimensions={{ reference: { width: 1080, height: 1080 } }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            padding: 24,
            width: "100%",
            height: "100%",
          }}
        >
          {/* 1. Uniform raster blur — blurs children */}
          <div>
            <p style={{ color: "white", marginBottom: 8 }}>Uniform Raster Blur</p>
            <Blur radius={10}>
              <img src={sampleImage} crossOrigin="anonymous" />
            </Blur>
          </div>

          {/* 2. Uniform backdrop blur — blurs what's behind */}
          <div style={{ position: "relative" }}>
            <p style={{ color: "white", marginBottom: 8 }}>Uniform Backdrop Blur</p>
            <img src={sampleImage} crossOrigin="anonymous" />
            <Blur
              radius={10}
              style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "50%" }}
            />
          </div>

          {/* 3. Map-driven parameter blur — variable radius per map luminance */}
          <div>
            <p style={{ color: "white", marginBottom: 8 }}>Map Parameter Blur</p>
            <Blur radius={20}>
              <Map>
                <div
                  style={{
                    width: 256,
                    height: 256,
                    background: "linear-gradient(to right, black, white)",
                  }}
                />
              </Map>
              <img src={sampleImage} crossOrigin="anonymous" />
            </Blur>
          </div>

          {/* 4. Map-driven mix blur — uniform blur blended with original per map */}
          <div>
            <p style={{ color: "white", marginBottom: 8 }}>Map Mix Blur</p>
            <Blur radius={20} mode="mix">
              <Map>
                <div
                  style={{
                    width: 256,
                    height: 256,
                    background: "linear-gradient(to right, black, white)",
                  }}
                />
              </Map>
              <img src={sampleImage} crossOrigin="anonymous" />
            </Blur>
          </div>
        </div>
      </Canvas>
    </Viewer>
  );
}
