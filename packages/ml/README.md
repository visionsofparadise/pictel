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

ML components are `RasterEffect`s — they process their children and output pixels. To use the result as a map input for a downstream effect, pass the ML component through the `map` prop on that effect:

```tsx
<DisplacementMap map={<DepthMap><Image src="/photo.jpg" /></DepthMap>}>
  <Image src="/photo.jpg" />
</DisplacementMap>
```

## API

## Segmentation

### RemoveBackground()

> **RemoveBackground**(`props`): `Element`

Defined in: [Components/RemoveBackground.tsx:40](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/Components/RemoveBackground.tsx#L40)

Removes the background from the child content — the subject keeps its color, everything else becomes transparent. Stack over any background (gradient, image, solid color) for cutout compositions. Requires WebGPU.

- `model` — Hugging Face model ID for background removal. Defaults to `onnx-community/BEN2-ONNX`.
- `revision` — Pinned model revision hash. Defaults to the commit the package ships against. Override alongside `model` when swapping models.
- `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `RemoveBackgroundProps` | - |

#### Returns

`Element`

***

### Sam2()

> **Sam2**(`props`): `Element`

Defined in: [Components/Sam2.tsx:154](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/Components/Sam2.tsx#L154)

Point-prompted segmentation — drop one or more `points` on what you want segmented and SAM2 returns a white-on-black mask of that region. Use `negativePoints` to carve regions out of the result. Reach for this over `SegFormer` when you want to target a specific subject rather than label everything. Pass through a downstream effect's `map` prop to confine that effect to the masked region. Requires WebGPU.

- `points` — Positive point prompts in pixel coordinates indicating the target region. Defaults to `[]` (no mask).
- `negativePoints` — Negative point prompts in pixel coordinates indicating regions to exclude from the result. Defaults to `[]`.
- `model` — Hugging Face model ID for SAM2. Defaults to `onnx-community/sam2-hiera-tiny-ONNX`.
- `revision` — Pinned model revision. Defaults to `main`. Override alongside `model` when swapping models.
- `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `Sam2Props` | - |

#### Returns

`Element`

***

### SegFormer()

> **SegFormer**(`props`): `Element`

Defined in: [Components/SegFormer.tsx:80](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/Components/SegFormer.tsx#L80)

Automatic semantic segmentation — labels every region of the child content and outputs a color-coded segment map (each detected class gets a deterministic palette color). Reach for this when you want every object segmented without prompting; use `Sam2` instead when you need to target a specific region by clicking points. Pass through a downstream effect's `map` prop to drive per-segment effects. Requires WebGPU.

- `model` — Hugging Face model ID for semantic segmentation. Defaults to `Xenova/segformer-b0-finetuned-ade-512-512`.
- `revision` — Pinned model revision. Defaults to `main`. Override alongside `model` when swapping models.
- `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.

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

Defined in: [Components/Upscale.tsx:38](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/Components/Upscale.tsx#L38)

Upscales child content to higher resolution — the default model doubles each dimension. The canvas backing buffer grows; the rendered surface keeps the original layout footprint so upscaled pixels read as added detail rather than added size. Requires WebGPU.

- `model` — Hugging Face model ID for super-resolution. Defaults to `Xenova/swin2SR-classical-sr-x2-64` (2×).
- `revision` — Pinned model revision hash. Defaults to the commit the package ships against. Override alongside `model` when swapping models.
- `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `UpscaleProps` | - |

#### Returns

`Element`

## Analysis

### DepthMap()

> **DepthMap**(`props`): `Element`

Defined in: [Components/DepthMap.tsx:39](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/Components/DepthMap.tsx#L39)

Produces a grayscale depth map of the child content — nearer surfaces brighter, farther surfaces darker. Pass through a downstream effect's `map` prop to drive depth-based effects (variable-radius blur, depth-cued color grading, parallax displacement). Requires WebGPU.

- `model` — Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`.
- `revision` — Pinned model revision hash. Defaults to the commit the package ships against. Override alongside `model` when swapping models.
- `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DepthMapProps` | - |

#### Returns

`Element`

## Other

### getOrLoadPipeline()

> **getOrLoadPipeline**(`task`, `model`, `revision`): `Promise`\<`Pipeline`\>

Defined in: [registry.ts:26](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/registry.ts#L26)

Resolve a Transformers.js pipeline, deduplicated by `(task, model, revision)`.

The returned promise is not subscriber-tracked — it is for one-off callers (tests,
direct API users). Mounted React components must use `subscribePipeline` so the
pipeline is disposed when no component is using it.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `task` | `PipelineType` |
| `model` | `string` |
| `revision` | `string` |

#### Returns

`Promise`\<`Pipeline`\>

***

### runPipeline()

> **runPipeline**\<`R`\>(`task`, `model`, `revision`, `runner`): `Promise`\<`R`\>

Defined in: [registry.ts:55](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/registry.ts#L55)

Bracket an inference call so the pipeline is not disposed mid-flight. Increments
an in-flight count for the cache entry; if `unsubscribe` is called during the
inference, disposal is deferred until this call settles.

#### Type Parameters

| Type Parameter |
| ------ |
| `R` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `task` | `PipelineType` |
| `model` | `string` |
| `revision` | `string` |
| `runner` | (`pipe`) => `Promise`\<`R`\> |

#### Returns

`Promise`\<`R`\>

***

### subscribePipeline()

> **subscribePipeline**(`task`, `model`, `revision`): `object`

Defined in: [registry.ts:43](https://github.com/visionsofparadise/pictel/blob/main/packages/ml/src/registry.ts#L43)

Subscribe a mounted component to a Transformers.js pipeline. Returns a promise
for the pipeline and an `unsubscribe` callback for the component's cleanup. When
the subscriber count for the `(task, model, revision)` key reaches zero and no
`runPipeline` call is in flight, the pipeline is disposed and the cache entry is
removed.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `task` | `PipelineType` |
| `model` | `string` |
| `revision` | `string` |

#### Returns

`object`

##### promise

> **promise**: `Promise`\<`Pipeline`\>

##### unsubscribe

> **unsubscribe**: () => `void`

###### Returns

`void`
