# @pictel/effects

## Effects

### Bilateral()

> **Bilateral**(`props`): `Element`

Defined in: [Effects/Bilateral.tsx:109](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Bilateral.tsx#L109)

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

Defined in: [Effects/Bloom.tsx:132](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Bloom.tsx#L132)

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

Defined in: [Effects/Blur.tsx:294](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Blur.tsx#L294)

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

Defined in: [Effects/Brightness.tsx:60](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Brightness.tsx#L60)

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

Defined in: [Effects/ChannelMixer.tsx:44](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/ChannelMixer.tsx#L44)

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

Defined in: [Effects/ColorGrade.tsx:78](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/ColorGrade.tsx#L78)

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

Defined in: [Effects/Contrast.tsx:60](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Contrast.tsx#L60)

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

Defined in: [Effects/CubeLUT.tsx:120](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/CubeLUT.tsx#L120)

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

Defined in: [Effects/Sobel/Direction.tsx:206](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Sobel/Direction.tsx#L206)

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

Defined in: [Effects/DisplacementMap.tsx:62](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/DisplacementMap.tsx#L62)

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

Defined in: [Effects/DropShadow.tsx:138](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/DropShadow.tsx#L138)

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

Defined in: [Effects/Duotone.tsx:49](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Duotone.tsx#L49)

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

Defined in: [Effects/Sobel/EdgeDetect.tsx:63](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Sobel/EdgeDetect.tsx#L63)

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

Defined in: [Effects/Engrave.tsx:113](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Engrave.tsx#L113)

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

Defined in: [Effects/Grain.tsx:47](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Grain.tsx#L47)

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

Defined in: [Effects/Grayscale.tsx:43](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Grayscale.tsx#L43)

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

Defined in: [Effects/Halftone.tsx:242](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Halftone.tsx#L242)

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

Defined in: [Effects/Hatch.tsx:265](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Hatch.tsx#L265)

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

Defined in: [Effects/HueRotate.tsx:66](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/HueRotate.tsx#L66)

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

Defined in: [Effects/ImageLUT.tsx:90](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/ImageLUT.tsx#L90)

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

Defined in: [Effects/Invert.tsx:40](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Invert.tsx#L40)

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

Defined in: [Effects/LIC.tsx:187](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/LIC.tsx#L187)

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

Defined in: [Effects/LuminanceBands.tsx:119](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/LuminanceBands.tsx#L119)

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

Defined in: [Effects/Mask.tsx:69](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Mask.tsx#L69)

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

Defined in: [Effects/Opacity.tsx:60](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Opacity.tsx#L60)

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

Defined in: [Effects/Outline.tsx:145](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Outline.tsx#L145)

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

Defined in: [Effects/Posterize.tsx:59](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Posterize.tsx#L59)

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

Defined in: [Effects/Quantize.tsx:345](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Quantize.tsx#L345)

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

Defined in: [Effects/Saturate.tsx:63](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Saturate.tsx#L63)

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

Defined in: [Effects/Sepia.tsx:48](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Sepia.tsx#L48)

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

Defined in: [Effects/Sharpen.tsx:101](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Sharpen.tsx#L101)

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

Defined in: [Effects/ShockFilter.tsx:198](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/ShockFilter.tsx#L198)

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

Defined in: [Effects/Threshold.tsx:59](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Threshold.tsx#L59)

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

Defined in: [Generative/ConicGradient.tsx:69](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Generative/ConicGradient.tsx#L69)

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

Defined in: [Generative/DotPattern.tsx:61](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Generative/DotPattern.tsx#L61)

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

Defined in: [Generative/GridPattern.tsx:73](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Generative/GridPattern.tsx#L73)

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

Defined in: [Generative/LinearGradient.tsx:71](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Generative/LinearGradient.tsx#L71)

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

Defined in: [Generative/LinePattern.tsx:80](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Generative/LinePattern.tsx#L80)

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

Defined in: [Generative/ProceduralNoise.tsx:72](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Generative/ProceduralNoise.tsx#L72)

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

Defined in: [Generative/RadialGradient.tsx:72](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Generative/RadialGradient.tsx#L72)

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

Defined in: [BlendModes/Color.tsx:28](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Color.tsx#L28)

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

Defined in: [BlendModes/ColorBurn.tsx:26](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/ColorBurn.tsx#L26)

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

Defined in: [BlendModes/ColorDodge.tsx:26](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/ColorDodge.tsx#L26)

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

Defined in: [BlendModes/Darken.tsx:25](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Darken.tsx#L25)

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

Defined in: [BlendModes/DarkerColor.tsx:27](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/DarkerColor.tsx#L27)

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

Defined in: [BlendModes/Difference.tsx:25](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Difference.tsx#L25)

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

Defined in: [BlendModes/Divide.tsx:21](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Divide.tsx#L21)

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

Defined in: [BlendModes/Exclusion.tsx:25](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Exclusion.tsx#L25)

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

Defined in: [BlendModes/HardLight.tsx:29](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/HardLight.tsx#L29)

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

Defined in: [BlendModes/HardMix.tsx:22](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/HardMix.tsx#L22)

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

Defined in: [BlendModes/Hue.tsx:28](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Hue.tsx#L28)

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

Defined in: [BlendModes/Lighten.tsx:25](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Lighten.tsx#L25)

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

Defined in: [BlendModes/LighterColor.tsx:27](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/LighterColor.tsx#L27)

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

Defined in: [BlendModes/LinearBurn.tsx:21](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/LinearBurn.tsx#L21)

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

Defined in: [BlendModes/LinearDodge.tsx:21](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/LinearDodge.tsx#L21)

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

Defined in: [BlendModes/LinearLight.tsx:25](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/LinearLight.tsx#L25)

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

Defined in: [BlendModes/Luminosity.tsx:28](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Luminosity.tsx#L28)

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

Defined in: [BlendModes/Multiply.tsx:21](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Multiply.tsx#L21)

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

Defined in: [BlendModes/Overlay.tsx:29](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Overlay.tsx#L29)

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

Defined in: [BlendModes/PinLight.tsx:25](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/PinLight.tsx#L25)

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

Defined in: [BlendModes/Saturation.tsx:28](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Saturation.tsx#L28)

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

Defined in: [BlendModes/Screen.tsx:25](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Screen.tsx#L25)

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

Defined in: [BlendModes/SoftLight.tsx:35](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/SoftLight.tsx#L35)

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

Defined in: [BlendModes/Subtract.tsx:21](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/Subtract.tsx#L21)

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

Defined in: [BlendModes/VividLight.tsx:22](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/BlendModes/VividLight.tsx#L22)

Combines Color Burn and Color Dodge based on the blend brightness.
Dark blend values increase contrast via burn; light values decrease via dodge.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `VividLightProps` | - |

#### Returns

`Element`

## Other

### HalftoneColorMode

> **HalftoneColorMode** = `"luminance"` \| `"cmyk"` \| `"color"`

Defined in: [Effects/Halftone.tsx:12](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Halftone.tsx#L12)

Color mode for the halftone screen.

***

### MaskSource

> **MaskSource** = `"alpha"` \| `"luminance"`

Defined in: [Effects/Mask.tsx:9](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Mask.tsx#L9)

Which channel of the mask map drives the clip.

***

### applyBloom()

> **applyBloom**(`pixels`, `threshold`, `radius`, `intensity`): `ImageData`

Defined in: [Effects/Bloom.tsx:29](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Bloom.tsx#L29)

Bloom / glow.

Algorithm:
 1. Extract a highlight buffer — per pixel `lum = luminance(r,g,b)/255`,
    `knee = clamp01((lum − threshold) / (1 − threshold))`, and a quadratic
    soft-knee weight `weight = knee²`. The highlight pixel is the source
    colour scaled by `weight` (so only bright regions contribute, and they
    fade in smoothly rather than hard-clipping at the threshold).
 2. Blur the highlight buffer by `radius` via `applyUniformBlur`, which
    returns a padded `EffectResult` — the glow spreads outward.
 3. Screen-blend the blurred highlights (scaled by `intensity`) back over the
    original, reading the padded blur buffer through its `overflow` offsets.
    Screen per channel: `out = 255 − (255−base)·(255−min(255, bloom·intensity))/255`.

The blur overflow is consumed internally — output is the same dimensions as
the input, so the glow is clipped to the frame (correct for a fixed-size
`Canvas`). Alpha is the source alpha.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `threshold` | `number` |
| `radius` | `number` |
| `intensity` | `number` |

#### Returns

`ImageData`

***

### applyDirection()

> **applyDirection**(`pixels`, `kernel`): `ImageData`

Defined in: [Effects/Sobel/Direction.tsx:26](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Sobel/Direction.tsx#L26)

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

Defined in: [Effects/Sobel/EdgeDetect.tsx:16](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Sobel/EdgeDetect.tsx#L16)

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

### applyEngrave()

> **applyEngrave**(`pixels`, `spacing`, `angle`, `relief`, `crossHatch`): `ImageData`

Defined in: [Effects/Engrave.tsx:34](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Engrave.tsx#L34)

Line-engraving conversion. Lays a continuous line pattern over the image and
modulates each line's thickness by local darkness — light tone thins the
inked stripe to a hairline, dark tone swells it until neighbouring lines
merge. The line phase is warped by tone (`relief`) so the lines bow around
the form, the way an engraver's "modeling lines" follow a face. With
`crossHatch`, a second perpendicular set of lines fades in across the
darkest tones.

Output is grayscale — black ink on white — and preserves source alpha.

Angle convention matches `Hatch` and CSS gradients: `angle=0` is horizontal
lines, `angle=π/2` is vertical, increasing counter-clockwise.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `spacing` | `number` |
| `angle` | `number` |
| `relief` | `number` |
| `crossHatch` | `boolean` |

#### Returns

`ImageData`

***

### applyHalftone()

> **applyHalftone**(`pixels`, `dotSize`, `angle?`, `colorMode?`, `dotColor?`): `ImageData`

Defined in: [Effects/Halftone.tsx:103](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Halftone.tsx#L103)

Convert a halftone screen and its dots into a halftone-rendered `ImageData`.

Three color modes:

**`"luminance"`** (default) — monochrome screen. Each grid cell's dot radius
is proportional to `1 − avgLuminance/255` (dark cells → big dots). Dots are
stamped in `dotColor` (default black `[0,0,0]`) on a white background — a
classic Ben-Day screen. This is the original, unchanged behavior.

**`"cmyk"`** — process halftone. Each source pixel is separated into Cyan /
Magenta / Yellow / Key channels via gray-component replacement:
  `C = 1 − R/255`, `M = 1 − G/255`, `Y = 1 − B/255`, `K = min(C, M, Y)`,
  then `C' = (C − K)/(1 − K)` (and likewise M', Y') when `K < 1`, else 0.
Each of the four channels is screened on its own grid, rotated to its
classic process angle — Cyan 15°, Magenta 75°, Yellow 0°, Key 45° — with
per-cell dot radius proportional to that channel's average coverage. Dots
are stamped in their ink color (cyan, magenta, yellow, black) onto a white
background and overprinted via `globalCompositeOperation = "multiply"`, so
overlapping colored dots subtract toward darker, saturated color the way
real process printing builds an image. Output preserves source alpha.

**`"color"`** — single-screen color halftone. One shared grid (no channel
separation, so nothing can misregister): each cell is stamped as a single
dot in that cell's own average color, with radius tracking the cell's
darkness (`1 − luminance/255`) so the white paper carries the highlights.
The clean comic-dot look. Output preserves source alpha.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `pixels` | `ImageData` | `undefined` | Source image. |
| `dotSize` | `number` | `undefined` | Grid cell size in pixels. Larger values produce coarser halftone. |
| `angle` | `number` | `0` | Rotation of the (single) dot grid in degrees — `"luminance"` and `"color"` modes only. Default 0. |
| `colorMode` | [`HalftoneColorMode`](#halftonecolormode) | `"luminance"` | `"luminance"` (default), `"cmyk"`, or `"color"`. Default `"luminance"`. |
| `dotColor` | \[`number`, `number`, `number`\] | `...` | Ink color `[r, g, b]` for the `"luminance"` screen. Default black `[0, 0, 0]`. |

#### Returns

`ImageData`

***

### applyHatch()

> **applyHatch**(`pixels`, `bands`, `angles`, `spacing`): `ImageData`

Defined in: [Effects/Hatch.tsx:30](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Hatch.tsx#L30)

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

> **applyHatchFieldAligned**(`pixels`, `field`, `bands`, `spacing`, `length`, `stepSize`, `uniformStep?`): `ImageData`

Defined in: [Effects/Hatch.tsx:163](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Hatch.tsx#L163)

Field-aligned hatching. Same banding pipeline as `applyHatch`, but each
band's line layer is generated by passing an **isotropic binary-noise** seed
through `applyLIC` with the supplied `field`. LIC smears the white noise
along the field's streamlines; because white noise carries high-frequency
content in every orientation, the resulting streamline texture follows the
field in *all* directions — hatching that curves around the form rather than
a directional stripe seed that only resolves where the field happens to be
perpendicular to it. This is the classic, correct LIC seeding choice
(Cabral & Leedom 1993).

Per-band tone is driven by the `spacing` array: a band's black-pixel noise
probability is `min(0.5, 2 / bandSpacing)`, so a tighter (darker) band gets
denser black noise and therefore darker, denser streamline hatching after
LIC; a looser band gets sparser, fainter hatching. The LIC output — gray
streaks — is then run through a smoothstep contrast pass (midpoint near the
streak mean) so the streak body resolves to dark, dense ink with paper-white
gaps, and multiplied onto the white output for the matching tier.

`uniformStep` is forwarded to `applyLIC`: with a smooth field (e.g. a
structure-tensor field) leave it true so the noise is actually carried along
the field; the default magnitude-gated step stalls on smooth fields.

Cost: a full LIC integration runs per band — `O(width * height * length *
bands)` sample reads. For `bands=4`, `length=20`, 1080×1080 the cost is on
the order of 93M sample reads; acceptable for static demos.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `pixels` | `ImageData` | `undefined` |
| `field` | `ImageData` | `undefined` |
| `bands` | `number` | `undefined` |
| `spacing` | `number`[] | `undefined` |
| `length` | `number` | `undefined` |
| `stepSize` | `number` | `undefined` |
| `uniformStep` | `boolean` | `false` |

#### Returns

`ImageData`

***

### applyLIC()

> **applyLIC**(`seed`, `field`, `length`, `stepSize`, `uniformStep?`): `ImageData`

Defined in: [Effects/LIC.tsx:67](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/LIC.tsx#L67)

Line Integral Convolution: integrate `seed` along the vector field encoded
in `field`, producing streamline-aligned output. The field is decoded as
`cos = R/127.5 - 1`, `sin = G/127.5 - 1`, `magnitude = B/255` — the
Direction-style cos/sin/magnitude pack.

For each output pixel, a forward and a backward Euler integration of
`length` steps is performed, sampling the seed bilinearly at each step and
accumulating with hat-function weighting `w = 1 - i / length`.

Per-pixel step length scales with the field's magnitude channel as
`stepSize * (0.25 + 0.75 * magnitude)` — the floor at 25% prevents
stagnation in zero-magnitude regions while full-magnitude regions step the
full distance. This magnitude gating suits *field visualization* (streamline
length reflects field strength) but stalls on a smooth field whose magnitude
is low everywhere — e.g. a depth gradient. Set `uniformStep` to true to step
the full `stepSize` regardless of magnitude, so a smooth direction field is
followed at full integration distance.

Out-of-bounds samples are clamped to the edge pixel (extension by clamping).

Reference: Cabral & Leedom 1993, "Imaging Vector Fields Using Line Integral
Convolution".

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `seed` | `ImageData` | `undefined` |
| `field` | `ImageData` | `undefined` |
| `length` | `number` | `undefined` |
| `stepSize` | `number` | `undefined` |
| `uniformStep` | `boolean` | `false` |

#### Returns

`ImageData`

***

### applyMappedBloom()

> **applyMappedBloom**(`pixels`, `map`, `threshold`, `radius`, `intensity`): `ImageData`

Defined in: [Effects/Bloom.tsx:90](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Bloom.tsx#L90)

Map-driven bloom. The bloom is computed from the source pixels and then mixed
back with the original by map luminance: black map → original, white map →
fully bloomed.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `map` | `ImageData` |
| `threshold` | `number` |
| `radius` | `number` |
| `intensity` | `number` |

#### Returns

`ImageData`

***

### applyMappedOutline()

> **applyMappedOutline**(`pixels`, `map`, `sigma`, `kappa`, `epsilon`, `phi`): `ImageData`

Defined in: [Effects/Outline.tsx:99](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Outline.tsx#L99)

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

Defined in: [Effects/Quantize.tsx:307](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Quantize.tsx#L307)

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

### applyMappedShockFilter()

> **applyMappedShockFilter**(`pixels`, `map`, `iterations`, `strength`): `ImageData`

Defined in: [Effects/ShockFilter.tsx:160](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/ShockFilter.tsx#L160)

Map-driven shock filter. The shock-filtered result is computed from the
source pixels and mixed back with the original by map luminance: black map →
original, white map → fully shock-filtered.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `map` | `ImageData` |
| `iterations` | `number` |
| `strength` | `number` |

#### Returns

`ImageData`

***

### applyMask()

> **applyMask**(`pixels`, `mask`, `source`): `ImageData`

Defined in: [Effects/Mask.tsx:17](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Mask.tsx#L17)

Clip `pixels` to `mask`. The mask value at each pixel — its alpha channel
(`source="alpha"`) or its luminance (`source="luminance"`) — multiplies the
source alpha. RGB is untouched; only transparency changes. The two buffers
must have matching dimensions.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `mask` | `ImageData` |
| `source` | [`MaskSource`](#masksource) |

#### Returns

`ImageData`

***

### applyOutline()

> **applyOutline**(`pixels`, `sigma`, `kappa`, `epsilon`, `phi`): `ImageData`

Defined in: [Effects/Outline.tsx:24](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Outline.tsx#L24)

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

Defined in: [Effects/Quantize.tsx:185](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Quantize.tsx#L185)

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

### applyShockFilter()

> **applyShockFilter**(`pixels`, `iterations`, `strength`): `ImageData`

Defined in: [Effects/ShockFilter.tsx:53](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/ShockFilter.tsx#L53)

Regularized iterative shock filter — the mathematically well-behaved limit of
"sharpen the image over and over."

A raw shock filter (Osher–Rudin) repeatedly dilates pixels toward the bright
side of an edge and erodes them toward the dark side, steepening every edge
into a true discontinuity. Applied naively it amplifies noise into spurious
shocks. This implementation regularizes it: each iteration presmooths the
channels with a small box blur (`SMOOTH_RADIUS`) before estimating the
Laplacian sign, so the dilate/erode decision follows real structure rather
than noise. Each iteration is one blur-then-sharpen step.

The shock *direction* is coupled across the three colour channels through
luminance. Deciding `sign(Laplacian)` per channel lets the channels disagree
about which side of an edge to pull from on a detailed photo, producing
per-channel colour fringing — a fine, colourful maze instead of bold coherent
flat regions. Computing one shared `sign(L)` map from the luminance of the
smoothed channels keeps the dilate/erode decision identical for R, G and B,
so every channel shocks the same way at every edge. Each channel still keeps
its own gradient magnitude, so it retains its own contrast.

Per iteration (alpha passed through):
 1. Presmooth each of the R, G, B channel buffers → `sR, sG, sB`.
 2. Compute a single luminance buffer `Lum` (BT.601) from `sR, sG, sB`.
 3. Compute the 5-point Laplacian of `Lum`, edge-clamped → one shared
    `sign(L)` map for the iteration.
 4. Per channel, compute the gradient magnitude of that channel's *current*
    (un-presmoothed) buffer via central differences, edge-clamped.
 5. Shock step per channel: `I_new = I - sign(L) * gradMag * dt`,
    `dt = min(1, strength)`.
 6. Clamp to `[0, 255]`.

Iterating converges to piecewise-flat regions separated by crisp edges — a
clean cartoon / line-drawing look with no ringing or colour fringing.
`iterations <= 0` returns an unchanged copy. Grayscale inputs (R = G = B) are
unaffected by the luminance coupling, since luminance then equals every
channel.

Cost is `O(W*H*iterations)`. Acceptable for static demos; keep `iterations`
modest (~8–14) on larger images.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `iterations` | `number` |
| `strength` | `number` |

#### Returns

`ImageData`

***

### applyStructureField()

> **applyStructureField**(`pixels`, `kernel`): `ImageData`

Defined in: [Effects/Sobel/Direction.tsx:92](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Sobel/Direction.tsx#L92)

Compute a smooth, contour-following orientation field via the structure
tensor and emit it in the same packed three-channel encoding as
`applyDirection`.

Raw per-pixel gradient direction (`applyDirection`) is noisy: along an edge
the gradient flips 180 degrees pixel-to-pixel, and averaging those opposite
vectors cancels them out. The structure tensor avoids this by averaging the
*outer product* of the gradient (`gx*gx`, `gx*gy`, `gy*gy`) instead of the
gradient itself — orientation, which is direction modulo 180 degrees, does
not suffer the opposite-vector cancellation. The result is a field that
field-aligned consumers (`LIC`, `Hatch`) can follow coherently around forms.

Algorithm:
1. Per-pixel gradients `gx, gy` via `applyKernels` (Sobel or Scharr).
2. Tensor components per pixel: `e = gx*gx`, `f = gx*gy`, `g = gy*gy`.
3. Smooth `e, f, g` with a separable box blur at `INTEGRATION_RADIUS`.
4. Eigenvalues `lambda1,2 = (e+g)/2 +/- sqrt(((e-g)/2)^2 + f^2)`.
5. Dominant-gradient orientation `phi = 0.5 * atan2(2f, e - g)`; the flow
   direction *along* contours is `phi + PI/2`.
6. Coherence (anisotropy) `coh = (lambda1 - lambda2) / (lambda1 + lambda2)`,
   range `[0, 1]`.
7. Encode `R = (cos+1)*127.5`, `G = (sin+1)*127.5`, `B = coh*255`, `A` from
   the source. Degenerate pixels (`lambda1+lambda2 <= epsilon`) emit
   `R=128, G=128, B=0`, matching `applyDirection`'s neutral encoding.

The B channel carries coherence here (it carries gradient magnitude in
`applyDirection`). A consumer that magnitude-gates on B should ignore it for
a structure field — set `uniformStep` on `LIC`/`Hatch`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pixels` | `ImageData` |
| `kernel` | `"sobel"` \| `"scharr"` |

#### Returns

`ImageData`

***

### derivePalette()

> **derivePalette**(`pixels`, `count`): \[`number`, `number`, `number`\][]

Defined in: [Effects/Quantize.tsx:44](https://github.com/visionsofparadise/pictel/blob/a7ce8694a29b60ec131adf83f8e323f493f47417/packages/effects/src/Effects/Quantize.tsx#L44)

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
