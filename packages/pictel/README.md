# pictel

A React framework for image compositing as code. Layouts, effects, blending, and ML expressed as components — rendered live in the browser, exported headlessly.

## Install

```bash
npm install pictel @pictel/effects react react-dom
```

`@pictel/ml` is optional — install it if your composition uses ML effects (segmentation, depth, upscale).

## Quick start

```tsx
import { Canvas, Clip, Image } from "pictel";
import { Blur } from "@pictel/effects";

export default () => (
  <Canvas dimensions={{ width: 800, height: 800 }}>
    <Clip>
      <Blur radius={4}>
        <Image src="/photo.jpg" />
      </Blur>
    </Clip>
  </Canvas>
);
```

## Examples

### Oil Painting

| Before | After |
|---|---|
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/oil-painting-before.png" alt="Oil painting — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/oil-painting-after.png" alt="Oil painting — after"> |

```tsx
import { Direction, Duotone, Hatch } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import headshot from "../../assets/headshot.jpg";

const INK: [number, number, number] = [38, 30, 54];
const PAPER: [number, number, number] = [240, 234, 220];

export default function OilPainting() {
	return (
		<Canvas mode="display" dimensions={{ width: 640, height: 640 }}>
			<Duotone dark={INK} light={PAPER}>
				<Hatch
					bands={4}
					spacing={[5, 8, 12, 16]}
					length={24}
					uniformStep
					map={
						<Direction mode="structure">
							<Image src={headshot} width={640} height={640} fit="cover" crossOrigin="anonymous" />
						</Direction>
					}
				>
					<Image src={headshot} width={640} height={640} fit="cover" crossOrigin="anonymous" />
				</Hatch>
			</Duotone>
		</Canvas>
	);
}
```

### Pop Art

| Before | After |
|---|---|
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/pop-art-before.png" alt="Pop art — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/pop-art-after.png" alt="Pop art — after"> |

```tsx
import { Contrast, Halftone, Multiply, Outline, Saturate, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import photo from "../../assets/Golden Hour Portrait.jpg";

export default function PopArt() {
	return (
		<Canvas mode="display" dimensions={{ width: 640, height: 960 }}>
			<Multiply
				apply={
					<Threshold threshold={140}>
						<Outline sigma={2.4} k={1.6} epsilon={0.005} phi={200}>
							<Image src={photo} width={640} height={960} fit="cover" crossOrigin="anonymous" />
						</Outline>
					</Threshold>
				}
			>
				<Halftone colorMode="color" dotSize={10}>
					<Contrast amount={1.35}>
						<Saturate amount={2.4}>
							<Image src={photo} width={640} height={960} fit="cover" crossOrigin="anonymous" />
						</Saturate>
					</Contrast>
				</Halftone>
			</Multiply>
		</Canvas>
	);
}
```

### Tilt-Shift

| Before | After |
|---|---|
| <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/tilt-shift-before.png" alt="Tilt-shift — before"> | <img src="https://raw.githubusercontent.com/visionsofparadise/pictel/main/packages/pictel/README-images/tilt-shift-after.png" alt="Tilt-shift — after"> |

```tsx
import { Blur, Brightness, Contrast, Invert, Saturate } from "@pictel/effects";
import { DepthMap } from "@pictel/ml";
import { Canvas, Clip, Image } from "pictel";
import cityPhoto from "../../assets/city overview.jpg";

export default function TiltShift() {
	return (
		<Canvas mode="display" dimensions={{ width: 1024, height: 683 }}>
			<Clip>
				<Blur
					radius={7}
					mode="parameter"
					map={
						<Invert>
							<Brightness amount={2}>
								<Contrast amount={0.35}>
									<DepthMap>
										<Image src={cityPhoto} width={1024} height={683} fit="cover" crossOrigin="anonymous" />
									</DepthMap>
								</Contrast>
							</Brightness>
						</Invert>
					}
				>
					<Saturate amount={1.1}>
						<Contrast amount={1.1}>
							<Image src={cityPhoto} width={1024} height={683} fit="cover" crossOrigin="anonymous" />
						</Contrast>
					</Saturate>
				</Blur>
			</Clip>
			<div
				style={{
					position: "absolute",
					inset: 0,
					boxShadow: "inset 0 0 100px 30px rgba(0,0,0,0.5)",
					pointerEvents: "none",
				}}
			/>
		</Canvas>
	);
}
```

API reference below — generated from JSDoc on the source.

## Layout

### Canvas()

> **Canvas**(`props`): `Element`

Defined in: Components/Canvas/Canvas.tsx:77

The root of a pictel composition. Layers, effects, blend modes, and raster sources
go inside as children, and the Canvas renders the composed image.

Every pictel composition needs a Canvas — effects and raster sources require one
as an ancestor. Use a single Canvas for a one-off image, or wrap multiple Canvases
in a `Viewer` to switch between them during development.

- `name` — Display name shown in the `Viewer` sidebar and used as the `aria-label`. Optional; required if you want this Canvas to be selectable in a `Viewer`.
- `dimensions` — Authored pixel size as `{ width, height }`. Required. The composition is rasterized at exactly these dimensions; preview and display layouts scale visually around this fixed buffer.
- `mode` — Overrides automatic mode detection. `"preview"` shows the full development chrome (workspace, error chip, render button), `"display"` is a bare embed for production use, `"render"` strips all chrome for headless export. Defaults to the `?mode=` URL parameter, or `"preview"` if unset.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `CanvasProps` | - |

#### Returns

`Element`

***

### Viewer()

> **Viewer**(`props`): `Element`

Defined in: Components/Viewer/Viewer.tsx:50

A development shell that hosts one or more `Canvas` children and provides a sidebar
for switching between them. The selected canvas is tracked in the URL via `?canvas=`.

Use a Viewer when a project has multiple compositions you want to navigate during
development. In `display` and `render` modes the sidebar is hidden and only the
active Canvas is rendered, so the same component works for production embeds and
headless export.

- `mode` — Overrides automatic mode detection for every child Canvas. `"preview"` shows the sidebar, `"display"` renders only the active Canvas bare, `"render"` is the same but intended for headless export. Defaults to the `?mode=` URL parameter, or `"preview"` if unset.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ViewerProps` | - |

#### Returns

`Element`

## RasterEffect

### Clip()

> **Clip**(`props`): `Element`

Defined in: [Components/RasterEffect/Clip.tsx:21](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/RasterEffect/Clip.tsx#L21)

Frames a wrapped effect at its content size, cropping any bleed (blur halos,
drop shadow falloff) back to the content edges. Useful when you want the soft
edges of an effect to render at natural scale internally but be clipped to a
crisp rectangular footprint in the layout.

Wrap a single raster effect.

- `children` — Required. A single raster effect to frame and crop.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ClipProps` | - |

#### Returns

`Element`

***

### Overflow()

> **Overflow**(`props`): `Element`

Defined in: [Components/RasterEffect/Overflow.tsx:21](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/RasterEffect/Overflow.tsx#L21)

Lets a wrapped effect's bleed render outside the content footprint instead of
squishing into it. Use around a `Blur`, `DropShadow`, or any effect with halos
or falloff when you want the soft edges to extend past the children's box.

Wrap a single raster effect. The bleed extends outward at natural pixel scale;
to crop it back to content size, wrap the result in `Clip` (or any
`overflow: hidden` container).

- `children` — Required. A single raster effect whose output bleed should be revealed.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `OverflowProps` | - |

#### Returns

`Element`

***

### RasterEffect()

> **RasterEffect**(`props`): `Element`

Defined in: [Components/RasterEffect/RasterEffect.tsx:88](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/RasterEffect/RasterEffect.tsx#L88)

The primitive every effect, blend, and map-driven component is built on. Captures
its children as pixels, hands them to an `effect` callback, and renders the result
in place of the children.

Most consumers reach for a higher-level component (`Blur`, `Multiply`, `DisplacementMap`,
etc.) rather than `RasterEffect` directly. Use it when authoring a custom effect: the
callback receives `ImageData` for the children and optionally for an overlay (`apply`)
or modulation map (`map`), and returns transformed `ImageData`.

- `effect` — Required. Called with the captured children pixels and, if supplied, the `apply` and `map` pixels. May return `ImageData` directly, or an `EffectResult` with `pixels` + `overflow` when the effect produces bleed (blur halos, drop shadows). Async returns are supported.
- `children` — Required. The base layer the effect operates on. Rendered live in the layout, then replaced by the output canvas once the effect resolves.
- `apply` — Optional overlay layer for blend-style effects. Captured in parallel with children and passed to `effect` as the second argument. Renders offscreen — not visible in the live composition.
- `map` — Optional parameter map for map-driven effects (displacement fields, depth, segmentation masks). Captured in parallel with children and passed to `effect` as the third argument. Renders offscreen — not visible in the live composition.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `RasterEffectProps` | - |

#### Returns

`Element`

***

### RasterSource()

> **RasterSource**(`props`): `Element`

Defined in: [Components/RasterEffect/RasterSource.tsx:28](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L28)

The leaf primitive for components that produce pixels from a draw callback —
`Image` and the generative components (`LinearGradient`, `ProceduralNoise`, etc.)
are built on it. Renders a canvas at the requested intrinsic size and lets the
`draw` callback paint into it.

Reach for `RasterSource` when authoring a custom pixel source: anything that
computes pixels from props rather than capturing them from the DOM. Wrap in a
styled `<div>` if you need to position or style it — the API is closed
(no `className`, `style`, event handlers, or ref forwarding).

- `width` — Required. Intrinsic width in pixels. Sets both the canvas backing buffer and the rendered CSS box.
- `height` — Required. Intrinsic height in pixels.
- `draw` — Required. Called with the canvas and an `AbortSignal` once the backing buffer is sized. May be sync (gradients, patterns) or async (decoding an image). Wrap in `useCallback` and use content-based keys in the deps when inputs are inline literals — identity changes re-run the draw.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `RasterSourceProps` | - |

#### Returns

`Element`

## Raster Source

### Image()

> **Image**(`props`): `Element`

Defined in: [Components/Image/Image.tsx:34](https://github.com/visionsofparadise/pictel/blob/main/packages/pictel/src/Components/Image/Image.tsx#L34)

Loads a raster image, decodes it, and renders it into a canvas at the requested
output size and fit. Use `Image` instead of a raw `<img>` for any source that will
be processed by effects — the decoded pixels live in a canvas that effects can read
directly without re-decoding the source for every capture.

Wrap in a styled `<div>` if you need to position or style it — the API is closed
(no `className`, `style`, event handlers, or ref forwarding). Decode failures leave
the canvas blank and do not throw or surface errors.

- `src` — Required. URL or data URL of the source image.
- `width` — Required. Output width in pixels. Sets the canvas backing buffer and the CSS box.
- `height` — Required. Output height in pixels.
- `fit` — How the decoded source maps into the output box. Semantics match CSS `object-fit`: `"cover"` fills the box and crops overflow; `"contain"` fits inside the box and letterboxes with transparency; `"fill"` stretches to the exact box; `"none"` draws at intrinsic size, centered, clipping overflow. Defaults to `"cover"`.
- `crossOrigin` — CORS mode for cross-origin sources. One of `"anonymous"` or `"use-credentials"`. Defaults to unset (no CORS).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ImageProps` | - |

#### Returns

`Element`
