# pictel

A TypeScript framework for agent-native image compositing. Layouts, effects, blending, ML — expressed as React components, rendered by the browser, exported headlessly.

## The pictel ecosystem

- **`pictel`** — framework primitives: `Canvas`, `RasterEffect`, `RasterSource`, `Image`, `Viewer`, `Overflow`, `Clip`
- **`@pictel/effects`** — standard library: ~32 effects, 25 blend modes, 7 generatives
- **`@pictel/ml`** — Transformers.js + WebGPU ML effects (segmentation, depth, upscale)
- **`@pictel/cli`** — headless image renderer (Puppeteer + Sharp)

## Install

```bash
npm i pictel @pictel/effects react react-dom
npm i -D @pictel/cli
```

(Add `@pictel/ml` for ML effects.)

## Quick start

Write a composition (`src/Cover.tsx`):

```tsx
import { Canvas, Image, staticFile } from "pictel"
import { Bloom, Duotone } from "@pictel/effects"

export default function Cover() {
  return (
    <Canvas name="cover" dimensions={{ width: 1200, height: 1200 }}>
      <Bloom threshold={0.7} radius={24}>
        <Duotone dark={[26, 0, 48]} light={[255, 214, 165]}>
          <Image src={staticFile("hero.jpg")} fit="cover" />
        </Duotone>
      </Bloom>
    </Canvas>
  )
}
```

Preview in a Vite app (the entry default-exports a `<Viewer>` wrapping your `<Canvas>`):

```tsx
import Cover from "./Cover"
import { Viewer } from "pictel"
export default () => <Viewer><Cover /></Viewer>
```

Render headlessly:

```bash
npx pictel render --entry src/Cover.tsx --out cover.png --width 1200 --height 1200
```

## Concepts

- **Canvas** — compositing surface; fixed pixel dimensions
- **RasterEffect** — the effect primitive: children → pixels; every effect/blend is one
- **RasterSource** — leaf raster primitive; `Image`, generatives, and custom sources draw into it
- **Overflow / Clip** — bleed control around effect output
- **Modes** — `preview` (Viewer chrome), `display` (bare embed), `render` (headless capture)

## API
