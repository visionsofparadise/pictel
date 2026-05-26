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
