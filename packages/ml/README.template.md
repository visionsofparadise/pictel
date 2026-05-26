# @pictel/ml

ML effects for [pictel](https://www.npmjs.com/package/pictel), powered by [Transformers.js](https://huggingface.co/docs/transformers.js) running on WebGPU. Segmentation, depth estimation, upscaling — all as React components.

## Install

```bash
npm i @pictel/ml pictel react react-dom
```

## Requirements

- A WebGPU-capable browser (Chrome / Edge stable, Safari 18+, Firefox via flag).
- Models load on mount; first render waits on weight download (~MB-scale per model).
- Headless `@pictel/cli` runs require Chromium launched with `--enable-unsafe-webgpu` (the CLI handles this).

## What's in here

- **Segmentation** — `RemoveBackground`, `Sam2` (point-prompt), `SegFormer` (automatic)
- **Analysis** — `DepthMap`
- **Enhancement** — `Upscale` (2x)

## Usage

```tsx
import { Canvas, Image, staticFile } from "pictel"
import { ConicGradient } from "@pictel/effects"
import { RemoveBackground } from "@pictel/ml"

export default function Cutout() {
  return (
    <Canvas dimensions={{ width: 1024, height: 1024 }}>
      <ConicGradient
        stops={[
          { color: "#fcb", position: 0 },
          { color: "#bcf", position: 1 },
        ]}
      />
      <RemoveBackground>
        <Image src={staticFile("portrait.jpg")} />
      </RemoveBackground>
    </Canvas>
  )
}
```

ML components are `RasterEffect`s: they accept `mode="parameter" | "mix"` and apply/map children the same way as any effect. Wrap in `<Map>` to use the result as a parameter source for downstream effects:

```tsx
<DisplacementMap>
  <Image src="/photo.jpg" />
  <Map>
    <DepthMap><Image src="/photo.jpg" /></DepthMap>
  </Map>
</DisplacementMap>
```

## API
