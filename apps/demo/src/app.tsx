import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import TiltShift from "./demos/TiltShift";
import tiltShiftSource from "./demos/TiltShift.tsx?raw";
import cityPhoto from "../assets/city overview.jpg";

function CodeBlock({ source }: { source: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    void codeToHtml(source, {
      lang: "tsx",
      theme: "github-dark",
    }).then(setHtml);
  }, [source]);

  return (
    <div
      style={{
        borderRadius: 4,
        overflow: "auto",
        maxHeight: 400,
        fontSize: 13,
        lineHeight: 1.5,
        tabSize: 2,
      }}
      dangerouslySetInnerHTML={html ? { __html: html } : undefined}
    >
      {html ? undefined : (
        <pre
          style={{
            backgroundColor: "#1a1a1a",
            padding: 16,
            margin: 0,
            color: "#ccc",
            fontFamily: "monospace",
          }}
        >
          {source}
        </pre>
      )}
    </div>
  );
}

const demos = [
  {
    name: "Tilt-Shift",
    description:
      "Depth-map-driven blur with contrast-adjusted depth map and saturation boost. Uses parameter-mode Blur so the kernel varies per pixel based on estimated depth.",
    original: cityPhoto,
    component: TiltShift,
    source: tiltShiftSource,
  },
];

export function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111",
        color: "#eee",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: "48px 32px",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: 36,
          fontWeight: 600,
          marginBottom: 12,
          letterSpacing: "-0.02em",
        }}
      >
        Pictel
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "#888",
          marginBottom: 48,
          maxWidth: 600,
        }}
      >
        Effect gallery. Each row shows the original image, the processed result,
        and the composition source code.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
        {demos.map((demo) => (
          <div key={demo.name}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              {demo.name}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#888",
                marginBottom: 20,
                maxWidth: 700,
              }}
            >
              {demo.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginBottom: 20,
              }}
            >
              {/* Original */}
              <div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#666",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  Original
                </p>
                <img
                  src={demo.original}
                  style={{
                    width: "100%",
                    borderRadius: 4,
                    display: "block",
                  }}
                />
              </div>

              {/* After */}
              <div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#666",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  After
                </p>
                <div style={{ borderRadius: 4, overflow: "hidden" }}>
                  <demo.component />
                </div>
              </div>
            </div>

            {/* Code */}
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Code
              </p>
              <CodeBlock source={demo.source} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
