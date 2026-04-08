# pictel

## Layout

### Canvas

Defined in: [Components/Canvas.tsx:27](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Canvas.tsx#L27)

Root compositing surface. Contains layers, effects, and blend modes as children.
Each Canvas is an independent composition with its own pixel pipeline.

- `name` — Display name shown in the Viewer sidebar. Used as the `aria-label`.
- `dimensions` — Output dimensions for rasterization. Either fixed `{ width, height }` or reference-based `{ reference: { width, height } }`.

***

### Viewer

Defined in: [Components/Viewer.tsx:46](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Viewer.tsx#L46)

Development preview shell that renders one or more Canvas components.
Provides a sidebar for selecting between canvases when multiple are present.

## Effects

### Blur

Defined in: [Components/Effects/Blur.tsx:208](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Blur.tsx#L208)

Applies a uniform box blur or a map-driven variable-radius blur.

- `radius` — Blur radius in pixels. With a map, radius scales per-pixel by map luminance.
- `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.

***

### Brightness

Defined in: [Components/Effects/Brightness.tsx:59](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Brightness.tsx#L59)

Adjusts pixel brightness by multiplying RGB channels.

- `amount` — Brightness multiplier. 1 is unchanged, 0 is black, greater than 1 brightens.

***

### ChannelMixer

Defined in: [Components/Effects/ChannelMixer.tsx:43](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/ChannelMixer.tsx#L43)

Remaps RGB channels through a 3x3 mixing matrix. Each output channel is a
weighted sum of the input channels.

- `matrix` — 3x3 array where `matrix[outChannel][inChannel]` is the weight. Stabilize with `useMemo`.

***

### ColorGrade

Defined in: [Components/Effects/ColorGrade.tsx:82](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/ColorGrade.tsx#L82)

Combined color grading with brightness, contrast, saturation, temperature, and tint controls.

- `brightness` — Brightness multiplier. Default 1.
- `contrast` — Contrast multiplier. Default 1.
- `saturation` — Saturation multiplier. Default 1.
- `temperature` — Warm/cool shift. Positive warms (adds red, removes blue), negative cools.
- `tint` — Green/magenta shift. Positive adds magenta, negative adds green.

***

### Contrast

Defined in: [Components/Effects/Contrast.tsx:59](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Contrast.tsx#L59)

Adjusts pixel contrast by scaling deviation from mid-gray.

- `amount` — Contrast multiplier. 1 is unchanged, 0 is flat gray, greater than 1 increases contrast.

***

### CubeLUT

Defined in: [Components/Effects/CubeLUT.tsx:119](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/CubeLUT.tsx#L119)

Applies a .cube 3D LUT file for color grading. Fetches and parses the cube file, then
applies trilinear-interpolated color transformation.

- `src` — URL to a .cube LUT file.

***

### DisplacementMap

Defined in: [Components/Effects/DisplacementMap.tsx:62](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/DisplacementMap.tsx#L62)

Displaces pixels using a Map child's red and green channels for X and Y offset.
Requires a `<Map>` child providing the displacement source.

- `scaleX` — Maximum horizontal displacement in pixels. Default 20.
- `scaleY` — Maximum vertical displacement in pixels. Default 20.

***

### DropShadow

Defined in: [Components/Effects/DropShadow.tsx:207](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/DropShadow.tsx#L207)

Adds a drop shadow behind the content at a specified offset with blur and color.

- `offsetX` — Horizontal shadow offset in pixels.
- `offsetY` — Vertical shadow offset in pixels.
- `blurRadius` — Shadow blur radius in pixels.
- `color` — Shadow color as hex (`#rgb`, `#rrggbb`, `#rrggbbaa`) or `rgb()`/`rgba()`.

***

### Duotone

Defined in: [Components/Effects/Duotone.tsx:48](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Duotone.tsx#L48)

Maps pixel luminance to a two-color gradient. Shadows map to `dark`, highlights to `light`.

- `dark` — RGB triple [r, g, b] (0-255) for shadow tones.
- `light` — RGB triple [r, g, b] (0-255) for highlight tones.

***

### Grain

Defined in: [Components/Effects/Grain.tsx:57](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Grain.tsx#L57)

Adds deterministic monochromatic film grain noise to the image.

- `intensity` — Maximum noise amplitude in pixel values (0-255 range).
- `seed` — Random seed for reproducible grain patterns.

***

### Grayscale

Defined in: [Components/Effects/Grayscale.tsx:42](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Grayscale.tsx#L42)

Converts pixels to grayscale using BT.601 luminance weighting.

- `amount` — Desaturation amount. 0 is unchanged, 1 is fully grayscale. Default 1.

***

### Halftone

Defined in: [Components/Effects/Halftone.tsx:106](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Halftone.tsx#L106)

Converts the image to a halftone pattern. Dot radius varies with local luminance.

- `dotSize` — Grid cell size in pixels. Larger values produce coarser halftone.
- `angle` — Rotation angle of the dot grid in degrees. Default 0.

***

### HueRotate

Defined in: [Components/Effects/HueRotate.tsx:65](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/HueRotate.tsx#L65)

Rotates the hue of each pixel in HSL color space.

- `angle` — Hue rotation in degrees. 180 inverts all colors; 360 returns to original.

***

### ImageLUT

Defined in: [Components/Effects/ImageLUT.tsx:89](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/ImageLUT.tsx#L89)

Applies a 3D LUT from an image file (PNG strip of horizontal slices) for color grading.

- `src` — URL to the LUT image.
- `size` — Grid dimension of the LUT (e.g., 16 for a 16x16x16 LUT).

***

### Invert

Defined in: [Components/Effects/Invert.tsx:39](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Invert.tsx#L39)

Inverts pixel colors.

- `amount` — Inversion amount. 0 is unchanged, 1 is fully inverted. Default 1.

***

### Opacity

Defined in: [Components/Effects/Opacity.tsx:59](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Opacity.tsx#L59)

Adjusts pixel opacity by scaling the alpha channel.

- `amount` — Opacity multiplier. 1 is unchanged, 0 is fully transparent. Default 1.

***

### Posterize

Defined in: [Components/Effects/Posterize.tsx:59](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Posterize.tsx#L59)

Reduces color depth to a fixed number of levels per channel, creating a poster-like flat color effect.

- `levels` — Number of discrete color levels per channel. Minimum 2.

***

### Saturate

Defined in: [Components/Effects/Saturate.tsx:62](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Saturate.tsx#L62)

Adjusts color saturation by interpolating between grayscale and the original color.

- `amount` — Saturation multiplier. 0 is grayscale, 1 is unchanged, greater than 1 oversaturates. Default 1.

***

### Sepia

Defined in: [Components/Effects/Sepia.tsx:47](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Sepia.tsx#L47)

Applies a warm sepia tone effect.

- `amount` — Sepia intensity. 0 is unchanged, 1 is fully sepia. Default 1.

***

### Sharpen

Defined in: [Components/Effects/Sharpen.tsx:101](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Sharpen.tsx#L101)

Sharpens the image using a 3x3 unsharp mask convolution.

- `amount` — Sharpening strength. Higher values produce more aggressive edge enhancement.

***

### Threshold

Defined in: [Components/Effects/Threshold.tsx:59](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Effects/Threshold.tsx#L59)

Converts each pixel to pure black or white based on a luminance threshold.

- `threshold` — Luminance threshold (0-255). Pixels at or above become white.

## Generative

### ConicGradient

Defined in: [Components/Generative/ConicGradient.tsx:55](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Generative/ConicGradient.tsx#L55)

Renders a conic (angular) gradient sweep around a center point.

- `stops` — Array of color stops with `color` and `position` (0-1).
- `centerX` — Horizontal center as a fraction of width. Default 0.5.
- `centerY` — Vertical center as a fraction of height. Default 0.5.
- `startAngle` — Starting angle in degrees. Default 0.

***

### DotPattern

Defined in: [Components/Generative/DotPattern.tsx:52](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Generative/DotPattern.tsx#L52)

Renders a repeating dot pattern on a regular grid.

- `seed` — Random seed (reserved for future jitter support).
- `spacing` — Distance between dot centers in pixels.
- `radius` — Dot radius in pixels.
- `color` — Dot fill color.
- `background` — Optional background fill color.

***

### GridPattern

Defined in: [Components/Generative/GridPattern.tsx:64](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Generative/GridPattern.tsx#L64)

Renders a repeating grid of horizontal and vertical lines.

- `seed` — Random seed (reserved for future jitter support).
- `spacingX` — Horizontal spacing between vertical lines in pixels.
- `spacingY` — Vertical spacing between horizontal lines. Defaults to `spacingX`.
- `thickness` — Line thickness in pixels.
- `color` — Line color.
- `background` — Optional background fill color.

***

### LinearGradient

Defined in: [Components/Generative/LinearGradient.tsx:57](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Generative/LinearGradient.tsx#L57)

Renders a linear gradient across the component area.

- `stops` — Array of color stops with `color` and `position` (0-1).
- `angle` — Gradient angle in degrees. 0 is left-to-right. Default 0.

***

### LinePattern

Defined in: [Components/Generative/LinePattern.tsx:71](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Generative/LinePattern.tsx#L71)

Renders a repeating pattern of parallel lines at a configurable angle.

- `seed` — Random seed (reserved for future jitter support).
- `spacing` — Distance between lines in pixels.
- `thickness` — Line thickness in pixels.
- `angle` — Line angle in degrees. 0 is horizontal. Default 0.
- `color` — Line color.
- `background` — Optional background fill color.

***

### ProceduralNoise

Defined in: [Components/Generative/ProceduralNoise.tsx:60](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Generative/ProceduralNoise.tsx#L60)

Generates procedural noise textures using simplex noise with fractal Brownian motion.

- `type` — Noise algorithm. `"simplex"` or `"perlin"` (uses simplex with seed offset).
- `seed` — Random seed for reproducible patterns.
- `scale` — Frequency scale. Smaller values produce larger features. Default 0.01.
- `octaves` — Number of noise layers for fBm detail. Default 1.
- `persistence` — Amplitude falloff per octave. Default 0.5.
- `tint` — RGB tint [r, g, b] (0-255). Default: grayscale.

***

### RadialGradient

Defined in: [Components/Generative/RadialGradient.tsx:58](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Generative/RadialGradient.tsx#L58)

Renders a radial gradient radiating from a center point.

- `stops` — Array of color stops with `color` and `position` (0-1).
- `centerX` — Horizontal center as a fraction of width. Default 0.5.
- `centerY` — Vertical center as a fraction of height. Default 0.5.
- `radius` — Gradient radius as a fraction of the smaller dimension. Default 0.5.

## Blend Modes

### Color

Defined in: [Components/BlendModes/Color.tsx:26](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Color.tsx#L26)

Applies the hue and saturation of the blend layer while preserving the luminosity of the base.
Useful for colorizing grayscale images or shifting color tones.

***

### ColorBurn

Defined in: [Components/BlendModes/ColorBurn.tsx:24](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/ColorBurn.tsx#L24)

Darkens the base by increasing contrast relative to the blend layer.
Produces deeper shadows than Multiply with more saturated mid-tones.

***

### ColorDodge

Defined in: [Components/BlendModes/ColorDodge.tsx:24](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/ColorDodge.tsx#L24)

Brightens the base by decreasing contrast relative to the blend layer.
Produces lighter highlights than Screen with more vivid color shifts.

***

### Darken

Defined in: [Components/BlendModes/Darken.tsx:23](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Darken.tsx#L23)

Keeps the darker of the base or blend value for each channel.
Useful for removing white backgrounds or combining dark elements.

***

### DarkerColor

Defined in: [Components/BlendModes/DarkerColor.tsx:25](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/DarkerColor.tsx#L25)

Compares the overall luminance of base and blend pixels and keeps the darker one.
Unlike Darken, operates on the whole pixel rather than per-channel.

***

### Difference

Defined in: [Components/BlendModes/Difference.tsx:23](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Difference.tsx#L23)

Subtracts the darker color from the lighter for each channel.
Identical layers produce black; useful for comparing or creating inverted effects.

***

### Divide

Defined in: [Components/BlendModes/Divide.tsx:19](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Divide.tsx#L19)

Divides the base color by the blend color, producing a brightening effect.
Dark blend values create strong brightening; useful for removing color casts.

***

### Exclusion

Defined in: [Components/BlendModes/Exclusion.tsx:23](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Exclusion.tsx#L23)

Similar to Difference but with lower contrast. Produces a softer inversion effect.
Blending with white inverts the base; blending with black has no effect.

***

### HardLight

Defined in: [Components/BlendModes/HardLight.tsx:27](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/HardLight.tsx#L27)

Multiplies dark blend values and screens light blend values.
Like shining a harsh light on the base layer. Inverse of Overlay.

***

### HardMix

Defined in: [Components/BlendModes/HardMix.tsx:20](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/HardMix.tsx#L20)

Reduces each channel to fully on or fully off based on Vivid Light thresholding.
Produces posterized, high-contrast results with at most 8 colors.

***

### Hue

Defined in: [Components/BlendModes/Hue.tsx:26](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Hue.tsx#L26)

Applies the hue of the blend layer while preserving the saturation and luminosity of the base.
Useful for shifting color tones without affecting brightness or intensity.

***

### Lighten

Defined in: [Components/BlendModes/Lighten.tsx:23](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Lighten.tsx#L23)

Keeps the lighter of the base or blend value for each channel.
Useful for removing black backgrounds or combining light elements.

***

### LighterColor

Defined in: [Components/BlendModes/LighterColor.tsx:25](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/LighterColor.tsx#L25)

Compares the overall luminance of base and blend pixels and keeps the lighter one.
Unlike Lighten, operates on the whole pixel rather than per-channel.

***

### LinearBurn

Defined in: [Components/BlendModes/LinearBurn.tsx:19](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/LinearBurn.tsx#L19)

Adds the base and blend values then subtracts 1 per channel. Produces darker results
than Multiply with a linear falloff.

***

### LinearDodge

Defined in: [Components/BlendModes/LinearDodge.tsx:19](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/LinearDodge.tsx#L19)

Adds the base and blend values per channel, clamped to white.
Also known as Add. Produces lighter results than Screen with a linear curve.

***

### LinearLight

Defined in: [Components/BlendModes/LinearLight.tsx:23](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/LinearLight.tsx#L23)

Combines Linear Burn and Linear Dodge based on the blend brightness.
Burns darks and dodges lights with linear intensity scaling.

***

### Luminosity

Defined in: [Components/BlendModes/Luminosity.tsx:26](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Luminosity.tsx#L26)

Applies the luminosity of the blend layer while preserving the hue and saturation of the base.
Inverse of Color blend mode. Useful for applying tonal values from one image to another.

***

### Multiply

Defined in: [Components/BlendModes/Multiply.tsx:19](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Multiply.tsx#L19)

Multiplies base and blend values per channel, producing darker results.
White is transparent; black produces black. Standard darkening mode.

***

### Overlay

Defined in: [Components/BlendModes/Overlay.tsx:27](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Overlay.tsx#L27)

Multiplies dark base values and screens light base values.
Increases contrast while preserving highlights and shadows. Most common contrast blend mode.

***

### PinLight

Defined in: [Components/BlendModes/PinLight.tsx:23](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/PinLight.tsx#L23)

Replaces base values depending on the blend brightness. Dark blend values
darken via Darken; light blend values lighten via Lighten.

***

### Saturation

Defined in: [Components/BlendModes/Saturation.tsx:26](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Saturation.tsx#L26)

Applies the saturation of the blend layer while preserving the hue and luminosity of the base.
Useful for adjusting color intensity without changing the underlying colors.

***

### Screen

Defined in: [Components/BlendModes/Screen.tsx:23](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Screen.tsx#L23)

Multiplies the inverse of base and blend, producing lighter results.
Black is transparent; white produces white. Standard lightening mode.

***

### SoftLight

Defined in: [Components/BlendModes/SoftLight.tsx:33](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/SoftLight.tsx#L33)

Gently darkens or lightens depending on the blend value.
Like shining a diffused light on the base. Subtler than Overlay or Hard Light.

***

### Subtract

Defined in: [Components/BlendModes/Subtract.tsx:19](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/Subtract.tsx#L19)

Subtracts the blend color from the base color per channel, clamped to black.
Produces dark results; useful for masking or creating silhouettes.

***

### VividLight

Defined in: [Components/BlendModes/VividLight.tsx:20](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/BlendModes/VividLight.tsx#L20)

Combines Color Burn and Color Dodge based on the blend brightness.
Dark blend values increase contrast via burn; light values decrease via dodge.

## Pipeline

### CompositeEffect

Defined in: [Components/CompositeEffect.tsx:29](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/CompositeEffect.tsx#L29)

Two-input pixel effect that composites its children against the layers behind them.
Captures both self and behind pixels, applies an effect callback, and renders the result.

- `effect` — Pixel callback receiving self pixels, behind pixels, and optional map pixels. Returns processed ImageData.

***

### Map

Defined in: [Components/Map.tsx:27](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/Map.tsx#L27)

Marks children as a map input for effects and blend modes. Map luminance
controls where and how strongly the parent effect is applied.

- `compose` — How multiple maps combine: `"intersect"` (multiply), `"add"` (screen), `"subtract"` (difference), `"exclude"` (exclusion).

***

### RasterBlend

Defined in: [Components/RasterBlend.tsx:27](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/RasterBlend.tsx#L27)

Routing component for pixel-level blend modes. Applies a blend formula to
composited layers with optional map-driven opacity control.

- `blend` — Per-pixel blend formula function. Receives normalized source and destination RGB, returns blended RGB.

***

### RasterEffect

Defined in: [Components/RasterEffect.tsx:30](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/RasterEffect.tsx#L30)

Routing component for pixel-level effects. Detects whether children contain
content targets or only map inputs, and delegates to TargetEffect or CompositeEffect.

- `effect` — Pixel callback applied to captured content. Receives ImageData and optional map ImageData.
- `mappedEffect` — Alternative callback used when a map is present and mode is `"parameter"`. Receives content and map ImageData.

***

### TargetEffect

Defined in: [Components/TargetEffect.tsx:27](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/pictel/src/Components/TargetEffect.tsx#L27)

Single-input pixel effect that captures its children and applies a transformation.
Used when the effect only needs the target content, not the layers behind it.

- `effect` — Pixel callback receiving children pixels and optional map pixels. Returns processed ImageData.
