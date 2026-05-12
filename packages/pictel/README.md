# pictel

## Layout

### Canvas()

> **Canvas**(`props`): `Element`

Defined in: [Components/Canvas.tsx:68](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Canvas.tsx#L68)

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

Defined in: [Components/Viewer.tsx:43](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Viewer.tsx#L43)

Development preview shell that renders one or more Canvas components.
Provides a sidebar for selecting between canvases when multiple are present.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ViewerProps` | - |

#### Returns

`Element`

## Effects

### Bilateral()

> **Bilateral**(`props`): `Element`

Defined in: [Components/Effects/Bilateral.tsx:109](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Bilateral.tsx#L109)

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

### Blur()

> **Blur**(`props`): `Element`

Defined in: [Components/Effects/Blur.tsx:302](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Blur.tsx#L302)

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

Defined in: [Components/Effects/Brightness.tsx:60](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Brightness.tsx#L60)

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

Defined in: [Components/Effects/ChannelMixer.tsx:44](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/ChannelMixer.tsx#L44)

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

Defined in: [Components/Effects/ColorGrade.tsx:83](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/ColorGrade.tsx#L83)

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

Defined in: [Components/Effects/Contrast.tsx:60](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Contrast.tsx#L60)

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

Defined in: [Components/Effects/CubeLUT.tsx:120](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/CubeLUT.tsx#L120)

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

Defined in: [Components/Effects/Sobel/Direction.tsx:93](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sobel/Direction.tsx#L93)

Outputs the gradient field of the input as a packed three-channel encoding
suitable for sampling-correct downstream consumption (e.g. `LIC`, mapped
effects).

- `kernel` — `sobel` (default) or `scharr`.

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
- B = magnitude unsigned [0, 1] -> [0, 255]  (normalized against the kernel's max response)

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

Defined in: [Components/Effects/DisplacementMap.tsx:62](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/DisplacementMap.tsx#L62)

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

Defined in: [Components/Effects/DropShadow.tsx:209](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/DropShadow.tsx#L209)

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

Defined in: [Components/Effects/Duotone.tsx:49](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Duotone.tsx#L49)

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

Defined in: [Components/Effects/Sobel/EdgeDetect.tsx:63](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sobel/EdgeDetect.tsx#L63)

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

### Grain()

> **Grain**(`props`): `Element`

Defined in: [Components/Effects/Grain.tsx:58](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Grain.tsx#L58)

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

Defined in: [Components/Effects/Grayscale.tsx:43](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Grayscale.tsx#L43)

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

Defined in: [Components/Effects/Halftone.tsx:121](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Halftone.tsx#L121)

Converts the image to a halftone pattern. Dot radius varies with local luminance.

- `dotSize` — Grid cell size in pixels. Larger values produce coarser halftone.
- `angle` — Rotation angle of the dot grid in degrees. Default 0.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `HalftoneProps` | - |

#### Returns

`Element`

***

### Hatch()

> **Hatch**(`props`): `Element`

Defined in: [Components/Effects/Hatch.tsx:241](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Hatch.tsx#L241)

Hatching effect. Bands the source into tonal tiers (Grayscale → Posterize)
and renders per-band line layers, multiplied onto a white background. Two
modes:

- **Constant-angle** (no `map` prop): each band uses a fixed angle and
  spacing. Pass `angles` and `spacing` arrays of length `bands`.
- **Field-aligned** (with `map` prop): each band's lines integrate along
  the supplied vector field via LIC. The map is expected to be a
  Direction-style cos/sin/magnitude encoding (see `Direction`).

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

Defined in: [Components/Effects/HueRotate.tsx:66](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/HueRotate.tsx#L66)

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

Defined in: [Components/Effects/ImageLUT.tsx:90](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/ImageLUT.tsx#L90)

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

Defined in: [Components/Effects/Invert.tsx:40](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Invert.tsx#L40)

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

Defined in: [Components/Effects/LIC.tsx:172](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/LIC.tsx#L172)

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

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LICProps` | - |

#### Returns

`Element`

***

### LuminanceBands()

> **LuminanceBands**(`props`): `Element`

Defined in: [Components/Effects/LuminanceBands.tsx:119](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/LuminanceBands.tsx#L119)

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

### Opacity()

> **Opacity**(`props`): `Element`

Defined in: [Components/Effects/Opacity.tsx:60](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Opacity.tsx#L60)

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

Defined in: [Components/Effects/Outline.tsx:154](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Outline.tsx#L154)

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

Defined in: [Components/Effects/Posterize.tsx:59](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Posterize.tsx#L59)

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

Defined in: [Components/Effects/Quantize.tsx:358](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Quantize.tsx#L358)

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

Defined in: [Components/Effects/Saturate.tsx:63](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Saturate.tsx#L63)

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

Defined in: [Components/Effects/Sepia.tsx:48](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sepia.tsx#L48)

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

Defined in: [Components/Effects/Sharpen.tsx:101](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sharpen.tsx#L101)

Sharpens the image using a 3x3 unsharp mask convolution.

- `amount` — Sharpening strength. Higher values produce more aggressive edge enhancement.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `SharpenProps` | - |

#### Returns

`Element`

***

### Threshold()

> **Threshold**(`props`): `Element`

Defined in: [Components/Effects/Threshold.tsx:59](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Threshold.tsx#L59)

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

Defined in: [Components/Generative/ConicGradient.tsx:64](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/ConicGradient.tsx#L64)

Renders a conic (angular) gradient sweep around a center point at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size — the host CSS positions or scales the natural pixel footprint visually if needed.

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

Defined in: [Components/Generative/DotPattern.tsx:61](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/DotPattern.tsx#L61)

Renders a repeating dot pattern on a regular grid, at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size — the host CSS positions or scales the natural pixel footprint visually if needed.

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

Defined in: [Components/Generative/GridPattern.tsx:73](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/GridPattern.tsx#L73)

Renders a repeating grid of horizontal and vertical lines, at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size — the host CSS positions or scales the natural pixel footprint visually if needed.

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

Defined in: [Components/Generative/LinearGradient.tsx:66](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/LinearGradient.tsx#L66)

Renders a linear gradient at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size — the host CSS positions or scales the natural pixel footprint visually if needed.

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

Defined in: [Components/Generative/LinePattern.tsx:80](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/LinePattern.tsx#L80)

Renders a repeating pattern of parallel lines at a configurable angle, at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size — the host CSS positions or scales the natural pixel footprint visually if needed.

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

Defined in: [Components/Generative/ProceduralNoise.tsx:69](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/ProceduralNoise.tsx#L69)

Generates procedural noise textures using simplex noise with fractal Brownian motion.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size — the host CSS positions or scales the natural pixel footprint visually if needed.

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

Defined in: [Components/Generative/RadialGradient.tsx:67](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/RadialGradient.tsx#L67)

Renders a radial gradient radiating from a center point at intrinsic dimensions.

Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
`width` and `height` explicitly. The component does not respond to its container's
size — the host CSS positions or scales the natural pixel footprint visually if needed.

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

Defined in: [Components/BlendModes/Color.tsx:28](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Color.tsx#L28)

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

Defined in: [Components/BlendModes/ColorBurn.tsx:26](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/ColorBurn.tsx#L26)

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

Defined in: [Components/BlendModes/ColorDodge.tsx:26](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/ColorDodge.tsx#L26)

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

Defined in: [Components/BlendModes/Darken.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Darken.tsx#L25)

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

Defined in: [Components/BlendModes/DarkerColor.tsx:27](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/DarkerColor.tsx#L27)

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

Defined in: [Components/BlendModes/Difference.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Difference.tsx#L25)

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

Defined in: [Components/BlendModes/Divide.tsx:21](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Divide.tsx#L21)

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

Defined in: [Components/BlendModes/Exclusion.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Exclusion.tsx#L25)

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

Defined in: [Components/BlendModes/HardLight.tsx:29](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/HardLight.tsx#L29)

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

Defined in: [Components/BlendModes/HardMix.tsx:22](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/HardMix.tsx#L22)

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

Defined in: [Components/BlendModes/Hue.tsx:28](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Hue.tsx#L28)

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

Defined in: [Components/BlendModes/Lighten.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Lighten.tsx#L25)

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

Defined in: [Components/BlendModes/LighterColor.tsx:27](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/LighterColor.tsx#L27)

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

Defined in: [Components/BlendModes/LinearBurn.tsx:21](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/LinearBurn.tsx#L21)

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

Defined in: [Components/BlendModes/LinearDodge.tsx:21](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/LinearDodge.tsx#L21)

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

Defined in: [Components/BlendModes/LinearLight.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/LinearLight.tsx#L25)

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

Defined in: [Components/BlendModes/Luminosity.tsx:28](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Luminosity.tsx#L28)

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

Defined in: [Components/BlendModes/Multiply.tsx:21](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Multiply.tsx#L21)

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

Defined in: [Components/BlendModes/Overlay.tsx:29](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Overlay.tsx#L29)

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

Defined in: [Components/BlendModes/PinLight.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/PinLight.tsx#L25)

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

Defined in: [Components/BlendModes/Saturation.tsx:28](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Saturation.tsx#L28)

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

Defined in: [Components/BlendModes/Screen.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Screen.tsx#L25)

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

Defined in: [Components/BlendModes/SoftLight.tsx:35](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/SoftLight.tsx#L35)

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

Defined in: [Components/BlendModes/Subtract.tsx:21](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Subtract.tsx#L21)

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

Defined in: [Components/BlendModes/VividLight.tsx:22](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/VividLight.tsx#L22)

Combines Color Burn and Color Dodge based on the blend brightness.
Dark blend values increase contrast via burn; light values decrease via dodge.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `VividLightProps` | - |

#### Returns

`Element`

## Pipeline

### Clip()

> **Clip**(`props`): `Element`

Defined in: [Components/Pipeline/Clip.tsx:19](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Pipeline/Clip.tsx#L19)

Clips a wrapped pipeline's bleed back to its content footprint.

Composes `Overflow` — which exposes bleed at natural pixel ratio — inside
an `overflow: hidden` container sized to the pipeline's content. The bleed
extends outside the pipeline via `Overflow` and is then cropped at the
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

Defined in: [Components/Pipeline/Overflow.tsx:26](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Pipeline/Overflow.tsx#L26)

Reveals a wrapped pipeline's bleed at natural pixel ratio.

By default a pipeline's canvas element fills the pipeline's content box
(children size) at `width: 100%; height: 100%`, so when an effect produces
bleed (Blur halo, drop shadow falloff, etc.) the canvas pixels are squished
into the content footprint. Overflow reads the pipeline's
`data-pictel-overflow-top/right/bottom/left` attributes and expands the
pipeline's raster wrapper (`[data-pictel-raster]`) outside the pipeline
bounds so the canvas renders at its natural pixel ratio. The bleed extends
visibly outside the pipeline box.

Only acts when the wrapped pipeline is not pending; during pending/initial
state the pipeline renders plain. Composes with an outer `overflow: hidden`
wrapper (see `Clip`) to crop the bleed back to content size.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `OverflowProps` | - |

#### Returns

`Element`

***

### Pipeline()

> **Pipeline**(`props`): `Element`

Defined in: Components/Pipeline/Pipeline.tsx:68

Unified pipeline primitive. Handles all effect and blend cases through
prop-carried secondary inputs.

DOM structure:
1. `<div ref={childrenRef}>{children}</div>` — in flow, drives layout
2. Offscreen apply container (only when `apply` prop is set)
3. Offscreen map container (only when `map` prop is set)
4. `<div ref={rasterRef} data-pictel-raster>` — absolute canvas overlay

All three wrappers (children, apply, map) are observed for changes and
captured in parallel via snapdom (or fast path when eligible).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `PipelineProps` | - |

#### Returns

`Element`

## Other

### CanvasDimensions

Defined in: [context/canvas.ts:10](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/context/canvas.ts#L10)

Fixed pixel dimensions for the canvas's compositing buffer. The capture
pipeline rasterizes to exactly these dimensions; visual scale (preview
fit-to-viewport, display fit-to-container) is applied by Frame as a CSS
transform and does not affect buffer size.

***

### PipelineCallback

> **PipelineCallback** = (`target`, `apply?`, `map?`) => `ImageData` \| `EffectResult` \| `Promise`\<`ImageData` \| `EffectResult`\>

Defined in: Components/Pipeline/Pipeline.tsx:19

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

### applyDirection()

> **applyDirection**(`pixels`, `kernel`): `ImageData`

Defined in: [Components/Effects/Sobel/Direction.tsx:23](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sobel/Direction.tsx#L23)

Compute the per-pixel gradient direction and magnitude using Sobel or Scharr
kernels and emit the result as a packed three-channel field:

- R = (cos(theta) + 1) * 127.5    -- horizontal direction component, [-1, 1] -> [0, 255]
- G = (sin(theta) + 1) * 127.5    -- vertical direction component,   [-1, 1] -> [0, 255]
- B = magnitude / maxResponse * 255 -- gradient strength,            [0, 1]  -> [0, 255]
- A = source alpha

Pixels with magnitude below `1e-6 * maxResponse` are emitted as
`R=128, G=128, B=0` (neutral direction, zero magnitude). The cos/sin
components are kept as floats until the final byte conversion to avoid
accumulated rounding error.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `kernel` | `"sobel"` \| `"scharr"` |

#### Returns

`ImageData`

***

### applyEdgeDetect()

> **applyEdgeDetect**(`pixels`, `kernel`): `ImageData`

Defined in: [Components/Effects/Sobel/EdgeDetect.tsx:16](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sobel/EdgeDetect.tsx#L16)

Compute per-pixel gradient magnitude using Sobel or Scharr kernels and emit
the result as a grayscale ImageData (R=G=B=magnitude byte, alpha preserved).

Magnitude is normalized against the kernel's theoretical maximum response so
the output spans the full 0..255 byte range regardless of kernel choice.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `kernel` | `"sobel"` \| `"scharr"` |

#### Returns

`ImageData`

***

### applyHatch()

> **applyHatch**(`pixels`, `bands`, `angles`, `spacing`): `ImageData`

Defined in: [Components/Effects/Hatch.tsx:46](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Hatch.tsx#L46)

Constant-angle hatching. Bands the source image into `bands` tonal tiers
(Grayscale → Posterize) and overlays a per-band line pattern at
`angles[b]` with `spacing[b]`. The lightest band draws no lines (pure
white). Lines are composited via Multiply, so darker bands accumulate
darker hatching. Output preserves the source alpha.

Angle convention (matches CSS `linear-gradient`, SVG, and standard graphics
tools): `angle=0` produces horizontal lines, `angle=π/2` produces vertical
lines, increasing CCW. The angle names the line orientation, not the line
normal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `bands` | `number` |
| `angles` | `number`[] |
| `spacing` | `number`[] |

#### Returns

`ImageData`

***

### applyHatchFieldAligned()

> **applyHatchFieldAligned**(`pixels`, `field`, `bands`, `spacing`, `length`, `stepSize`): `ImageData`

Defined in: [Components/Effects/Hatch.tsx:148](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Hatch.tsx#L148)

Field-aligned hatching. Same banding pipeline as `applyHatch`, but each
band's line layer is generated by passing a vertical-stripe seed through
`applyLIC` with the supplied `field`. Stripes deform along the field's
streamlines, producing engraving-like hatching that follows the underlying
direction map.

Cost: a full LIC integration runs per band — `O(width * height * length *
bands)` sample reads. For `bands=4`, `length=20`, 1080×1080 the cost is on
the order of 93M sample reads; acceptable for static demos.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `field` | `ImageData` |
| `bands` | `number` |
| `spacing` | `number`[] |
| `length` | `number` |
| `stepSize` | `number` |

#### Returns

`ImageData`

***

### applyLIC()

> **applyLIC**(`seed`, `field`, `length`, `stepSize`): `ImageData`

Defined in: [Components/Effects/LIC.tsx:61](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/LIC.tsx#L61)

Line Integral Convolution: integrate `seed` along the vector field encoded
in `field`, producing streamline-aligned output. The field is decoded as
`cos = R/127.5 - 1`, `sin = G/127.5 - 1`, `magnitude = B/255` — the
Direction-style cos/sin/magnitude pack.

For each output pixel, a forward and a backward Euler integration of
`length` steps is performed, sampling the seed bilinearly at each step and
accumulating with hat-function weighting `w = 1 - i / length`. Per-pixel
step length scales with magnitude as `stepSize * (0.25 + 0.75 * magnitude)`
— the floor at 25% prevents stagnation in zero-magnitude regions while
full-magnitude regions step the full distance.

Out-of-bounds samples are clamped to the edge pixel (extension by clamping).

Reference: Cabral & Leedom 1993, "Imaging Vector Fields Using Line Integral
Convolution".

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `seed` | `ImageData` |
| `field` | `ImageData` |
| `length` | `number` |
| `stepSize` | `number` |

#### Returns

`ImageData`

***

### applyMappedOutline()

> **applyMappedOutline**(`pixels`, `map`, `sigma`, `kappa`, `epsilon`, `phi`): `ImageData`

Defined in: [Components/Effects/Outline.tsx:108](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Outline.tsx#L108)

Map-driven XDoG outline. The outline is computed from the source pixels and
then mixed back with the original by map luminance: black map → original,
white map → fully outlined.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `map` | `ImageData` |
| `sigma` | `number` |
| `kappa` | `number` |
| `epsilon` | `number` |
| `phi` | `number` |

#### Returns

`ImageData`

***

### applyMappedQuantize()

> **applyMappedQuantize**(`pixels`, `map`, `palette`, `dither?`): `ImageData`

Defined in: [Components/Effects/Quantize.tsx:320](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Quantize.tsx#L320)

Same as `applyQuantize` but the quantized result is mixed with the original
pixels by the map's luminance. Map=black returns the original; map=white
returns the fully quantized output.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `pixels` | `ImageData` | `undefined` |
| `map` | `ImageData` | `undefined` |
| `palette` | readonly `Rgb`[] | `undefined` |
| `dither` | `DitherMode` | `"none"` |

#### Returns

`ImageData`

***

### applyOutline()

> **applyOutline**(`pixels`, `sigma`, `kappa`, `epsilon`, `phi`): `ImageData`

Defined in: [Components/Effects/Outline.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Outline.tsx#L25)

XDoG (Extended Difference of Gaussians) line-art outline.

Algorithm (Winnemöller et al. 2012, stylized formulation):
`S = (1 + τ)·G_σ − τ·G_kσ` — the inner Gaussian with the high-frequency
component amplified by τ. Equivalent to `G_σ + τ·(G_σ − G_kσ)`. Uniform
regions reproduce as G_σ ≈ I, so they sit at their original luminance and
stay above ε after normalization to [0, 1]. Only edges, where G_σ < G_kσ on
the dark side, drop below ε and get sigmoid-darkened — producing a stroke
on the dark side of each edge against an otherwise white field. Output is
continuous tonal; chain `Threshold` for hard binary lines.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `sigma` | `number` |
| `kappa` | `number` |
| `epsilon` | `number` |
| `phi` | `number` |

#### Returns

`ImageData`

***

### applyQuantize()

> **applyQuantize**(`pixels`, `palette`, `dither?`): `ImageData`

Defined in: [Components/Effects/Quantize.tsx:195](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Quantize.tsx#L195)

Maps each pixel to its nearest palette color, optionally with dithering.

Floyd–Steinberg and Atkinson use error diffusion in raster order with a
Float32 working buffer. Bayer-4 and Bayer-8 are ordered dithering with the
canonical matrix.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `pixels` | `ImageData` | `undefined` |
| `palette` | readonly `Rgb`[] | `undefined` |
| `dither` | `DitherMode` | `"none"` |

#### Returns

`ImageData`

***

### derivePalette()

> **derivePalette**(`pixels`, `count`): \[`number`, `number`, `number`\][]

Defined in: [Components/Effects/Quantize.tsx:48](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Quantize.tsx#L48)

Median-cut palette derivation. Recursively splits the bucket with the longest
channel range at the median of that channel until `count` buckets exist; the
final palette is the per-channel mean of each bucket.

Throws if the input has fewer than `count` unique colors — that's a configuration error.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pixels` | `ImageData` | Source image. Fully transparent pixels are ignored. |
| `count` | `number` | Target palette size. Must be ≥ 1. |

#### Returns

\[`number`, `number`, `number`\][]

***

### ErrorChip()

> **ErrorChip**(`__namedParameters`): `Element` \| `null`

Defined in: [design-system/ErrorChip.tsx:77](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/design-system/ErrorChip.tsx#L77)

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

Defined in: [design-system/LoadingOverlay.tsx:30](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/design-system/LoadingOverlay.tsx#L30)

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

Defined in: [design-system/RenderStrip.tsx:58](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/design-system/RenderStrip.tsx#L58)

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

Defined in: [design-system/Sidebar.tsx:51](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/design-system/Sidebar.tsx#L51)

Single row in the Sidebar. Exported so the design-system showcase can render
forced-state instances (`default`, `hover`, `selected`) directly without
needing to script real interaction.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `SidebarRowProps` |

#### Returns

`Element`

## Layout

### Canvas()

> **Canvas**(`props`): `Element`

Defined in: [Components/Canvas.tsx:68](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Canvas.tsx#L68)

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

Defined in: [Components/Viewer.tsx:43](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Viewer.tsx#L43)

Development preview shell that renders one or more Canvas components.
Provides a sidebar for selecting between canvases when multiple are present.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ViewerProps` | - |

#### Returns

`Element`

## Effects

### Bilateral()

> **Bilateral**(`props`): `Element`

Defined in: [Components/Effects/Bilateral.tsx:109](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Bilateral.tsx#L109)

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

### Blur()

> **Blur**(`props`): `Element`

Defined in: [Components/Effects/Blur.tsx:302](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Blur.tsx#L302)

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

Defined in: [Components/Effects/Brightness.tsx:60](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Brightness.tsx#L60)

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

Defined in: [Components/Effects/ChannelMixer.tsx:44](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/ChannelMixer.tsx#L44)

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

Defined in: [Components/Effects/ColorGrade.tsx:83](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/ColorGrade.tsx#L83)

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

Defined in: [Components/Effects/Contrast.tsx:60](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Contrast.tsx#L60)

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

Defined in: [Components/Effects/CubeLUT.tsx:120](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/CubeLUT.tsx#L120)

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

Defined in: [Components/Effects/Sobel/Direction.tsx:93](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sobel/Direction.tsx#L93)

Outputs the gradient field of the input as a packed three-channel encoding
suitable for sampling-correct downstream consumption (e.g. `LIC`, mapped
effects).

- `kernel` — `sobel` (default) or `scharr`.

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
- B = magnitude unsigned [0, 1] -> [0, 255]  (normalized against the kernel's max response)

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

Defined in: [Components/Effects/DisplacementMap.tsx:62](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/DisplacementMap.tsx#L62)

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

Defined in: [Components/Effects/DropShadow.tsx:209](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/DropShadow.tsx#L209)

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

Defined in: [Components/Effects/Duotone.tsx:49](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Duotone.tsx#L49)

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

Defined in: [Components/Effects/Sobel/EdgeDetect.tsx:63](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sobel/EdgeDetect.tsx#L63)

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

### Grain()

> **Grain**(`props`): `Element`

Defined in: [Components/Effects/Grain.tsx:58](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Grain.tsx#L58)

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

Defined in: [Components/Effects/Grayscale.tsx:43](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Grayscale.tsx#L43)

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

Defined in: [Components/Effects/Halftone.tsx:121](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Halftone.tsx#L121)

Converts the image to a halftone pattern. Dot radius varies with local luminance.

- `dotSize` — Grid cell size in pixels. Larger values produce coarser halftone.
- `angle` — Rotation angle of the dot grid in degrees. Default 0.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `HalftoneProps` | - |

#### Returns

`Element`

***

### Hatch()

> **Hatch**(`props`): `Element`

Defined in: [Components/Effects/Hatch.tsx:241](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Hatch.tsx#L241)

Hatching effect. Bands the source into tonal tiers (Grayscale → Posterize)
and renders per-band line layers, multiplied onto a white background. Two
modes:

- **Constant-angle** (no `map` prop): each band uses a fixed angle and
  spacing. Pass `angles` and `spacing` arrays of length `bands`.
- **Field-aligned** (with `map` prop): each band's lines integrate along
  the supplied vector field via LIC. The map is expected to be a
  Direction-style cos/sin/magnitude encoding (see `Direction`).

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

Defined in: [Components/Effects/HueRotate.tsx:66](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/HueRotate.tsx#L66)

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

Defined in: [Components/Effects/ImageLUT.tsx:90](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/ImageLUT.tsx#L90)

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

Defined in: [Components/Effects/Invert.tsx:40](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Invert.tsx#L40)

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

Defined in: [Components/Effects/LIC.tsx:172](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/LIC.tsx#L172)

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

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `LICProps` | - |

#### Returns

`Element`

***

### LuminanceBands()

> **LuminanceBands**(`props`): `Element`

Defined in: [Components/Effects/LuminanceBands.tsx:119](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/LuminanceBands.tsx#L119)

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

### Opacity()

> **Opacity**(`props`): `Element`

Defined in: [Components/Effects/Opacity.tsx:60](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Opacity.tsx#L60)

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

Defined in: [Components/Effects/Outline.tsx:154](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Outline.tsx#L154)

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

Defined in: [Components/Effects/Posterize.tsx:59](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Posterize.tsx#L59)

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

Defined in: [Components/Effects/Quantize.tsx:358](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Quantize.tsx#L358)

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

Defined in: [Components/Effects/Saturate.tsx:63](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Saturate.tsx#L63)

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

Defined in: [Components/Effects/Sepia.tsx:48](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sepia.tsx#L48)

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

Defined in: [Components/Effects/Sharpen.tsx:101](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sharpen.tsx#L101)

Sharpens the image using a 3x3 unsharp mask convolution.

- `amount` — Sharpening strength. Higher values produce more aggressive edge enhancement.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `SharpenProps` | - |

#### Returns

`Element`

***

### Threshold()

> **Threshold**(`props`): `Element`

Defined in: [Components/Effects/Threshold.tsx:59](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Threshold.tsx#L59)

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

Defined in: [Components/Generative/ConicGradient.tsx:69](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/ConicGradient.tsx#L69)

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

Defined in: [Components/Generative/DotPattern.tsx:61](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/DotPattern.tsx#L61)

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

Defined in: [Components/Generative/GridPattern.tsx:73](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/GridPattern.tsx#L73)

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

Defined in: [Components/Generative/LinearGradient.tsx:71](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/LinearGradient.tsx#L71)

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

Defined in: [Components/Generative/LinePattern.tsx:80](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/LinePattern.tsx#L80)

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

Defined in: [Components/Generative/ProceduralNoise.tsx:72](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/ProceduralNoise.tsx#L72)

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

Defined in: [Components/Generative/RadialGradient.tsx:72](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Generative/RadialGradient.tsx#L72)

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

Defined in: [Components/BlendModes/Color.tsx:28](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Color.tsx#L28)

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

Defined in: [Components/BlendModes/ColorBurn.tsx:26](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/ColorBurn.tsx#L26)

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

Defined in: [Components/BlendModes/ColorDodge.tsx:26](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/ColorDodge.tsx#L26)

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

Defined in: [Components/BlendModes/Darken.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Darken.tsx#L25)

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

Defined in: [Components/BlendModes/DarkerColor.tsx:27](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/DarkerColor.tsx#L27)

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

Defined in: [Components/BlendModes/Difference.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Difference.tsx#L25)

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

Defined in: [Components/BlendModes/Divide.tsx:21](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Divide.tsx#L21)

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

Defined in: [Components/BlendModes/Exclusion.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Exclusion.tsx#L25)

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

Defined in: [Components/BlendModes/HardLight.tsx:29](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/HardLight.tsx#L29)

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

Defined in: [Components/BlendModes/HardMix.tsx:22](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/HardMix.tsx#L22)

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

Defined in: [Components/BlendModes/Hue.tsx:28](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Hue.tsx#L28)

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

Defined in: [Components/BlendModes/Lighten.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Lighten.tsx#L25)

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

Defined in: [Components/BlendModes/LighterColor.tsx:27](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/LighterColor.tsx#L27)

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

Defined in: [Components/BlendModes/LinearBurn.tsx:21](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/LinearBurn.tsx#L21)

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

Defined in: [Components/BlendModes/LinearDodge.tsx:21](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/LinearDodge.tsx#L21)

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

Defined in: [Components/BlendModes/LinearLight.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/LinearLight.tsx#L25)

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

Defined in: [Components/BlendModes/Luminosity.tsx:28](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Luminosity.tsx#L28)

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

Defined in: [Components/BlendModes/Multiply.tsx:21](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Multiply.tsx#L21)

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

Defined in: [Components/BlendModes/Overlay.tsx:29](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Overlay.tsx#L29)

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

Defined in: [Components/BlendModes/PinLight.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/PinLight.tsx#L25)

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

Defined in: [Components/BlendModes/Saturation.tsx:28](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Saturation.tsx#L28)

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

Defined in: [Components/BlendModes/Screen.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Screen.tsx#L25)

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

Defined in: [Components/BlendModes/SoftLight.tsx:35](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/SoftLight.tsx#L35)

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

Defined in: [Components/BlendModes/Subtract.tsx:21](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/Subtract.tsx#L21)

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

Defined in: [Components/BlendModes/VividLight.tsx:22](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/BlendModes/VividLight.tsx#L22)

Combines Color Burn and Color Dodge based on the blend brightness.
Dark blend values increase contrast via burn; light values decrease via dodge.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `VividLightProps` | - |

#### Returns

`Element`

## Pipeline

### Clip()

> **Clip**(`props`): `Element`

Defined in: [Components/Pipeline/Clip.tsx:19](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Pipeline/Clip.tsx#L19)

Clips a wrapped pipeline's bleed back to its content footprint.

Composes `Overflow` — which exposes bleed at natural pixel ratio — inside
an `overflow: hidden` container sized to the pipeline's content. The bleed
extends outside the pipeline via `Overflow` and is then cropped at the
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

Defined in: [Components/Pipeline/Overflow.tsx:26](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Pipeline/Overflow.tsx#L26)

Reveals a wrapped pipeline's bleed at natural pixel ratio.

By default a pipeline's canvas element fills the pipeline's content box
(children size) at `width: 100%; height: 100%`, so when an effect produces
bleed (Blur halo, drop shadow falloff, etc.) the canvas pixels are squished
into the content footprint. Overflow reads the pipeline's
`data-pictel-overflow-top/right/bottom/left` attributes and expands the
pipeline's raster wrapper (`[data-pictel-raster]`) outside the pipeline
bounds so the canvas renders at its natural pixel ratio. The bleed extends
visibly outside the pipeline box.

Only acts when the wrapped pipeline is not pending; during pending/initial
state the pipeline renders plain. Composes with an outer `overflow: hidden`
wrapper (see `Clip`) to crop the bleed back to content size.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `OverflowProps` | - |

#### Returns

`Element`

***

### Pipeline()

> **Pipeline**(`props`): `Element`

Defined in: Components/Pipeline/Pipeline.tsx:68

Unified pipeline primitive. Handles all effect and blend cases through
prop-carried secondary inputs.

DOM structure:
1. `<div ref={childrenRef}>{children}</div>` — in flow, drives layout
2. Offscreen apply container (only when `apply` prop is set)
3. Offscreen map container (only when `map` prop is set)
4. `<div ref={rasterRef} data-pictel-raster>` — absolute canvas overlay

All three wrappers (children, apply, map) are observed for changes and
captured in parallel via snapdom (or fast path when eligible).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `PipelineProps` | - |

#### Returns

`Element`

***

### RasterSource()

> **RasterSource**(`props`): `Element`

Defined in: Components/Pipeline/RasterSource.tsx:48

Shared leaf primitive for raster-producing components (Image, generatives).
Emits the same `[data-pictel-pipeline]` + `[data-pictel-raster] > canvas`
DOM contract as a resolved [Pipeline](#pipeline), so a parent capture recognizes
it via tryFastPath and reads the canvas ImageData directly when
intrinsic dims match the requested capture dims.

The `data-pictel-pending` attribute is managed entirely through
`acquirePending` / `releasePending` (refcounted, StrictMode-safe). The JSX
does NOT set the attribute — instead `useLayoutEffect` acquires pending
synchronously before any parent pipeline's layout effect runs (child layout
effects run before parents per React semantics), so the parent's first
gate observes the leaf as pending.

Closed API: no `className`, `style`, `id`, `data-*`, `aria-*`, event
handlers, or ref forwarding. Wrap in a styled `<div>` if positioning is
needed. Matches the closed effect-component API (2026-04-09).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | [`RasterSourceProps`](#rastersourceprops) | - |

#### Returns

`Element`

## Other

### CanvasDimensions

Defined in: [context/canvas.ts:10](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/context/canvas.ts#L10)

Fixed pixel dimensions for the canvas's compositing buffer. The capture
pipeline rasterizes to exactly these dimensions; visual scale (preview
fit-to-viewport, display fit-to-container) is applied by Frame as a CSS
transform and does not affect buffer size.

***

### RasterSourceProps

Defined in: Components/Pipeline/RasterSource.tsx:7

Props for the [RasterSource](#rastersource) primitive.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-draw"></a> `draw` | (`canvas`, `signal`) => `void` \| `Promise`\<`void`\> | Draw callback. Receives the leaf canvas and an AbortSignal. May be sync (gradients, patterns) or async (Image, which awaits decode before drawing). The canvas backing buffer is pre-sized to `width × height` before the callback runs. Stability matters: the layout effect re-runs whenever `draw`'s identity changes, which re-acquires pending and triggers a full re-capture in any wrapping Pipeline. Consumers should wrap `draw` in `useCallback` and use content-based keys (e.g. a serialized stops array) in the deps for inputs that may be inline-literal arrays or objects. | Components/Pipeline/RasterSource.tsx:24 |
| <a id="property-height"></a> `height` | `number` | Intrinsic height in pixels. | Components/Pipeline/RasterSource.tsx:11 |
| <a id="property-width"></a> `width` | `number` | Intrinsic width in pixels. Sets the canvas backing buffer and the CSS box. | Components/Pipeline/RasterSource.tsx:9 |

***

### PipelineCallback

> **PipelineCallback** = (`target`, `apply?`, `map?`) => `ImageData` \| `EffectResult` \| `Promise`\<`ImageData` \| `EffectResult`\>

Defined in: Components/Pipeline/Pipeline.tsx:19

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

### applyDirection()

> **applyDirection**(`pixels`, `kernel`): `ImageData`

Defined in: [Components/Effects/Sobel/Direction.tsx:23](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sobel/Direction.tsx#L23)

Compute the per-pixel gradient direction and magnitude using Sobel or Scharr
kernels and emit the result as a packed three-channel field:

- R = (cos(theta) + 1) * 127.5    -- horizontal direction component, [-1, 1] -> [0, 255]
- G = (sin(theta) + 1) * 127.5    -- vertical direction component,   [-1, 1] -> [0, 255]
- B = magnitude / maxResponse * 255 -- gradient strength,            [0, 1]  -> [0, 255]
- A = source alpha

Pixels with magnitude below `1e-6 * maxResponse` are emitted as
`R=128, G=128, B=0` (neutral direction, zero magnitude). The cos/sin
components are kept as floats until the final byte conversion to avoid
accumulated rounding error.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `kernel` | `"sobel"` \| `"scharr"` |

#### Returns

`ImageData`

***

### applyEdgeDetect()

> **applyEdgeDetect**(`pixels`, `kernel`): `ImageData`

Defined in: [Components/Effects/Sobel/EdgeDetect.tsx:16](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Sobel/EdgeDetect.tsx#L16)

Compute per-pixel gradient magnitude using Sobel or Scharr kernels and emit
the result as a grayscale ImageData (R=G=B=magnitude byte, alpha preserved).

Magnitude is normalized against the kernel's theoretical maximum response so
the output spans the full 0..255 byte range regardless of kernel choice.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `kernel` | `"sobel"` \| `"scharr"` |

#### Returns

`ImageData`

***

### applyHatch()

> **applyHatch**(`pixels`, `bands`, `angles`, `spacing`): `ImageData`

Defined in: [Components/Effects/Hatch.tsx:46](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Hatch.tsx#L46)

Constant-angle hatching. Bands the source image into `bands` tonal tiers
(Grayscale → Posterize) and overlays a per-band line pattern at
`angles[b]` with `spacing[b]`. The lightest band draws no lines (pure
white). Lines are composited via Multiply, so darker bands accumulate
darker hatching. Output preserves the source alpha.

Angle convention (matches CSS `linear-gradient`, SVG, and standard graphics
tools): `angle=0` produces horizontal lines, `angle=π/2` produces vertical
lines, increasing CCW. The angle names the line orientation, not the line
normal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `bands` | `number` |
| `angles` | `number`[] |
| `spacing` | `number`[] |

#### Returns

`ImageData`

***

### applyHatchFieldAligned()

> **applyHatchFieldAligned**(`pixels`, `field`, `bands`, `spacing`, `length`, `stepSize`): `ImageData`

Defined in: [Components/Effects/Hatch.tsx:148](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Hatch.tsx#L148)

Field-aligned hatching. Same banding pipeline as `applyHatch`, but each
band's line layer is generated by passing a vertical-stripe seed through
`applyLIC` with the supplied `field`. Stripes deform along the field's
streamlines, producing engraving-like hatching that follows the underlying
direction map.

Cost: a full LIC integration runs per band — `O(width * height * length *
bands)` sample reads. For `bands=4`, `length=20`, 1080×1080 the cost is on
the order of 93M sample reads; acceptable for static demos.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `field` | `ImageData` |
| `bands` | `number` |
| `spacing` | `number`[] |
| `length` | `number` |
| `stepSize` | `number` |

#### Returns

`ImageData`

***

### applyLIC()

> **applyLIC**(`seed`, `field`, `length`, `stepSize`): `ImageData`

Defined in: [Components/Effects/LIC.tsx:61](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/LIC.tsx#L61)

Line Integral Convolution: integrate `seed` along the vector field encoded
in `field`, producing streamline-aligned output. The field is decoded as
`cos = R/127.5 - 1`, `sin = G/127.5 - 1`, `magnitude = B/255` — the
Direction-style cos/sin/magnitude pack.

For each output pixel, a forward and a backward Euler integration of
`length` steps is performed, sampling the seed bilinearly at each step and
accumulating with hat-function weighting `w = 1 - i / length`. Per-pixel
step length scales with magnitude as `stepSize * (0.25 + 0.75 * magnitude)`
— the floor at 25% prevents stagnation in zero-magnitude regions while
full-magnitude regions step the full distance.

Out-of-bounds samples are clamped to the edge pixel (extension by clamping).

Reference: Cabral & Leedom 1993, "Imaging Vector Fields Using Line Integral
Convolution".

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `seed` | `ImageData` |
| `field` | `ImageData` |
| `length` | `number` |
| `stepSize` | `number` |

#### Returns

`ImageData`

***

### applyMappedOutline()

> **applyMappedOutline**(`pixels`, `map`, `sigma`, `kappa`, `epsilon`, `phi`): `ImageData`

Defined in: [Components/Effects/Outline.tsx:108](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Outline.tsx#L108)

Map-driven XDoG outline. The outline is computed from the source pixels and
then mixed back with the original by map luminance: black map → original,
white map → fully outlined.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `map` | `ImageData` |
| `sigma` | `number` |
| `kappa` | `number` |
| `epsilon` | `number` |
| `phi` | `number` |

#### Returns

`ImageData`

***

### applyMappedQuantize()

> **applyMappedQuantize**(`pixels`, `map`, `palette`, `dither?`): `ImageData`

Defined in: [Components/Effects/Quantize.tsx:320](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Quantize.tsx#L320)

Same as `applyQuantize` but the quantized result is mixed with the original
pixels by the map's luminance. Map=black returns the original; map=white
returns the fully quantized output.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `pixels` | `ImageData` | `undefined` |
| `map` | `ImageData` | `undefined` |
| `palette` | readonly `Rgb`[] | `undefined` |
| `dither` | `DitherMode` | `"none"` |

#### Returns

`ImageData`

***

### applyOutline()

> **applyOutline**(`pixels`, `sigma`, `kappa`, `epsilon`, `phi`): `ImageData`

Defined in: [Components/Effects/Outline.tsx:25](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Outline.tsx#L25)

XDoG (Extended Difference of Gaussians) line-art outline.

Algorithm (Winnemöller et al. 2012, stylized formulation):
`S = (1 + τ)·G_σ − τ·G_kσ` — the inner Gaussian with the high-frequency
component amplified by τ. Equivalent to `G_σ + τ·(G_σ − G_kσ)`. Uniform
regions reproduce as G_σ ≈ I, so they sit at their original luminance and
stay above ε after normalization to [0, 1]. Only edges, where G_σ < G_kσ on
the dark side, drop below ε and get sigmoid-darkened — producing a stroke
on the dark side of each edge against an otherwise white field. Output is
continuous tonal; chain `Threshold` for hard binary lines.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `sigma` | `number` |
| `kappa` | `number` |
| `epsilon` | `number` |
| `phi` | `number` |

#### Returns

`ImageData`

***

### applyQuantize()

> **applyQuantize**(`pixels`, `palette`, `dither?`): `ImageData`

Defined in: [Components/Effects/Quantize.tsx:195](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Quantize.tsx#L195)

Maps each pixel to its nearest palette color, optionally with dithering.

Floyd–Steinberg and Atkinson use error diffusion in raster order with a
Float32 working buffer. Bayer-4 and Bayer-8 are ordered dithering with the
canonical matrix.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `pixels` | `ImageData` | `undefined` |
| `palette` | readonly `Rgb`[] | `undefined` |
| `dither` | `DitherMode` | `"none"` |

#### Returns

`ImageData`

***

### derivePalette()

> **derivePalette**(`pixels`, `count`): \[`number`, `number`, `number`\][]

Defined in: [Components/Effects/Quantize.tsx:48](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/Components/Effects/Quantize.tsx#L48)

Median-cut palette derivation. Recursively splits the bucket with the longest
channel range at the median of that channel until `count` buckets exist; the
final palette is the per-channel mean of each bucket.

Throws if the input has fewer than `count` unique colors — that's a configuration error.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pixels` | `ImageData` | Source image. Fully transparent pixels are ignored. |
| `count` | `number` | Target palette size. Must be ≥ 1. |

#### Returns

\[`number`, `number`, `number`\][]

***

### ErrorChip()

> **ErrorChip**(`__namedParameters`): `Element` \| `null`

Defined in: [design-system/ErrorChip.tsx:77](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/design-system/ErrorChip.tsx#L77)

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

Defined in: [design-system/LoadingOverlay.tsx:30](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/design-system/LoadingOverlay.tsx#L30)

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

Defined in: [design-system/RenderStrip.tsx:58](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/design-system/RenderStrip.tsx#L58)

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

Defined in: [design-system/Sidebar.tsx:51](https://github.com/visionsofparadise/pictel/blob/b45e53e8627184ae8cedbb02f14da241eadedfe6/packages/pictel/src/design-system/Sidebar.tsx#L51)

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

Defined in: Components/Image/Image.tsx:98

Loads a raster image source once on mount, decodes it via the browser's
native image loader, and draws the decoded pixels into the leaf canvas at
the requested fit. The source decode happens once per `src` change — not
once per capture — so parent pipeline captures read pixels from the leaf
canvas, never re-decoding the source bytes.

Renders through [RasterSource](#rastersource), so the emitted DOM matches the
`[data-pictel-pipeline]` + `[data-pictel-raster] > canvas` contract that
lets a parent pipeline's capture take the fast path when intrinsic dims
match the requested capture dims.

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
