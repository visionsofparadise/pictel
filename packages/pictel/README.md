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

## Layout

### Canvas()

> **Canvas**(`props`): `Element`

Defined in: [Components/Canvas.tsx:76](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/Canvas.tsx#L76)

Root compositing surface. Contains layers, effects, and blend modes as children.
Each Canvas is an independent composition with its own pixel pipeline.

- `name` — Display name shown in the Viewer sidebar. Used as the `aria-label`.
- `dimensions` — Fixed compositing buffer size in pixels (`{ width, height }`). Required. The pipeline rasterizes at exactly these dimensions; visual fit is a CSS concern handled by Frame.
- `mode` — Overrides URL-based mode detection. One of `"preview"`, `"display"`, or `"render"`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `CanvasProps` | - |

#### Returns

`Element`

***

### Viewer()

> **Viewer**(`props`): `Element`

Defined in: [Components/Viewer.tsx:44](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/Viewer.tsx#L44)

Development preview shell that renders one or more Canvas components.
Provides a sidebar for selecting between canvases when multiple are present.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ViewerProps` | - |

#### Returns

`Element`

## RasterEffect

### Clip()

> **Clip**(`props`): `Element`

Defined in: [Components/RasterEffect/Clip.tsx:19](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/RasterEffect/Clip.tsx#L19)

Clips a wrapped pipeline's bleed back to its content footprint.

Composes `Overflow` — which exposes bleed at natural pixel ratio — inside
an `overflow: hidden` container sized to the raster effect's content. The bleed
extends outside the raster effect via `Overflow` and is then cropped at the
content edges by the outer.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ClipProps` | - |

#### Returns

`Element`

***

### Overflow()

> **Overflow**(`props`): `Element`

Defined in: [Components/RasterEffect/Overflow.tsx:32](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/RasterEffect/Overflow.tsx#L32)

Reveals a wrapped raster effect's bleed at natural pixel ratio.

By default a RasterEffect's output canvas renders inline at the dimensions
children measured at (`cssW × cssH`) with a backing buffer that may be
larger when the effect produced bleed (Blur halo, drop shadow falloff,
etc.). Bleed pixels are squished into the content footprint by default.
Overflow finds the wrapped raster effect's
`[data-pictel-raster]` canvas, reads its
`data-pictel-overflow-{top,right,bottom,left}` data attributes, and
applies absolute positioning to the canvas — expanded by the overflow
sum on each axis and shifted by negative top/left — so the canvas
renders at its natural pixel ratio, visibly extending outside the
wrapper. Compose with an outer `overflow: hidden` wrapper (see `Clip`)
to crop the bleed back to content size.

Only acts when the wrapped raster effect has resolved (i.e. its raster canvas
exists in the DOM). During pending the raster effect renders its children
inline; Overflow waits for the canvas to mount before applying styles,
watching the wrapper's subtree for the canvas's appearance/dimension
changes.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `OverflowProps` | - |

#### Returns

`Element`

***

### RasterEffect()

> **RasterEffect**(`props`): `Element`

Defined in: [Components/RasterEffect/RasterEffect.tsx:82](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/RasterEffect/RasterEffect.tsx#L82)

Unified raster-effect primitive. Handles all effect and blend cases through
prop-carried secondary inputs.

DOM contribution per RasterEffect instance:

- Inline (in the parent's layout slot): a wrapper `<div>` carrying
  `children` — block-level and sized to children's intrinsic box while
  no snapshot is set, hidden (`display: none`) once a snapshot is set
  (children stay mounted but un-laid-out). When a snapshot is set, a
  sibling `<canvas data-pictel-raster>` renders inline carrying the
  captured pixels at the snapshot's CSS dimensions.
- In the Canvas-level offscreen host (when `apply` or `map` are set):
  pictel-owned slot divs receiving the apply/map subtrees via React
  portals. These subtrees are isolated from the composition's CSS
  cascade.

All present input wrappers (children, apply slot, map slot) are captured
in parallel via snapdom or the fast path when eligible.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `RasterEffectProps` | - |

#### Returns

`Element`

***

### RasterSource()

> **RasterSource**(`props`): `Element`

Defined in: [Components/RasterEffect/RasterSource.tsx:47](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L47)

Shared leaf primitive for raster-producing components (Image, generatives).
Emits a bare `<canvas data-pictel-raster>` — the same tag the resolved
[RasterEffect](#rastereffect) emits — so a parent capture recognizes it via
`tryFastPath` and reads the canvas ImageData directly when intrinsic
dims match the requested capture dims.

Pending state is reported via `RasterEffectContext`: `useLayoutEffect`
registers with the parent registry and flips a JS pendingRef
synchronously before any wrapping RasterEffect's layout effect runs (child
layout effects run before parents per React semantics), so the parent's
first gate observes this leaf as pending via `registry.anyPending()`.
The single Canvas-root `data-pictel-pending` attribute is derived from
the registry — no per-element pending attribute exists.

Closed API: no `className`, `style`, `id`, `data-*`, `aria-*`, event
handlers, or ref forwarding. Wrap in a styled `<div>` if positioning is
needed. Matches the closed effect-component API (2026-04-09).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `RasterSourceProps` | - |

#### Returns

`Element`

## Raster Source

### Image()

> **Image**(`props`): `Element`

Defined in: [Components/Image/Image.tsx:51](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/Image/Image.tsx#L51)

Loads a raster image source once on mount, decodes it via the browser's
native image loader, and draws the decoded pixels into the leaf canvas at
the requested fit. The source decode happens once per `src` change — not
once per capture — so parent pipeline captures read pixels from the leaf
canvas, never re-decoding the source bytes.

Renders through [RasterSource](#rastersource), so the emitted DOM is a bare
`<canvas data-pictel-raster>` that a parent pipeline's capture can read
directly via the fast path when intrinsic dims match the requested
capture dims.

Decode failures (network error, malformed image, abort) clear pending and
leave the canvas blank. No error is surfaced to `reportError` — Image is a
leaf, and the pipeline error log is reserved for effect callbacks.

Closed API: no `className`, `style`, `id`, `data-*`, `aria-*`, event
handlers, or ref forwarding. Wrap in a styled `<div>` if positioning is
needed.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ImageProps` | - |

#### Returns

`Element`
