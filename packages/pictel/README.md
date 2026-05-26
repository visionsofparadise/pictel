# pictel

## Layout

### Canvas()

> **Canvas**(`props`): `Element`

Defined in: [Components/Canvas.tsx:76](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/Canvas.tsx#L76)

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

Defined in: [Components/Viewer.tsx:44](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/Viewer.tsx#L44)

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

Defined in: [Components/RasterEffect/Clip.tsx:19](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/Clip.tsx#L19)

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

Defined in: [Components/RasterEffect/Overflow.tsx:32](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/Overflow.tsx#L32)

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

Defined in: [Components/RasterEffect/RasterEffect.tsx:91](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterEffect.tsx#L91)

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

Defined in: [Components/RasterEffect/RasterSource.tsx:50](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L50)

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
| `props` | [`RasterSourceProps`](#rastersourceprops) | - |

#### Returns

`Element`

## Hooks

### useProps()

> **useProps**\<`T`\>(): `T`

Defined in: [hooks/useProps.ts:18](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/hooks/useProps.ts#L18)

Reads the `?props=` URL query parameter, JSON-parses it, and returns the
resulting object. This is how a composition receives the props the CLI
export pipeline supplies — each export entry's `props` are JSON-encoded into
the `props=` query param and delivered to the composition through this hook.

Malformed JSON is non-fatal: the error is logged via `console.error` and an
empty object is returned, so a bad query param degrades gracefully rather
than crashing the composition.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `Record`\<`string`, `unknown`\> |

#### Returns

`T`

The parsed props object, cast to `T`. An empty object when the
  param is absent or its JSON is malformed.

## Other

### CanvasDimensions

Defined in: [context/canvas.ts:10](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/context/canvas.ts#L10)

Fixed pixel dimensions for the canvas's compositing buffer. The capture
pipeline rasterizes to exactly these dimensions; visual scale (preview
fit-to-viewport, display fit-to-container) is applied by Frame as a CSS
transform and does not affect buffer size.

***

### RasterSourceProps

Defined in: [Components/RasterEffect/RasterSource.tsx:7](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L7)

Props for the [RasterSource](#rastersource) primitive.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-draw"></a> `draw` | (`canvas`, `signal`) => `void` \| `Promise`\<`void`\> | Draw callback. Receives the leaf canvas and an AbortSignal. May be sync (gradients, patterns) or async (Image, which awaits decode before drawing). The canvas backing buffer is pre-sized to `width × height` before the callback runs. Stability matters: the layout effect re-runs whenever `draw`'s identity changes, which re-flips this leaf to pending and triggers a full re-capture in any wrapping RasterEffect. Consumers should wrap `draw` in `useCallback` and use content-based keys (e.g. a serialized stops array) in the deps for inputs that may be inline-literal arrays or objects. | [Components/RasterEffect/RasterSource.tsx:25](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L25) |
| <a id="property-height"></a> `height` | `number` | Intrinsic height in pixels. | [Components/RasterEffect/RasterSource.tsx:11](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L11) |
| <a id="property-width"></a> `width` | `number` | Intrinsic width in pixels. Sets the canvas backing buffer and the CSS box. | [Components/RasterEffect/RasterSource.tsx:9](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L9) |

***

### RasterEffectCallback

> **RasterEffectCallback** = (`target`, `apply?`, `map?`) => `ImageData` \| `EffectResult` \| `Promise`\<`ImageData` \| `EffectResult`\>

Defined in: [Components/RasterEffect/RasterEffect.tsx:19](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterEffect.tsx#L19)

Unified effect callback receiving the target (children) pixels and
optional apply/map pixels. Returns the processed pixels (as ImageData or
EffectResult; overflow defaults to zero when returning a bare ImageData).

- `target` — pixels from children (base layer, in-flow, drives layout)
- `apply` — pixels from the `apply` prop subtree (overlay layer for blends), present when `apply` prop is set
- `map` — pixels from the `map` prop subtree (parameter modulation for effects), present when `map` prop is set

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | `ImageData` |
| `apply?` | `ImageData` |
| `map?` | `ImageData` |

#### Returns

`ImageData` \| `EffectResult` \| `Promise`\<`ImageData` \| `EffectResult`\>

***

### ErrorChip()

> **ErrorChip**(`__namedParameters`): `Element` \| `null`

Defined in: [design-system/ErrorChip.tsx:77](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/design-system/ErrorChip.tsx#L77)

Top-left error chip. Collapsed by default — shows an `AlertTriangle` icon
plus a count of pipeline errors. On hover, expands downward to show each
error as a row (id + message). Returns `null` when there are no errors.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `ErrorChipProps` |

#### Returns

`Element` \| `null`

***

### LoadingOverlay()

> **LoadingOverlay**(`__namedParameters`): `Element` \| `null`

Defined in: [design-system/LoadingOverlay.tsx:30](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/design-system/LoadingOverlay.tsx#L30)

Full-bleed darken layer plus a bottom-right spinner. Visible when `pending`
is true; renders nothing otherwise. Both layers are siblings (not nested) so
the spinner sits above the darken without inheriting `pointer-events: none`
being applied to a wrapper.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `LoadingOverlayProps` |

#### Returns

`Element` \| `null`

***

### RenderStrip()

> **RenderStrip**(`__namedParameters`): `Element`

Defined in: [design-system/RenderStrip.tsx:58](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/design-system/RenderStrip.tsx#L58)

Always-visible export strip floating in the top-right of the workspace
gutter. Holds local state for output format, quality, and an in-flight
rendering flag. On render-button click, calls `exportCanvas` with the
current page URL as the source — the iframe inside `exportCanvas` re-renders
the same canvas at target dimensions in `render` mode and triggers a download.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `RenderStripProps` |

#### Returns

`Element`

***

### SidebarRow()

> **SidebarRow**(`__namedParameters`): `Element`

Defined in: [design-system/SidebarRow.tsx:35](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/design-system/SidebarRow.tsx#L35)

Single row in the Sidebar. Exported so the design-system showcase can render
forced-state instances (`default`, `hover`, `selected`) directly without
needing to script real interaction.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `SidebarRowProps` |

#### Returns

`Element`

## Raster Source

### Image()

> **Image**(`props`): `Element`

Defined in: [Components/Image/Image.tsx:51](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/Image/Image.tsx#L51)

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

## Utilities

### staticFile()

> **staticFile**(`path`): `string`

Defined in: [utils/staticFile.ts:26](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/utils/staticFile.ts#L26)

Resolves a path within the served `public/` directory to a root-relative URL.

Pictel adopts Remotion's convention: assets placed in a `public/` directory
are served at the web root. File-valued props (e.g. a hero image path) are
passed to a composition as plain strings — query-param JSON cannot carry live
file handles — and resolved at render time with this helper:

```tsx
const { heroImage } = useProps();
return <Image src={staticFile(heroImage)} />;
```

Any leading `./` or `/` is stripped and the remainder is prefixed with `/`,
so `"hero.jpg"`, `"./hero.jpg"`, and `"/hero.jpg"` all resolve to
`"/hero.jpg"`.

Known limitation: this assumes the app is served from the root. A non-root
Vite `base` is not accounted for — the returned URL would need the `base`
prefix prepended manually in that case.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | A path to an asset within the `public/` directory. |

#### Returns

`string`

The root-relative URL for the asset.

## Layout

### Canvas()

> **Canvas**(`props`): `Element`

Defined in: [Components/Canvas.tsx:76](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/Canvas.tsx#L76)

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

Defined in: [Components/Viewer.tsx:44](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/Viewer.tsx#L44)

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

Defined in: [Components/RasterEffect/Clip.tsx:19](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/Clip.tsx#L19)

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

Defined in: [Components/RasterEffect/Overflow.tsx:32](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/Overflow.tsx#L32)

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

Defined in: [Components/RasterEffect/RasterEffect.tsx:91](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterEffect.tsx#L91)

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

Defined in: [Components/RasterEffect/RasterSource.tsx:50](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L50)

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
| `props` | [`RasterSourceProps`](#rastersourceprops) | - |

#### Returns

`Element`

## Hooks

### useProps()

> **useProps**\<`T`\>(): `T`

Defined in: [hooks/useProps.ts:18](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/hooks/useProps.ts#L18)

Reads the `?props=` URL query parameter, JSON-parses it, and returns the
resulting object. This is how a composition receives the props the CLI
export pipeline supplies — each export entry's `props` are JSON-encoded into
the `props=` query param and delivered to the composition through this hook.

Malformed JSON is non-fatal: the error is logged via `console.error` and an
empty object is returned, so a bad query param degrades gracefully rather
than crashing the composition.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `Record`\<`string`, `unknown`\> |

#### Returns

`T`

The parsed props object, cast to `T`. An empty object when the
  param is absent or its JSON is malformed.

## Other

### CanvasDimensions

Defined in: [context/canvas.ts:10](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/context/canvas.ts#L10)

Fixed pixel dimensions for the canvas's compositing buffer. The capture
pipeline rasterizes to exactly these dimensions; visual scale (preview
fit-to-viewport, display fit-to-container) is applied by Frame as a CSS
transform and does not affect buffer size.

***

### RasterSourceProps

Defined in: [Components/RasterEffect/RasterSource.tsx:7](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L7)

Props for the [RasterSource](#rastersource) primitive.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-draw"></a> `draw` | (`canvas`, `signal`) => `void` \| `Promise`\<`void`\> | Draw callback. Receives the leaf canvas and an AbortSignal. May be sync (gradients, patterns) or async (Image, which awaits decode before drawing). The canvas backing buffer is pre-sized to `width × height` before the callback runs. Stability matters: the layout effect re-runs whenever `draw`'s identity changes, which re-flips this leaf to pending and triggers a full re-capture in any wrapping RasterEffect. Consumers should wrap `draw` in `useCallback` and use content-based keys (e.g. a serialized stops array) in the deps for inputs that may be inline-literal arrays or objects. | [Components/RasterEffect/RasterSource.tsx:25](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L25) |
| <a id="property-height"></a> `height` | `number` | Intrinsic height in pixels. | [Components/RasterEffect/RasterSource.tsx:11](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L11) |
| <a id="property-width"></a> `width` | `number` | Intrinsic width in pixels. Sets the canvas backing buffer and the CSS box. | [Components/RasterEffect/RasterSource.tsx:9](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterSource.tsx#L9) |

***

### RasterEffectCallback

> **RasterEffectCallback** = (`target`, `apply?`, `map?`) => `ImageData` \| `EffectResult` \| `Promise`\<`ImageData` \| `EffectResult`\>

Defined in: [Components/RasterEffect/RasterEffect.tsx:19](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/RasterEffect/RasterEffect.tsx#L19)

Unified effect callback receiving the target (children) pixels and
optional apply/map pixels. Returns the processed pixels (as ImageData or
EffectResult; overflow defaults to zero when returning a bare ImageData).

- `target` — pixels from children (base layer, in-flow, drives layout)
- `apply` — pixels from the `apply` prop subtree (overlay layer for blends), present when `apply` prop is set
- `map` — pixels from the `map` prop subtree (parameter modulation for effects), present when `map` prop is set

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | `ImageData` |
| `apply?` | `ImageData` |
| `map?` | `ImageData` |

#### Returns

`ImageData` \| `EffectResult` \| `Promise`\<`ImageData` \| `EffectResult`\>

***

### ErrorChip()

> **ErrorChip**(`__namedParameters`): `Element` \| `null`

Defined in: [design-system/ErrorChip.tsx:77](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/design-system/ErrorChip.tsx#L77)

Top-left error chip. Collapsed by default — shows an `AlertTriangle` icon
plus a count of pipeline errors. On hover, expands downward to show each
error as a row (id + message). Returns `null` when there are no errors.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `ErrorChipProps` |

#### Returns

`Element` \| `null`

***

### LoadingOverlay()

> **LoadingOverlay**(`__namedParameters`): `Element` \| `null`

Defined in: [design-system/LoadingOverlay.tsx:30](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/design-system/LoadingOverlay.tsx#L30)

Full-bleed darken layer plus a bottom-right spinner. Visible when `pending`
is true; renders nothing otherwise. Both layers are siblings (not nested) so
the spinner sits above the darken without inheriting `pointer-events: none`
being applied to a wrapper.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `LoadingOverlayProps` |

#### Returns

`Element` \| `null`

***

### RenderStrip()

> **RenderStrip**(`__namedParameters`): `Element`

Defined in: [design-system/RenderStrip.tsx:58](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/design-system/RenderStrip.tsx#L58)

Always-visible export strip floating in the top-right of the workspace
gutter. Holds local state for output format, quality, and an in-flight
rendering flag. On render-button click, calls `exportCanvas` with the
current page URL as the source — the iframe inside `exportCanvas` re-renders
the same canvas at target dimensions in `render` mode and triggers a download.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `RenderStripProps` |

#### Returns

`Element`

***

### SidebarRow()

> **SidebarRow**(`__namedParameters`): `Element`

Defined in: [design-system/SidebarRow.tsx:35](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/design-system/SidebarRow.tsx#L35)

Single row in the Sidebar. Exported so the design-system showcase can render
forced-state instances (`default`, `hover`, `selected`) directly without
needing to script real interaction.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `SidebarRowProps` |

#### Returns

`Element`

## Raster Source

### Image()

> **Image**(`props`): `Element`

Defined in: [Components/Image/Image.tsx:51](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/Components/Image/Image.tsx#L51)

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

## Utilities

### staticFile()

> **staticFile**(`path`): `string`

Defined in: [utils/staticFile.ts:26](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/pictel/src/utils/staticFile.ts#L26)

Resolves a path within the served `public/` directory to a root-relative URL.

Pictel adopts Remotion's convention: assets placed in a `public/` directory
are served at the web root. File-valued props (e.g. a hero image path) are
passed to a composition as plain strings — query-param JSON cannot carry live
file handles — and resolved at render time with this helper:

```tsx
const { heroImage } = useProps();
return <Image src={staticFile(heroImage)} />;
```

Any leading `./` or `/` is stripped and the remainder is prefixed with `/`,
so `"hero.jpg"`, `"./hero.jpg"`, and `"/hero.jpg"` all resolve to
`"/hero.jpg"`.

Known limitation: this assumes the app is served from the root. A non-root
Vite `base` is not accounted for — the returned URL would need the `base`
prefix prepended manually in that case.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | A path to an asset within the `public/` directory. |

#### Returns

`string`

The root-relative URL for the asset.
