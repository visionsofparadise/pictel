# @pictel/effects

Standard library of raster effects, blend modes, and generative sources for [pictel](https://www.npmjs.com/package/pictel). ~32 effects, 25 blend modes, 7 generatives, plus their pure-function counterparts.

## Install

```bash
npm i @pictel/effects pictel react react-dom
```

## Usage

```tsx
import { Canvas, Image } from "pictel"
import { Blur, Multiply, LinearGradient } from "@pictel/effects"

export default function Card() {
  return (
    <Canvas dimensions={{ width: 800, height: 800 }}>
      <Multiply
        apply={
          <LinearGradient
            angle={45}
            stops={[
              { color: "#0ff", position: 0 },
              { color: "#f0f", position: 1 },
            ]}
          />
        }
      >
        <Blur radius={4}>
          <Image src="/photo.jpg" />
        </Blur>
      </Multiply>
    </Canvas>
  )
}
```

## What's in here

- **Effects** (~32): Blur, Bloom, Brightness, Contrast, Duotone, Halftone, Hatch, ColorGrade, CubeLUT, Quantize, DisplacementMap, ...
- **Blend modes** (25): Multiply, Screen, Overlay, ColorDodge, HSL family (Hue/Saturation/Color/Luminosity), Linear*/Vivid*/Hard* extended set, ...
- **Generatives** (7): LinearGradient, RadialGradient, ConicGradient, DotPattern, LinePattern, GridPattern, ProceduralNoise

## Modes

Effects that take both parameter and mix forms expose a `mode` prop:

- `mode="parameter"` (default) — apply the effect directly
- `mode="mix"` — blend the result with the original via a `<Map>` child's luminance

CSS-filter-style effects (Brightness, Contrast, Saturate, HueRotate, Opacity, Blur) and pixel-math effects (Posterize, Threshold, Sharpen, Bloom, Outline, Quantize, ShockFilter) support both modes. ML-only and mix-only effects don't expose `mode`.

## Maps

Some effects require a `<Map>` child carrying a parameter-modulation source:

- `DisplacementMap` — displacement vector field
- `LIC` — direction field (cos/sin/magnitude triplet)
- `Hatch` (field-aligned mode) — direction field

Compose with map-producing effects:

```tsx
<DisplacementMap strength={20}>
  <Image src="/subject.jpg" />
  <Map><ProceduralNoise scale={8} seed="x" /></Map>
</DisplacementMap>
```

## API

## Effects

### applyMappedBilateralGpu()

> **applyMappedBilateralGpu**(`pixels`, `map`, `spatialSigma`, `colorSigma`): `Promise`\<`ImageData`\>

Defined in: [Effects/BilateralGpu.tsx:19](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/BilateralGpu.tsx#L19)

GPU-accelerated counterpart to `Bilateral`. Same prop interface; runs the
filter as a WebGPU compute dispatch. Throws via the standard `RasterEffect`
error path when WebGPU is unavailable — no CPU fallback (use `Bilateral`
directly when WebGPU support isn't guaranteed).

Recommended over `Bilateral` for `spatialSigma >= 4` and large images where
the CPU implementation's O(W·H·r²) gather is interactive-blocking.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `map` | `ImageData` |
| `spatialSigma` | `number` |
| `colorSigma` | `number` |

#### Returns

`Promise`\<`ImageData`\>

***

### Bilateral()

> **Bilateral**(`props`): `Element`

Defined in: [Effects/Bilateral.tsx:148](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Bilateral.tsx#L148)

Edge-preserving smoothing. Blurs flat regions while keeping edges crisp — useful
as a cel-shading or skin-smoothing primitive. Large `spatialSigma` values are
perceptibly slow on large images; keep it under 6 for interactive use.

- `spatialSigma` — Spatial radius in pixels. Sensible values are 2–6.
- `colorSigma` — Color tolerance in 0–255 units. Larger values bridge more across edges.
- `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `BilateralProps` | - |

#### Returns

`Element`

***

### Bloom()

> **Bloom**(`props`): `Element`

Defined in: [Effects/Bloom.tsx:101](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Bloom.tsx#L101)

Adds a soft glow that bleeds out of the bright regions of the image. The
glow is clipped to the frame — output dimensions match the input.

- `threshold` — Luminance cutoff in `[0, 1]` for what counts as a highlight. Highlights fade in smoothly through a soft knee. Default 0.75.
- `radius` — Glow blur radius in pixels. Larger values spread the glow further. Default 16.
- `intensity` — Glow strength multiplier. Default 1.
- `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `BloomProps` | - |

#### Returns

`Element`

***

### BloomGpu()

> **BloomGpu**(`props`): `Element`

Defined in: [Effects/BloomGpu.tsx:23](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/BloomGpu.tsx#L23)

GPU-accelerated counterpart to `Bloom`. Same prop interface. Throws via the
standard `RasterEffect` error path when WebGPU is unavailable.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `BloomGpuProps` | - |

#### Returns

`Element`

***

### Blur()

> **Blur**(`props`): `Element`

Defined in: [Effects/Blur.tsx:292](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Blur.tsx#L292)

Applies a Gaussian-approximation blur or a map-driven variable-radius blur.

- `radius` — Blur radius in pixels. With a map, radius scales per-pixel by map luminance.
- `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `BlurProps` | - |

#### Returns

`Element`

***

### BlurGpu()

> **BlurGpu**(`props`): `Element`

Defined in: [Effects/BlurGpu.tsx:26](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/BlurGpu.tsx#L26)

GPU-accelerated counterpart to `Blur` (parameter mode only — the variable
(mapped) blur stays CPU). Runs the Gaussian-approximation box-blur cascade
as WebGPU compute dispatches. Throws via the standard `RasterEffect` error
path when WebGPU is unavailable — no CPU fallback (use `Blur` directly when
WebGPU support isn't guaranteed).

Output dimensions and overflow match `Blur` exactly; per-pixel values match
within float-precision tolerance.

- `radius` — Blur radius in pixels.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `BlurGpuProps` | - |

#### Returns

`Element`

***

### Brightness()

> **Brightness**(`props`): `Element`

Defined in: [Effects/Brightness.tsx:65](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Brightness.tsx#L65)

Adjusts pixel brightness by multiplying RGB channels.

- `amount` — Brightness multiplier. 1 is unchanged, 0 is black, greater than 1 brightens.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `BrightnessProps` | - |

#### Returns

`Element`

***

### ChannelMixer()

> **ChannelMixer**(`props`): `Element`

Defined in: [Effects/ChannelMixer.tsx:43](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/ChannelMixer.tsx#L43)

Remaps RGB channels through a 3x3 mixing matrix. Each output channel is a
weighted sum of the input channels.

- `matrix` — 3x3 array where `matrix[outChannel][inChannel]` is the weight. Stabilize with `useMemo`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ChannelMixerProps` | - |

#### Returns

`Element`

***

### ColorGrade()

> **ColorGrade**(`props`): `Element`

Defined in: [Effects/ColorGrade.tsx:73](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/ColorGrade.tsx#L73)

Combined color grading with brightness, contrast, saturation, temperature, and tint controls.

- `brightness` — Brightness multiplier. Default 1.
- `contrast` — Contrast multiplier. Default 1.
- `saturation` — Saturation multiplier. Default 1.
- `temperature` — Warm/cool shift. Positive warms (adds red, removes blue), negative cools.
- `tint` — Green/magenta shift. Positive adds magenta, negative adds green.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ColorGradeProps` | - |

#### Returns

`Element`

***

### Contrast()

> **Contrast**(`props`): `Element`

Defined in: [Effects/Contrast.tsx:65](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Contrast.tsx#L65)

Adjusts pixel contrast by scaling deviation from mid-gray.

- `amount` — Contrast multiplier. 1 is unchanged, 0 is flat gray, greater than 1 increases contrast.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ContrastProps` | - |

#### Returns

`Element`

***

### CubeLUT()

> **CubeLUT**(`props`): `Element`

Defined in: [Effects/CubeLUT.tsx:156](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/CubeLUT.tsx#L156)

Applies a .cube 3D LUT file for color grading. Fetches and parses the cube file, then
applies trilinear-interpolated color transformation.

- `src` — URL to a .cube LUT file.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `CubeLUTProps` | - |

#### Returns

`Element`

***

### Direction()

> **Direction**(`props`): `Element`

Defined in: [Effects/Sobel/Direction.tsx:170](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Sobel/Direction.tsx#L170)

Produces a direction field describing how the image flows at every pixel.
Feed this through the `map` prop on `LIC` or the field-aligned mode of
`Hatch` to drive streamline-following effects.

Output is not meant to be visually readable — it renders as red/green static
in DevTools. That's correct; the encoding favors sampling accuracy over
legibility.

- `kernel` — `"sobel"` (default) or `"scharr"`. Scharr produces a larger,
  more rotationally symmetric response.
- `mode` — `"gradient"` (default) emits the per-pixel gradient direction;
  `"structure"` emits a smooth, contour-following orientation field — the
  one to reach for when feeding `LIC` or `Hatch` over an organic field.
  Unrelated to the `"parameter"|"mix"` `mode` on other effects.
- `space` — `"luminance"` (default) runs Sobel on BT.601 luminance;
  `"color"` runs per-channel Sobel and outputs the channel-averaged
  gradient direction with colour-distance magnitude. `space="color"` is
  honoured only for `mode="gradient"` — `mode="structure"` always uses
  luminance regardless of `space`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DirectionProps` | - |

#### Returns

`Element`

***

### DisplacementMap()

> **DisplacementMap**(`props`): `Element`

Defined in: [Effects/DisplacementMap.tsx:67](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/DisplacementMap.tsx#L67)

Displaces pixels using the `map` prop's red and green channels for X and Y offset.
Supply a `map` prop providing the displacement source.

- `scaleX` — Maximum horizontal displacement in pixels. Default 20.
- `scaleY` — Maximum vertical displacement in pixels. Default 20.
- `useMagnitude` — When true, scale each displacement by the map's blue channel
  (`B/255`), letting `DisplacementMap` consume a Direction-encoded field (e.g.
  `VectorField`) that carries unit direction in R/G and magnitude in B. Default
  false, which ignores B and treats R/G as the full displacement vector.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DisplacementMapProps` | - |

#### Returns

`Element`

***

### DropShadow()

> **DropShadow**(`props`): `Element`

Defined in: [Effects/DropShadow.tsx:134](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/DropShadow.tsx#L134)

Adds a drop shadow behind the content at a specified offset with blur and color.

- `offsetX` — Horizontal shadow offset in pixels.
- `offsetY` — Vertical shadow offset in pixels.
- `blurRadius` — Shadow blur radius in pixels.
- `color` — Shadow color as hex (`#rgb`, `#rrggbb`, `#rrggbbaa`) or `rgb()`/`rgba()`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DropShadowProps` | - |

#### Returns

`Element`

***

### DropShadowGpu()

> **DropShadowGpu**(`props`): `Element`

Defined in: [Effects/DropShadowGpu.tsx:24](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/DropShadowGpu.tsx#L24)

GPU-accelerated counterpart to `DropShadow`. Same prop interface. Throws
via the standard `RasterEffect` error path when WebGPU is unavailable.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DropShadowGpuProps` | - |

#### Returns

`Element`

***

### Duotone()

> **Duotone**(`props`): `Element`

Defined in: [Effects/Duotone.tsx:46](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Duotone.tsx#L46)

Maps pixel luminance to a two-color gradient. Shadows map to `dark`, highlights to `light`.

- `dark` — RGB triple [r, g, b] (0-255) for shadow tones.
- `light` — RGB triple [r, g, b] (0-255) for highlight tones.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DuotoneProps` | - |

#### Returns

`Element`

***

### EdgeDetect()

> **EdgeDetect**(`props`): `Element`

Defined in: [Effects/Sobel/EdgeDetect.tsx:69](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Sobel/EdgeDetect.tsx#L69)

Outputs the gradient magnitude of the input as a continuous grayscale field.

Useful as a building block for masking, displacement, and stylized looks.
Pre-blur the input (chain `<Blur>`) for cleaner, less noise-driven edges.

- `kernel` — `sobel` (default) or `scharr`. Scharr has a larger response and
  is more rotationally symmetric.
- `space` — `"luminance"` (default) runs Sobel on BT.601 luminance; equal-
  luminance hue boundaries produce zero magnitude. `"color"` runs Sobel on
  R, G, B independently and combines per-pixel as `√(Σ_channel(gxC²+gyC²))`
  — the true colour-distance gradient. Use `"color"` when boundary detection
  must respect hue changes (e.g. asymmetric watercolour rim effects).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `EdgeDetectProps` | - |

#### Returns

`Element`

***

### Engrave()

> **Engrave**(`props`): `Element`

Defined in: [Effects/Engrave.tsx:95](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Engrave.tsx#L95)

Line-engraving (intaglio) effect. Renders the source as warped parallel
lines whose thickness is modulated by tone, with optional cross-hatched
shadows — the look of an engraved banknote or steel-plate portrait.

Output is grayscale (black ink on white); wrap in `Duotone` for colored ink.
For clean, blank highlights, brighten the source first (e.g. `Brightness`)
so the lightest region reaches white — the lines vanish wherever tone is
white.

- `spacing` — Pixels between adjacent line centres. Default 6.
- `angle` — Line orientation in radians. Default 0 (horizontal).
- `relief` — Pixels the lines bow with tone. Default 0 (straight).
- `crossHatch` — Cross-hatch the darkest tones. Default true.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `EngraveProps` | - |

#### Returns

`Element`

***

### GradientMap()

> **GradientMap**(`props`): `Element`

Defined in: [Effects/GradientMap.tsx:104](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/GradientMap.tsx#L104)

Maps pixel luminance through a multi-stop color ramp. Shadows take the first stop's
color, highlights the last, with continuous interpolation across the band between stops.

A generalization of `Duotone` to N color stops — the same `{ color, position }` stop
model used by the gradient generatives. Luminance (BT.601) keys a 256-entry ramp built
once from `stops`.

- `stops` — Array of color stops with `color` (any CSS color the library parses) and
  `position` (0-1). Sorted by position; luminance below the first / above the last stop
  clamps to that stop's color.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `GradientMapProps` | - |

#### Returns

`Element`

***

### Grain()

> **Grain**(`props`): `Element`

Defined in: [Effects/Grain.tsx:45](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Grain.tsx#L45)

Adds deterministic monochromatic film grain noise to the image.

- `intensity` — Maximum noise amplitude in pixel values (0-255 range).
- `seed` — Random seed for reproducible grain patterns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `GrainProps` | - |

#### Returns

`Element`

***

### Grayscale()

> **Grayscale**(`props`): `Element`

Defined in: [Effects/Grayscale.tsx:43](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Grayscale.tsx#L43)

Desaturates pixels toward perceptual grayscale.

- `amount` — Desaturation amount. 0 is unchanged, 1 is fully grayscale. Default 1.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `GrayscaleProps` | - |

#### Returns

`Element`

***

### Halftone()

> **Halftone**(`props`): `Element`

Defined in: [Effects/Halftone.tsx:194](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Halftone.tsx#L194)

Converts the image to a dot-screen halftone. Three flavors:

- `"luminance"` (default) — monochrome Ben-Day screen: dot radius varies
  with local luminance, dots are stamped in `dotColor` on white.
- `"cmyk"` — true process halftone: Cyan, Magenta, Yellow, and Key are each
  screened on their own grid at the classic process angles (Cyan 15°,
  Magenta 75°, Yellow 0°, Key 45°) and overprinted — the look of CMYK
  newsprint where colour emerges from overlapping colored dots.
- `"color"` — single-screen color halftone: one shared grid, each cell a
  dot in that cell's own average color. No overlapping screens, so the
  pattern can't misregister — the clean comic-dot look. Reach for this in
  pop-art treatments.

- `dotSize` — Grid cell size in pixels. Larger values produce coarser halftone.
- `angle` — Rotation of the dot grid in degrees (`"luminance"` / `"color"` modes only). Default 0.
- `colorMode` — `"luminance"` (default), `"cmyk"`, or `"color"`.
- `dotColor` — Ink color `[r, g, b]` for the `"luminance"` screen. Default black `[0, 0, 0]`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `HalftoneProps` | - |

#### Returns

`Element`

***

### Hatch()

> **Hatch**(`props`): `Element`

Defined in: [Effects/Hatch.tsx:222](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Hatch.tsx#L222)

Renders the source as tonal bands of ink hatching on white. Two modes:

- **Constant-angle** (no `map` prop): each band uses a fixed angle and
  spacing. Pass `angles` and `spacing` arrays of length `bands`.
- **Field-aligned** (with `map` prop): hatching follows the supplied
  direction field, so the strokes curve around the form. The `map` is
  expected to be a `Direction`-style field (see `Direction`). The
  lightest band stays pure white. Source alpha is preserved.

- `bands` — Number of tonal tiers. Minimum 2. Default 4.
- `angles` — Per-band line angles in radians (constant-angle mode). Length must equal `bands`.
- `spacing` — Per-band line spacing in pixels. Length must equal `bands`. In constant-angle mode this is the literal stripe period; in field-aligned mode it controls per-band density (tighter spacing yields darker hatching).
- `length` — Field-aligned integration length per direction. Default 20.
- `stepSize` — Field-aligned step size in pixels. Default 1.0.
- `uniformStep` — Field-aligned mode: integrate at a constant step length, ignoring the field's magnitude channel. Default false. Set true when the map is a smooth field (e.g. a depth gradient) so the lines actually follow it.
- `map` — Optional direction field as JSX. When provided, switches to field-aligned mode and the hatching follows the field.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `HatchProps` | - |

#### Returns

`Element`

***

### HueRotate()

> **HueRotate**(`props`): `Element`

Defined in: [Effects/HueRotate.tsx:65](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/HueRotate.tsx#L65)

Rotates the hue of each pixel in HSL color space.

- `angle` — Hue rotation in degrees. 180 inverts all colors; 360 returns to original.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `HueRotateProps` | - |

#### Returns

`Element`

***

### ImageLUT()

> **ImageLUT**(`props`): `Element`

Defined in: [Effects/ImageLUT.tsx:120](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/ImageLUT.tsx#L120)

Applies a 3D LUT from an image file (PNG strip of horizontal slices) for color grading.

- `src` — URL to the LUT image.
- `size` — Grid dimension of the LUT (e.g., 16 for a 16x16x16 LUT).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ImageLUTProps` | - |

#### Returns

`Element`

***

### Invert()

> **Invert**(`props`): `Element`

Defined in: [Effects/Invert.tsx:45](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Invert.tsx#L45)

Inverts pixel colors.

- `amount` — Inversion amount. 0 is unchanged, 1 is fully inverted. Default 1.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `InvertProps` | - |

#### Returns

`Element`

***

### LIC()

> **LIC**(`props`): `Element`

Defined in: [Effects/LIC.tsx:239](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/LIC.tsx#L239)

Smears the children along a direction field, producing streamline-aligned
output — the look you'd use to visualize a vector field or to drive
field-following stylization. Pair with `Direction` passed via `map` to
derive the field from an image.

Requires the `map` prop. Without one the effect throws.

- `length` — Streamline length in steps per direction (forward and backward). Higher values produce longer smears. Default 20.
- `stepSize` — Step size in pixels per integration step. Default 1.
- `uniformStep` — Walk at a constant step length, ignoring the field's magnitude channel. Default false — step length scales with magnitude, which suits visualizing the field but can stall on smooth fields. Set true to follow a smooth field (e.g. a depth gradient) at full distance.
- `map` — Required. Vector field as JSX (typically a `Direction`-style encoding).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LICProps` | - |

#### Returns

`Element`

***

### LICGpu()

> **LICGpu**(`props`): `Element`

Defined in: [Effects/LICGpu.tsx:29](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/LICGpu.tsx#L29)

WebGPU-backed `LIC` — line integral convolution accelerated by hardware
bilinear texture sampling. Public API matches `LIC` exactly. Throws (via
`RasterEffect`'s `reportError`) when WebGPU is unavailable; use `LIC` as
the universal-support fallback.

Requires the `map` prop. Without one the effect throws.

- `length` — Streamline length in steps per direction (forward and backward). Higher values produce longer smears. Default 20.
- `stepSize` — Step size in pixels per integration step. Default 1.
- `uniformStep` — Walk at a constant step length, ignoring the field's magnitude channel. Default false.
- `map` — Required. Vector field as JSX (typically a `Direction`-style encoding).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LICGpuProps` | - |

#### Returns

`Element`

***

### LuminanceBands()

> **LuminanceBands**(`props`): `Element`

Defined in: [Effects/LuminanceBands.tsx:133](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/LuminanceBands.tsx#L133)

Quantizes brightness into discrete tiers while leaving color alone — the
cel-shading primitive. Output keeps the original color of each pixel and
only discretizes its shading.

- `bands` — Number of discrete brightness tiers. Minimum 2.
- `thresholds` — Optional explicit tier boundaries (length = `bands - 1`, ascending values in `0..255`). Defaults to equal spacing.
- `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LuminanceBandsProps` | - |

#### Returns

`Element`

***

### Mask()

> **Mask**(`props`): `Element`

Defined in: [Effects/Mask.tsx:60](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Mask.tsx#L60)

Clips its children to a mask supplied via the `map` prop. The mask's alpha
channel — or its luminance, with `source="luminance"` — is multiplied into
the children's alpha; RGB is left untouched.

Use it to confine a result to a shape. Blends and many effects fill
transparent regions — W3C compositing makes an opaque overlay opaque
everywhere it covers — and `Mask` restores the intended silhouette by
clipping the result back to a known shape.

Requires a `map`; without one the effect throws.

- `source` — `"alpha"` (default) reads the map's alpha channel; `"luminance"` reads its brightness (white keeps, black drops).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `MaskProps` | - |

#### Returns

`Element`

***

### Opacity()

> **Opacity**(`props`): `Element`

Defined in: [Effects/Opacity.tsx:65](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Opacity.tsx#L65)

Adjusts pixel opacity by scaling the alpha channel.

- `amount` — Opacity multiplier. 1 is unchanged, 0 is fully transparent. Default 1.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `OpacityProps` | - |

#### Returns

`Element`

***

### Outline()

> **Outline**(`props`): `Element`

Defined in: [Effects/Outline.tsx:121](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Outline.tsx#L121)

Stylized illustrative line art (XDoG) — produces a drawn-on-paper outline
over the image. Output is continuous tonal; chain `<Threshold>` if you want
hard binary outlines.

- `sigma` — Inner line width control in pixels. Larger values produce thicker, softer lines. Default 1.
- `k` — Outer-to-inner radius ratio. Default 1.6.
- `epsilon` — Outline threshold in `[-1, 1]`. Default 0 — uniform regions stay white and only the dark side of edges gets drawn. Negative values thicken strokes; positive values darken low-luminance regions toward sketchy output.
- `phi` — Edge sharpness. Higher is more binary; lower is softer. Default 200.
- `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `OutlineProps` | - |

#### Returns

`Element`

***

### OutlineGpu()

> **OutlineGpu**(`props`): `Element`

Defined in: [Effects/OutlineGpu.tsx:24](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/OutlineGpu.tsx#L24)

GPU-accelerated counterpart to `Outline`. Same prop interface. Throws via
the standard `RasterEffect` error path when WebGPU is unavailable.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `OutlineGpuProps` | - |

#### Returns

`Element`

***

### Posterize()

> **Posterize**(`props`): `Element`

Defined in: [Effects/Posterize.tsx:64](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Posterize.tsx#L64)

Reduces color depth to a fixed number of levels per channel, creating a poster-like flat color effect.

- `levels` — Number of discrete color levels per channel. Minimum 2.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `PosterizeProps` | - |

#### Returns

`Element`

***

### Quantize()

> **Quantize**(`props`): `Element`

Defined in: [Effects/Quantize.tsx:401](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Quantize.tsx#L401)

Maps the image to a restricted color palette — the GIF / pixel-art / retro
look. Either a fixed `palette` (an array of `[r, g, b]` triples) or an
auto-derived palette of `count` colors. `palette` and `count` are mutually
exclusive.

- `palette` — Fixed palette. Mutually exclusive with `count`.
- `count` — Auto-derive a palette of this size from the source. Mutually exclusive with `palette`.
- `dither` — Dithering style. `"none"` (default) is flat nearest-color mapping; `"floyd-steinberg"` is the sharp classic GIF look; `"atkinson"` is the Mac System 1 look; `"bayer-4"` and `"bayer-8"` produce a deterministic ordered crosshatch.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `QuantizeProps` | - |

#### Returns

`Element`

***

### Saturate()

> **Saturate**(`props`): `Element`

Defined in: [Effects/Saturate.tsx:66](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Saturate.tsx#L66)

Adjusts color saturation by interpolating between grayscale and the original color.

- `amount` — Saturation multiplier. 0 is grayscale, 1 is unchanged, greater than 1 oversaturates. Default 1.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `SaturateProps` | - |

#### Returns

`Element`

***

### Sepia()

> **Sepia**(`props`): `Element`

Defined in: [Effects/Sepia.tsx:47](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Sepia.tsx#L47)

Applies a warm sepia tone effect.

- `amount` — Sepia intensity. 0 is unchanged, 1 is fully sepia. Default 1.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `SepiaProps` | - |

#### Returns

`Element`

***

### Sharpen()

> **Sharpen**(`props`): `Element`

Defined in: [Effects/Sharpen.tsx:100](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Sharpen.tsx#L100)

Sharpens the image by enhancing edges against their immediate neighbors.

- `amount` — Sharpening strength. Higher values produce more aggressive edge enhancement.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `SharpenProps` | - |

#### Returns

`Element`

***

### ShockFilter()

> **ShockFilter**(`props`): `Element`

Defined in: [Effects/ShockFilter.tsx:160](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/ShockFilter.tsx#L160)

Iterative edge-aware sharpening — flattens regions and crispens edges into a
clean cartoon / line-drawing look without the ringing of a single-pass
`<Sharpen>`. More iterations push regions further toward flat colour and
harden the edges further; cost scales with `iterations`.

- `iterations` — Number of passes. Default 8.
- `strength` — Per-iteration step size, clamped to ≤ 1. Default 1.
- `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ShockFilterProps` | - |

#### Returns

`Element`

***

### ShockFilterGpu()

> **ShockFilterGpu**(`props`): `Element`

Defined in: [Effects/ShockFilterGpu.tsx:25](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/ShockFilterGpu.tsx#L25)

GPU-accelerated counterpart to `ShockFilter`. The iteration loop stays
entirely on GPU — only the initial upload and final readback cross the
CPU/GPU boundary. Same prop interface as `ShockFilter`.

Throws via the standard `RasterEffect` error path when WebGPU is unavailable.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ShockFilterGpuProps` | - |

#### Returns

`Element`

***

### Threshold()

> **Threshold**(`props`): `Element`

Defined in: [Effects/Threshold.tsx:63](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/Threshold.tsx#L63)

Converts each pixel to pure black or white based on a luminance threshold.

- `threshold` — Luminance threshold (0-255). Pixels at or above become white.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ThresholdProps` | - |

#### Returns

`Element`

## Generative

### ConicGradient()

> **ConicGradient**(`props`): `Element`

Defined in: [Generative/ConicGradient.tsx:63](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Generative/ConicGradient.tsx#L63)

Renders a conic (angular) gradient sweep around a center point at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size. Wrap in a styled div if positioning is needed.

- `width` — Output width in pixels. Required.
- `height` — Output height in pixels. Required.
- `stops` — Array of color stops with `color` and `position` (0-1).
- `centerX` — Horizontal center as a fraction of width. Default 0.5.
- `centerY` — Vertical center as a fraction of height. Default 0.5.
- `startAngle` — Starting angle in degrees. Default 0.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ConicGradientProps` | - |

#### Returns

`Element`

***

### DotPattern()

> **DotPattern**(`props`): `Element`

Defined in: [Generative/DotPattern.tsx:54](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Generative/DotPattern.tsx#L54)

Renders a repeating dot pattern on a regular grid, at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size. Wrap in a styled div if positioning is needed.

- `width` — Output width in pixels. Required.
- `height` — Output height in pixels. Required.
- `seed` — Random seed (reserved for future jitter support).
- `spacing` — Distance between dot centers in pixels.
- `radius` — Dot radius in pixels.
- `color` — Dot fill color.
- `background` — Optional background fill color.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DotPatternProps` | - |

#### Returns

`Element`

***

### GridPattern()

> **GridPattern**(`props`): `Element`

Defined in: [Generative/GridPattern.tsx:65](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Generative/GridPattern.tsx#L65)

Renders a repeating grid of horizontal and vertical lines, at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size. Wrap in a styled div if positioning is needed.

- `width` — Output width in pixels. Required.
- `height` — Output height in pixels. Required.
- `seed` — Random seed (reserved for future jitter support).
- `spacingX` — Horizontal spacing between vertical lines in pixels.
- `spacingY` — Vertical spacing between horizontal lines. Defaults to `spacingX`.
- `thickness` — Line thickness in pixels.
- `color` — Line color.
- `background` — Optional background fill color.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `GridPatternProps` | - |

#### Returns

`Element`

***

### LinearGradient()

> **LinearGradient**(`props`): `Element`

Defined in: [Generative/LinearGradient.tsx:67](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Generative/LinearGradient.tsx#L67)

Renders a linear gradient at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size. Wrap in a styled div if positioning is needed.

- `width` — Output width in pixels. Required.
- `height` — Output height in pixels. Required.
- `stops` — Array of color stops with `color` and `position` (0-1).
- `angle` — Gradient angle in degrees. 0 is left-to-right. Default 0.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LinearGradientProps` | - |

#### Returns

`Element`

***

### LinePattern()

> **LinePattern**(`props`): `Element`

Defined in: [Generative/LinePattern.tsx:72](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Generative/LinePattern.tsx#L72)

Renders a repeating pattern of parallel lines at a configurable angle, at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size. Wrap in a styled div if positioning is needed.

- `width` — Output width in pixels. Required.
- `height` — Output height in pixels. Required.
- `seed` — Random seed (reserved for future jitter support).
- `spacing` — Distance between lines in pixels.
- `thickness` — Line thickness in pixels.
- `angle` — Line angle in degrees. 0 is horizontal. Default 0.
- `color` — Line color.
- `background` — Optional background fill color.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LinePatternProps` | - |

#### Returns

`Element`

***

### ProceduralNoise()

> **ProceduralNoise**(`props`): `Element`

Defined in: [Generative/ProceduralNoise.tsx:71](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Generative/ProceduralNoise.tsx#L71)

Generates procedural noise textures using simplex noise with fractal Brownian motion.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size. Wrap in a styled div if positioning is needed.

- `width` — Output width in pixels. Required.
- `height` — Output height in pixels. Required.
- `type` — Noise algorithm. `"simplex"` or `"perlin"` (uses simplex with seed offset).
- `seed` — Random seed for reproducible patterns.
- `scale` — Frequency scale (shorthand applied to both axes when `scaleX`/`scaleY` are unset). Smaller values produce larger features. Default 0.01.
- `scaleX` — Horizontal frequency scale. Default: equal to `scale`. Supply with `scaleY` to produce anisotropic noise (e.g. fine pore lines along one axis, coarse banding along the other).
- `scaleY` — Vertical frequency scale. Default: equal to `scale`.
- `octaves` — Number of noise layers for fBm detail. Default 1.
- `persistence` — Amplitude falloff per octave. Default 0.5.
- `tint` — RGB tint [r, g, b] (0-255). Default: grayscale.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ProceduralNoiseProps` | - |

#### Returns

`Element`

***

### RadialGradient()

> **RadialGradient**(`props`): `Element`

Defined in: [Generative/RadialGradient.tsx:66](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Generative/RadialGradient.tsx#L66)

Renders a radial gradient radiating from a center point at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size. Wrap in a styled div if positioning is needed.

- `width` — Output width in pixels. Required.
- `height` — Output height in pixels. Required.
- `stops` — Array of color stops with `color` and `position` (0-1).
- `centerX` — Horizontal center as a fraction of width. Default 0.5.
- `centerY` — Vertical center as a fraction of height. Default 0.5.
- `radius` — Gradient radius as a fraction of the smaller dimension. Default 0.5.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `RadialGradientProps` | - |

#### Returns

`Element`

***

### VectorField()

> **VectorField**(`props`): `Element`

Defined in: [Generative/VectorField.tsx:117](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Generative/VectorField.tsx#L117)

Synthesizes a parametric direction field at intrinsic dimensions, emitting the
same three-channel encoding as `Direction` (`R=(cos+1)·127.5`, `G=(sin+1)·127.5`,
`B=magnitude·255`). Drops directly into any field consumer — feed it through the
`map` prop on `LIC` (motion / zoom / spin blur) or magnitude-aware `DisplacementMap`
(twirl / pinch / spherize) or field-aligned `Hatch`.

Like the gradient generatives it produces pixels at intrinsic dimensions: the
host/agent specifies `width` and `height` explicitly. The output is not meant to
be visually readable — it renders as red/green static.

- `width` — Output width in pixels. Required.
- `height` — Output height in pixels. Required.
- `pattern` — `"linear"` (constant `(cos angle, sin angle)`), `"radial"` (unit
  vector pointing outward from the center), or `"tangential"` (radial rotated 90°,
  a swirl).
- `angle` — Direction in degrees for `linear`. 0 is left-to-right. Default 0.
- `centerX` — Horizontal center as a fraction of width, for `radial`/`tangential`. Default 0.5.
- `centerY` — Vertical center as a fraction of height, for `radial`/`tangential`. Default 0.5.
- `magnitude` — B-channel profile over corner-normalized radius `r∈[0,1]`:
  `"constant"` (1 everywhere, default), `"linear"` (`r`, grows outward),
  `"falloff"` (`1−r`, decays outward — bounds a twirl so corners stay put),
  `"bump"` (`4·r·(1−r)`, tent peaking at r=0.5 — bounds a centred bulge so radial
  unit-direction integrates through the origin).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | \{ `angle?`: `number`; `centerX?`: `number`; `centerY?`: `number`; `height`: `number`; `magnitude?`: `MagnitudeProfile`; `pattern`: `VectorFieldPattern`; `width`: `number`; \} | - |
| `props.angle?` | `number` | - |
| `props.centerX?` | `number` | - |
| `props.centerY?` | `number` | - |
| `props.height` | `number` | - |
| `props.magnitude?` | `MagnitudeProfile` | - |
| `props.pattern` | `VectorFieldPattern` | - |
| `props.width` | `number` | - |

#### Returns

`Element`

## Blend Modes

### Color()

> **Color**(`props`): `Element`

Defined in: [BlendModes/Color.tsx:28](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Color.tsx#L28)

Applies the hue and saturation of the blend layer while preserving the luminosity of the base.
Useful for colorizing grayscale images or shifting color tones.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ColorProps` | - |

#### Returns

`Element`

***

### ColorBurn()

> **ColorBurn**(`props`): `Element`

Defined in: [BlendModes/ColorBurn.tsx:26](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/ColorBurn.tsx#L26)

Darkens the base by increasing contrast relative to the blend layer.
Produces deeper shadows than Multiply with more saturated mid-tones.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ColorBurnProps` | - |

#### Returns

`Element`

***

### ColorDodge()

> **ColorDodge**(`props`): `Element`

Defined in: [BlendModes/ColorDodge.tsx:26](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/ColorDodge.tsx#L26)

Brightens the base by decreasing contrast relative to the blend layer.
Produces lighter highlights than Screen with more vivid color shifts.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ColorDodgeProps` | - |

#### Returns

`Element`

***

### Darken()

> **Darken**(`props`): `Element`

Defined in: [BlendModes/Darken.tsx:25](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Darken.tsx#L25)

Keeps the darker of the base or blend value for each channel.
Useful for removing white backgrounds or combining dark elements.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DarkenProps` | - |

#### Returns

`Element`

***

### DarkerColor()

> **DarkerColor**(`props`): `Element`

Defined in: [BlendModes/DarkerColor.tsx:27](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/DarkerColor.tsx#L27)

Compares the overall luminance of base and blend pixels and keeps the darker one.
Unlike Darken, operates on the whole pixel rather than per-channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DarkerColorProps` | - |

#### Returns

`Element`

***

### Difference()

> **Difference**(`props`): `Element`

Defined in: [BlendModes/Difference.tsx:25](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Difference.tsx#L25)

Subtracts the darker color from the lighter for each channel.
Identical layers produce black; useful for comparing or creating inverted effects.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DifferenceProps` | - |

#### Returns

`Element`

***

### Divide()

> **Divide**(`props`): `Element`

Defined in: [BlendModes/Divide.tsx:21](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Divide.tsx#L21)

Divides the base color by the blend color, producing a brightening effect.
Dark blend values create strong brightening; useful for removing color casts.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DivideProps` | - |

#### Returns

`Element`

***

### Exclusion()

> **Exclusion**(`props`): `Element`

Defined in: [BlendModes/Exclusion.tsx:25](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Exclusion.tsx#L25)

Similar to Difference but with lower contrast. Produces a softer inversion effect.
Blending with white inverts the base; blending with black has no effect.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ExclusionProps` | - |

#### Returns

`Element`

***

### HardLight()

> **HardLight**(`props`): `Element`

Defined in: [BlendModes/HardLight.tsx:29](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/HardLight.tsx#L29)

Multiplies dark blend values and screens light blend values.
Like shining a harsh light on the base layer. Inverse of Overlay.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `HardLightProps` | - |

#### Returns

`Element`

***

### HardMix()

> **HardMix**(`props`): `Element`

Defined in: [BlendModes/HardMix.tsx:22](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/HardMix.tsx#L22)

Reduces each channel to fully on or fully off based on Vivid Light thresholding.
Produces posterized, high-contrast results with at most 8 colors.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `HardMixProps` | - |

#### Returns

`Element`

***

### Hue()

> **Hue**(`props`): `Element`

Defined in: [BlendModes/Hue.tsx:28](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Hue.tsx#L28)

Applies the hue of the blend layer while preserving the saturation and luminosity of the base.
Useful for shifting color tones without affecting brightness or intensity.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `HueProps` | - |

#### Returns

`Element`

***

### Lighten()

> **Lighten**(`props`): `Element`

Defined in: [BlendModes/Lighten.tsx:25](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Lighten.tsx#L25)

Keeps the lighter of the base or blend value for each channel.
Useful for removing black backgrounds or combining light elements.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LightenProps` | - |

#### Returns

`Element`

***

### LighterColor()

> **LighterColor**(`props`): `Element`

Defined in: [BlendModes/LighterColor.tsx:27](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/LighterColor.tsx#L27)

Compares the overall luminance of base and blend pixels and keeps the lighter one.
Unlike Lighten, operates on the whole pixel rather than per-channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LighterColorProps` | - |

#### Returns

`Element`

***

### LinearBurn()

> **LinearBurn**(`props`): `Element`

Defined in: [BlendModes/LinearBurn.tsx:21](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/LinearBurn.tsx#L21)

Adds the base and blend values then subtracts 1 per channel. Produces darker results
than Multiply with a linear falloff.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LinearBurnProps` | - |

#### Returns

`Element`

***

### LinearDodge()

> **LinearDodge**(`props`): `Element`

Defined in: [BlendModes/LinearDodge.tsx:21](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/LinearDodge.tsx#L21)

Adds the base and blend values per channel, clamped to white.
Also known as Add. Produces lighter results than Screen with a linear curve.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LinearDodgeProps` | - |

#### Returns

`Element`

***

### LinearLight()

> **LinearLight**(`props`): `Element`

Defined in: [BlendModes/LinearLight.tsx:25](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/LinearLight.tsx#L25)

Combines Linear Burn and Linear Dodge based on the blend brightness.
Burns darks and dodges lights with linear intensity scaling.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LinearLightProps` | - |

#### Returns

`Element`

***

### Luminosity()

> **Luminosity**(`props`): `Element`

Defined in: [BlendModes/Luminosity.tsx:28](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Luminosity.tsx#L28)

Applies the luminosity of the blend layer while preserving the hue and saturation of the base.
Inverse of Color blend mode. Useful for applying tonal values from one image to another.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LuminosityProps` | - |

#### Returns

`Element`

***

### Multiply()

> **Multiply**(`props`): `Element`

Defined in: [BlendModes/Multiply.tsx:21](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Multiply.tsx#L21)

Multiplies base and blend values per channel, producing darker results.
White is transparent; black produces black. Standard darkening mode.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `MultiplyProps` | - |

#### Returns

`Element`

***

### Overlay()

> **Overlay**(`props`): `Element`

Defined in: [BlendModes/Overlay.tsx:29](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Overlay.tsx#L29)

Multiplies dark base values and screens light base values.
Increases contrast while preserving highlights and shadows. Most common contrast blend mode.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `OverlayProps` | - |

#### Returns

`Element`

***

### PinLight()

> **PinLight**(`props`): `Element`

Defined in: [BlendModes/PinLight.tsx:25](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/PinLight.tsx#L25)

Replaces base values depending on the blend brightness. Dark blend values
darken via Darken; light blend values lighten via Lighten.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `PinLightProps` | - |

#### Returns

`Element`

***

### Saturation()

> **Saturation**(`props`): `Element`

Defined in: [BlendModes/Saturation.tsx:28](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Saturation.tsx#L28)

Applies the saturation of the blend layer while preserving the hue and luminosity of the base.
Useful for adjusting color intensity without changing the underlying colors.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `SaturationProps` | - |

#### Returns

`Element`

***

### Screen()

> **Screen**(`props`): `Element`

Defined in: [BlendModes/Screen.tsx:25](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Screen.tsx#L25)

Multiplies the inverse of base and blend, producing lighter results.
Black is transparent; white produces white. Standard lightening mode.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ScreenProps` | - |

#### Returns

`Element`

***

### SoftLight()

> **SoftLight**(`props`): `Element`

Defined in: [BlendModes/SoftLight.tsx:35](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/SoftLight.tsx#L35)

Gently darkens or lightens depending on the blend value.
Like shining a diffused light on the base. Subtler than Overlay or Hard Light.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `SoftLightProps` | - |

#### Returns

`Element`

***

### Subtract()

> **Subtract**(`props`): `Element`

Defined in: [BlendModes/Subtract.tsx:21](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/Subtract.tsx#L21)

Subtracts the blend color from the base color per channel, clamped to black.
Produces dark results; useful for masking or creating silhouettes.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `SubtractProps` | - |

#### Returns

`Element`

***

### VividLight()

> **VividLight**(`props`): `Element`

Defined in: [BlendModes/VividLight.tsx:22](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/BlendModes/VividLight.tsx#L22)

Combines Color Burn and Color Dodge based on the blend brightness.
Dark blend values increase contrast via burn; light values decrease via dodge.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `VividLightProps` | - |

#### Returns

`Element`

## Other

### applyBilateralGpu()

> **applyBilateralGpu**(`pixels`, `spatialSigma`, `colorSigma`): `Promise`\<`ImageData`\>

Defined in: [Effects/applyBilateralGpu.ts:26](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/applyBilateralGpu.ts#L26)

GPU-accelerated bilateral filter. Matches the math of `applyBilateral` (the
CPU peer) within float-precision tolerance — at the eventual Uint8 output a
handful of pixels can differ by ±1 unit vs. the CPU implementation, which
is well below visible threshold.

Throws if WebGPU is unavailable; the caller is responsible for surfacing the
error (typically via `RasterEffect`'s `reportError` path).

Device creation happens per call. The adapter is cached at the
`requireWebGPU` module level; device creation itself is a few-ms operation
that's dominated by the actual filter dispatch + readback for the image
sizes pictel cares about.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `spatialSigma` | `number` |
| `colorSigma` | `number` |

#### Returns

`Promise`\<`ImageData`\>

***

### applyBloomGpu()

> **applyBloomGpu**(`pixels`, `threshold`, `radius`, `intensity`): `Promise`\<`ImageData`\>

Defined in: [Effects/applyBloomGpu.ts:15](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/applyBloomGpu.ts#L15)

GPU-accelerated counterpart to `applyBloom`. Highlight extraction and final
screen-blend composite stay on CPU; the blur-of-highlights step (the
dominant cost at large radius) runs on GPU via `applyBlurGpu`.

Throws if WebGPU is unavailable.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `threshold` | `number` |
| `radius` | `number` |
| `intensity` | `number` |

#### Returns

`Promise`\<`ImageData`\>

***

### applyBlurGpu()

> **applyBlurGpu**(`pixels`, `radius`): `Promise`\<`EffectResult`\>

Defined in: [Effects/applyBlurGpu.ts:22](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/applyBlurGpu.ts#L22)

GPU-accelerated counterpart to `applyUniformBlur`. Mirrors the CPU peer's
three-pass box-blur approximation of a Gaussian (using `boxRadiiForGaussian`)
so output dimensions and overflow match exactly; per-pixel values match
within float-precision tolerance.

Throws if WebGPU is unavailable. No CPU fallback — use `applyUniformBlur`
when WebGPU support isn't guaranteed.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `radius` | `number` |

#### Returns

`Promise`\<`EffectResult`\>

***

### applyDropShadowGpu()

> **applyDropShadowGpu**(`pixels`, `offsetX`, `offsetY`, `blurRadius`, `color`): `Promise`\<`EffectResult`\>

Defined in: [Effects/applyDropShadowGpu.ts:17](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/applyDropShadowGpu.ts#L17)

GPU-accelerated counterpart to `applyDropShadow`. Same math, same output:
the only difference is the mask-blur step runs as a WebGPU separable box
cascade (`applyBlurGpu`) instead of the CPU `applyUniformBlur`. The
surrounding mask-build and color-composite passes stay on CPU — they're
a tiny fraction of total cost and porting them to GPU would only add
upload/readback overhead.

Throws if WebGPU is unavailable.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `offsetX` | `number` |
| `offsetY` | `number` |
| `blurRadius` | `number` |
| `color` | `string` |

#### Returns

`Promise`\<`EffectResult`\>

***

### applyOutlineGpu()

> **applyOutlineGpu**(`pixels`, `sigma`, `kappa`, `epsilon`, `phi`): `Promise`\<`ImageData`\>

Defined in: [Effects/applyOutlineGpu.ts:17](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/applyOutlineGpu.ts#L17)

GPU-accelerated counterpart to `applyOutline` (XDoG). The two Gaussian
blurs at σ and k·σ — the dominant cost — run on GPU via `applyBlurGpu`.
Luminance pack and the XDoG sigmoid combine stay on CPU.

Throws if WebGPU is unavailable.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `sigma` | `number` |
| `kappa` | `number` |
| `epsilon` | `number` |
| `phi` | `number` |

#### Returns

`Promise`\<`ImageData`\>

***

### applyShockFilterGpu()

> **applyShockFilterGpu**(`pixels`, `iterations`, `strength`): `Promise`\<`ImageData`\>

Defined in: [Effects/applyShockFilterGpu.ts:19](https://github.com/visionsofparadise/pictel/blob/main/packages/effects/src/Effects/applyShockFilterGpu.ts#L19)

GPU-accelerated counterpart to `applyShockFilter`. The iteration loop stays
entirely on GPU: each iteration runs (a) one separable-blur pass via the
shared helper (radius 1, "smoothing") and (b) one shock-step compute that
reads the smoothed lum field + the pre-smoothing state and writes the
post-shock state into a ping-pong texture. No CPU readback between
iterations — only one upload at start and one readback at end. This is
Phase 22.4's headline ShockFilter win.

Throws if WebGPU is unavailable.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `iterations` | `number` |
| `strength` | `number` |

#### Returns

`Promise`\<`ImageData`\>
