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

### Bilateral()

> **Bilateral**(`props`): `Element`

Defined in: [Effects/Bilateral.tsx:109](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Bilateral.tsx#L109)

Edge-preserving smoothing via the bilateral filter — Gaussian-weighted average
where the weight depends on both spatial distance and color distance, so pixels
across edges (large color difference) do not blend together.

- `spatialSigma` — Spatial radius in pixels. Sensible values are 2–6.
- `colorSigma` — Color tolerance in 0–255 units. Larger values bridge more across edges.

Cost is `O(W * H * r²)` where `r = ceil(2 * spatialSigma)`. Large `spatialSigma`
values are perceptibly slow on large images.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `BilateralProps` | - |

#### Returns

`Element`

***

### Bloom()

> **Bloom**(`props`): `Element`

Defined in: [Effects/Bloom.tsx:108](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Bloom.tsx#L108)

Bloom — a soft glow bleeding out of an image's bright regions.

Bright pixels are extracted via a quadratic soft-knee threshold on
luminance, blurred, and screen-blended back over the original. The glow is
clipped to the frame (output matches input dimensions).

- `threshold` — Luminance cutoff (0–1) for what counts as a highlight. Default 0.75.
- `radius` — Blur radius of the glow in pixels. Default 16.
- `intensity` — Glow strength multiplier. Default 1.
- `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `BloomProps` | - |

#### Returns

`Element`

***

### Blur()

> **Blur**(`props`): `Element`

Defined in: [Effects/Blur.tsx:294](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Blur.tsx#L294)

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

### Brightness()

> **Brightness**(`props`): `Element`

Defined in: [Effects/Brightness.tsx:60](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Brightness.tsx#L60)

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

Defined in: [Effects/ChannelMixer.tsx:44](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/ChannelMixer.tsx#L44)

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

Defined in: [Effects/ColorGrade.tsx:78](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/ColorGrade.tsx#L78)

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

Defined in: [Effects/Contrast.tsx:60](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Contrast.tsx#L60)

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

Defined in: [Effects/CubeLUT.tsx:120](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/CubeLUT.tsx#L120)

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

Defined in: [Effects/Sobel/Direction.tsx:162](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Sobel/Direction.tsx#L162)

Outputs the gradient field of the input as a packed three-channel encoding
suitable for sampling-correct downstream consumption (e.g. `LIC`, mapped
effects).

- `kernel` — `sobel` (default) or `scharr`.
- `mode` — `gradient` (default) emits the noisy per-pixel gradient direction;
  `structure` emits a smooth contour-following orientation field from the
  structure tensor. This `mode` selects the field type and is unrelated to
  the `"parameter"|"mix"` `mode` on other effects.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DirectionProps` | - |

#### Returns

`Element`

#### Remarks

The output channels are packed as:
- R = cos(theta) packed [-1, 1] -> [0, 255]  (horizontal direction component)
- G = sin(theta) packed [-1, 1] -> [0, 255]  (vertical direction component)
- B = field strength unsigned [0, 1] -> [0, 255]  (gradient magnitude in
  `gradient` mode; structure-tensor coherence in `structure` mode)

This split-component encoding (rather than a single packed angle) avoids the
1 deg / 359 deg wraparound problem so that bilinear sampling of cos and sin
separately, followed by `atan2(sin', cos')`, yields a correct interpolated
direction at fractional positions.

The packed output does NOT visualize as a recognizable image in DevTools —
it appears as red/green static. This is by design (correctness over visual
readability). To visually inspect direction, decode in a custom effect.

***

### DisplacementMap()

> **DisplacementMap**(`props`): `Element`

Defined in: [Effects/DisplacementMap.tsx:62](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/DisplacementMap.tsx#L62)

Displaces pixels using the `map` prop's red and green channels for X and Y offset.
Supply a `map` prop providing the displacement source.

- `scaleX` — Maximum horizontal displacement in pixels. Default 20.
- `scaleY` — Maximum vertical displacement in pixels. Default 20.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DisplacementMapProps` | - |

#### Returns

`Element`

***

### DropShadow()

> **DropShadow**(`props`): `Element`

Defined in: [Effects/DropShadow.tsx:138](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/DropShadow.tsx#L138)

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

### Duotone()

> **Duotone**(`props`): `Element`

Defined in: [Effects/Duotone.tsx:49](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Duotone.tsx#L49)

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

Defined in: [Effects/Sobel/EdgeDetect.tsx:56](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Sobel/EdgeDetect.tsx#L56)

Outputs the gradient magnitude of the input as a continuous grayscale field.

Useful as a building block for masking, displacement, and stylized looks.
Pre-blur the input (chain `<Blur>`) for cleaner, less noise-driven edges.

- `kernel` — `sobel` (default) or `scharr`. Scharr has a larger response and
  is more rotationally symmetric.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `EdgeDetectProps` | - |

#### Returns

`Element`

***

### Engrave()

> **Engrave**(`props`): `Element`

Defined in: [Effects/Engrave.tsx:99](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Engrave.tsx#L99)

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

### Grain()

> **Grain**(`props`): `Element`

Defined in: [Effects/Grain.tsx:47](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Grain.tsx#L47)

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

Defined in: [Effects/Grayscale.tsx:43](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Grayscale.tsx#L43)

Converts pixels to grayscale using BT.601 luminance weighting.

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

Defined in: [Effects/Halftone.tsx:207](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Halftone.tsx#L207)

Converts the image to a halftone pattern.

In the default `"luminance"` mode, dot radius varies with local luminance
and dots are stamped in `dotColor` on white — a Ben-Day screen.

In `"cmyk"` mode it produces a true process halftone: the image is separated
into Cyan / Magenta / Yellow / Key channels (via gray-component replacement),
each channel is screened on its own grid rotated to its classic process
angle (Cyan 15°, Magenta 75°, Yellow 0°, Key 45°), dots are stamped in their
ink color and overprinted with multiply compositing — color emerges from the
overlapping colored dots, the true process-print look.

In `"color"` mode it produces a single-screen color halftone: one shared
grid, each cell stamped as one dot in that cell's own average color. With no
overlapping screens there is nothing to misregister — the clean comic-dot
look, and the mode to reach for in a pop-art treatment.

- `dotSize` — Grid cell size in pixels. Larger values produce coarser halftone.
- `angle` — Rotation of the dot grid in degrees (`"luminance"`/`"color"` modes only). Default 0.
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

Defined in: [Effects/Hatch.tsx:226](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Hatch.tsx#L226)

Hatching effect. Bands the source into tonal tiers (Grayscale → Posterize)
and renders per-band line layers, multiplied onto a white background. Two
modes:

- **Constant-angle** (no `map` prop): each band uses a fixed angle and
  spacing. Pass `angles` and `spacing` arrays of length `bands`.
- **Field-aligned** (with `map` prop): each band's lines are produced by
  running an isotropic binary-noise seed through LIC along the supplied
  vector field, then sharpening the result into crisp ink. The streamlines
  curve to follow the field in every orientation. The map is expected to be
  a Direction-style cos/sin/magnitude encoding (see `Direction`). Per-band
  `spacing` sets the noise density (`min(0.5, 2 / spacing)`) and so the
  tonal progression. For a smooth field (e.g. a structure-tensor field), set
  `uniformStep` so the lines follow it — the default magnitude-gated step
  stalls on smooth fields.

The lightest band draws no lines — it stays pure white. Output preserves
the source alpha.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `HatchProps` | - |

#### Returns

`Element`

***

### HueRotate()

> **HueRotate**(`props`): `Element`

Defined in: [Effects/HueRotate.tsx:66](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/HueRotate.tsx#L66)

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

Defined in: [Effects/ImageLUT.tsx:90](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/ImageLUT.tsx#L90)

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

Defined in: [Effects/Invert.tsx:40](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Invert.tsx#L40)

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

Defined in: [Effects/LIC.tsx:163](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/LIC.tsx#L163)

Line Integral Convolution. Smears the seed children along a vector field
supplied by the `map` prop, producing streamline-aligned output. The map
is expected to be a Direction-style three-channel encoding: red = cos(θ)
packed into [0,255], green = sin(θ) packed into [0,255], blue = magnitude
in [0,255].

Requires a `map` prop providing the vector field. Without a map the
effect throws — LIC has no meaning without a field.

Reference: Cabral & Leedom 1993, "Imaging Vector Fields Using Line Integral
Convolution".

- `length` — Number of integration steps in each direction (forward and backward). Default 20.
- `stepSize` — Base step size in pixels per integration step. Default 1.0.
- `uniformStep` — Integrate at a constant step length, ignoring the field's magnitude channel. Default false. Set true to follow a smooth field (e.g. a depth gradient) at full integration distance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LICProps` | - |

#### Returns

`Element`

***

### LuminanceBands()

> **LuminanceBands**(`props`): `Element`

Defined in: [Effects/LuminanceBands.tsx:119](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/LuminanceBands.tsx#L119)

Quantizes luminance into discrete tiers while preserving chrominance, the cel-shading primitive.

Splits each pixel into YCbCr (ITU-R BT.601), quantizes Y into `bands` tiers, then recombines
with the original Cb/Cr. Output keeps original color, discretizes shading.

- `bands` — Number of discrete luminance tiers. Minimum 2.
- `thresholds` — Optional explicit tier boundaries (length = bands - 1, ascending values in 0..255). Defaults to equal spacing.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LuminanceBandsProps` | - |

#### Returns

`Element`

***

### Mask()

> **Mask**(`props`): `Element`

Defined in: [Effects/Mask.tsx:62](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Mask.tsx#L62)

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

Defined in: [Effects/Opacity.tsx:60](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Opacity.tsx#L60)

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

Defined in: [Effects/Outline.tsx:128](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Outline.tsx#L128)

XDoG (Extended Difference of Gaussians) — stylized illustrative line art.

Two Gaussian blurs at σ and k·σ are subtracted then mapped through a soft
tanh sigmoid to produce a drawn-looking edge response. Output is continuous
tonal; chain `Threshold` if you want hard binary outlines.

- `sigma` — Inner Gaussian σ in pixels. Default 1.
- `k` — Outer-to-inner σ ratio. Default 1.6 (Winnemöller et al. 2012).
- `epsilon` — XDoG threshold (normalized [-1, 1]). Default 0 — produces canonical "drawn on white paper" output where uniform regions of any luminance stay white and only edge dark sides get drawn.
- `phi` — Sigmoid sharpness. Higher → more binary; lower → softer. Default 200.
- `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `OutlineProps` | - |

#### Returns

`Element`

***

### Posterize()

> **Posterize**(`props`): `Element`

Defined in: [Effects/Posterize.tsx:59](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Posterize.tsx#L59)

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

Defined in: [Effects/Quantize.tsx:323](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Quantize.tsx#L323)

Maps the image to a restricted color palette. Either a fixed `palette` (an
array of `[r, g, b]` triples) or an auto-derived palette of `count` colors
via median-cut. `palette` and `count` are mutually exclusive.

Dither modes:
- `"none"` — flat nearest-color mapping
- `"floyd-steinberg"` — error diffusion (sharp, classic GIF look)
- `"atkinson"` — error diffusion with 6/8 propagation (Mac System 1 look)
- `"bayer-4"` / `"bayer-8"` — ordered dithering (deterministic crosshatch pattern)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `QuantizeProps` | - |

#### Returns

`Element`

***

### Saturate()

> **Saturate**(`props`): `Element`

Defined in: [Effects/Saturate.tsx:63](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Saturate.tsx#L63)

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

Defined in: [Effects/Sepia.tsx:48](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Sepia.tsx#L48)

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

Defined in: [Effects/Sharpen.tsx:101](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Sharpen.tsx#L101)

Sharpens the image using a 3x3 unsharp mask convolution.

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

Defined in: [Effects/ShockFilter.tsx:152](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/ShockFilter.tsx#L152)

Regularized iterative shock filter — sharpens an image into a clean
cartoon / line-drawing.

Each iteration presmooths the image, then takes one Osher–Rudin shock step
(dilate toward the bright side of each edge, erode toward the dark side).
Iterating converges to piecewise-flat regions separated by crisp edges, with
no ringing — unlike a single-pass `Sharpen`. Cost is `O(W*H*iterations)`.

- `iterations` — Number of blur-then-sharpen passes. Default 8.
- `strength` — Shock step size per iteration (clamped to ≤ 1). Default 1.
- `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ShockFilterProps` | - |

#### Returns

`Element`

***

### Threshold()

> **Threshold**(`props`): `Element`

Defined in: [Effects/Threshold.tsx:59](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Effects/Threshold.tsx#L59)

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

Defined in: [Generative/ConicGradient.tsx:69](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Generative/ConicGradient.tsx#L69)

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

Defined in: [Generative/DotPattern.tsx:61](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Generative/DotPattern.tsx#L61)

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

Defined in: [Generative/GridPattern.tsx:73](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Generative/GridPattern.tsx#L73)

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

Defined in: [Generative/LinearGradient.tsx:71](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Generative/LinearGradient.tsx#L71)

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

Defined in: [Generative/LinePattern.tsx:80](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Generative/LinePattern.tsx#L80)

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

Defined in: [Generative/ProceduralNoise.tsx:72](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Generative/ProceduralNoise.tsx#L72)

Generates procedural noise textures using simplex noise with fractal Brownian motion.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size. Wrap in a styled div if positioning is needed.

- `width` — Output width in pixels. Required.
- `height` — Output height in pixels. Required.
- `type` — Noise algorithm. `"simplex"` or `"perlin"` (uses simplex with seed offset).
- `seed` — Random seed for reproducible patterns.
- `scale` — Frequency scale. Smaller values produce larger features. Default 0.01.
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

Defined in: [Generative/RadialGradient.tsx:72](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/Generative/RadialGradient.tsx#L72)

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

## Blend Modes

### Color()

> **Color**(`props`): `Element`

Defined in: [BlendModes/Color.tsx:28](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Color.tsx#L28)

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

Defined in: [BlendModes/ColorBurn.tsx:26](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/ColorBurn.tsx#L26)

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

Defined in: [BlendModes/ColorDodge.tsx:26](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/ColorDodge.tsx#L26)

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

Defined in: [BlendModes/Darken.tsx:25](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Darken.tsx#L25)

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

Defined in: [BlendModes/DarkerColor.tsx:27](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/DarkerColor.tsx#L27)

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

Defined in: [BlendModes/Difference.tsx:25](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Difference.tsx#L25)

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

Defined in: [BlendModes/Divide.tsx:21](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Divide.tsx#L21)

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

Defined in: [BlendModes/Exclusion.tsx:25](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Exclusion.tsx#L25)

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

Defined in: [BlendModes/HardLight.tsx:29](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/HardLight.tsx#L29)

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

Defined in: [BlendModes/HardMix.tsx:22](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/HardMix.tsx#L22)

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

Defined in: [BlendModes/Hue.tsx:28](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Hue.tsx#L28)

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

Defined in: [BlendModes/Lighten.tsx:25](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Lighten.tsx#L25)

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

Defined in: [BlendModes/LighterColor.tsx:27](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/LighterColor.tsx#L27)

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

Defined in: [BlendModes/LinearBurn.tsx:21](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/LinearBurn.tsx#L21)

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

Defined in: [BlendModes/LinearDodge.tsx:21](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/LinearDodge.tsx#L21)

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

Defined in: [BlendModes/LinearLight.tsx:25](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/LinearLight.tsx#L25)

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

Defined in: [BlendModes/Luminosity.tsx:28](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Luminosity.tsx#L28)

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

Defined in: [BlendModes/Multiply.tsx:21](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Multiply.tsx#L21)

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

Defined in: [BlendModes/Overlay.tsx:29](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Overlay.tsx#L29)

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

Defined in: [BlendModes/PinLight.tsx:25](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/PinLight.tsx#L25)

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

Defined in: [BlendModes/Saturation.tsx:28](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Saturation.tsx#L28)

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

Defined in: [BlendModes/Screen.tsx:25](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Screen.tsx#L25)

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

Defined in: [BlendModes/SoftLight.tsx:35](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/SoftLight.tsx#L35)

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

Defined in: [BlendModes/Subtract.tsx:21](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/Subtract.tsx#L21)

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

Defined in: [BlendModes/VividLight.tsx:22](https://github.com/visionsofparadise/pictel/blob/ad23fcd4584433d37f032efe1c09b97f5cf2b6d0/packages/effects/src/BlendModes/VividLight.tsx#L22)

Combines Color Burn and Color Dodge based on the blend brightness.
Dark blend values increase contrast via burn; light values decrease via dodge.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `VividLightProps` | - |

#### Returns

`Element`
