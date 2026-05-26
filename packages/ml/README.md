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

## Segmentation

### RemoveBackground()

> **RemoveBackground**(`props`): `Element`

Defined in: [Components/RemoveBackground.tsx:38](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/Components/RemoveBackground.tsx#L38)

Removes the background from child content, outputting RGBA with model-derived alpha. Uses `onnx-community/BEN2-ONNX` by default.

- `model` — Hugging Face model ID for background removal. Defaults to `onnx-community/BEN2-ONNX`.
- `revision` — Model revision hash. Overridable alongside `model`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `RemoveBackgroundProps` | - |

#### Returns

`Element`

***

### Sam2()

> **Sam2**(`props`): `Element`

Defined in: [Components/Sam2.tsx:151](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/Components/Sam2.tsx#L151)

Point-prompted segmentation using SAM2. Outputs a white-on-black mask for the region matching the given prompts. Uses `onnx-community/sam2-hiera-tiny-ONNX` by default.

- `points` — Positive point prompts indicating the target region.
- `negativePoints` — Negative point prompts indicating regions to exclude.
- `model` — Hugging Face model ID for SAM2. Defaults to `onnx-community/sam2-hiera-tiny-ONNX`.
- `revision` — Model revision. Overridable alongside `model`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `Sam2Props` | - |

#### Returns

`Element`

***

### SegFormer()

> **SegFormer**(`props`): `Element`

Defined in: [Components/SegFormer.tsx:83](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/Components/SegFormer.tsx#L83)

Automatic semantic segmentation via the `image-segmentation` pipeline. Outputs a color-coded segment map. Uses `Xenova/segformer-b0-finetuned-ade-512-512` by default.

- `model` — Hugging Face model ID for semantic segmentation. Defaults to `Xenova/segformer-b0-finetuned-ade-512-512`.
- `revision` — Model revision. Overridable alongside `model`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `SegFormerProps` | - |

#### Returns

`Element`

***

### Segment()

> **Segment**(`props`): `Element`

Defined in: [Components/Segment.tsx:27](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/Components/Segment.tsx#L27)

Discriminated union component that delegates to [Sam2](#sam2) or [SegFormer](#segformer) based on the `model` prop. Use `model="sam2"` for point-prompted segmentation or `model="segformer"` for automatic semantic segmentation.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `SegmentProps` | - |

#### Returns

`Element`

## Enhancement

### Upscale()

> **Upscale**(`props`): `Element`

Defined in: [Components/Upscale.tsx:36](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/Components/Upscale.tsx#L36)

Upscales child content to higher resolution via the `image-to-image` pipeline. Uses `Xenova/swin2SR-classical-sr-x2-64` by default.

- `model` — Hugging Face model ID for super-resolution. Defaults to `Xenova/swin2SR-classical-sr-x2-64`.
- `revision` — Model revision hash. Overridable alongside `model`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `UpscaleProps` | - |

#### Returns

`Element`

## Analysis

### DepthMap()

> **DepthMap**(`props`): `Element`

Defined in: [Components/DepthMap.tsx:37](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/Components/DepthMap.tsx#L37)

Produces a grayscale depth map from child content via the `depth-estimation` pipeline. Uses `onnx-community/depth-anything-v2-small` by default.

- `model` — Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`.
- `revision` — Model revision hash. Overridable alongside `model`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DepthMapProps` | - |

#### Returns

`Element`
