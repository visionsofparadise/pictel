# @pictel/ml

## Segmentation

### RemoveBackground

Defined in: [Components/RemoveBackground.tsx:38](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/ml/src/Components/RemoveBackground.tsx#L38)

Removes the background from child content, outputting RGBA with model-derived alpha. Uses `onnx-community/BEN2-ONNX` by default.

- `model` — Hugging Face model ID for background removal. Defaults to `onnx-community/BEN2-ONNX`.
- `revision` — Model revision hash. Overridable alongside `model`.

***

### Sam2

Defined in: [Components/Sam2.tsx:152](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/ml/src/Components/Sam2.tsx#L152)

Point-prompted segmentation using SAM2. Outputs a white-on-black mask for the region matching the given prompts. Uses `onnx-community/sam2-hiera-tiny-ONNX` by default.

- `points` — Positive point prompts indicating the target region.
- `negativePoints` — Negative point prompts indicating regions to exclude.
- `model` — Hugging Face model ID for SAM2. Defaults to `onnx-community/sam2-hiera-tiny-ONNX`.
- `revision` — Model revision. Overridable alongside `model`.

***

### SegFormer

Defined in: [Components/SegFormer.tsx:84](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/ml/src/Components/SegFormer.tsx#L84)

Automatic semantic segmentation via the `image-segmentation` pipeline. Outputs a color-coded segment map. Uses `Xenova/segformer-b0-finetuned-ade-512-512` by default.

- `model` — Hugging Face model ID for semantic segmentation. Defaults to `Xenova/segformer-b0-finetuned-ade-512-512`.
- `revision` — Model revision. Overridable alongside `model`.

***

### Segment

Defined in: [Components/Segment.tsx:31](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/ml/src/Components/Segment.tsx#L31)

Discriminated union component that delegates to [Sam2](#sam2) or [SegFormer](#segformer) based on the `model` prop. Use `model="sam2"` for point-prompted segmentation or `model="segformer"` for automatic semantic segmentation.

## Enhancement

### Upscale

Defined in: [Components/Upscale.tsx:37](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/ml/src/Components/Upscale.tsx#L37)

Upscales child content to higher resolution via the `image-to-image` pipeline. Uses `Xenova/swin2SR-classical-sr-x2-64` by default.

- `model` — Hugging Face model ID for super-resolution. Defaults to `Xenova/swin2SR-classical-sr-x2-64`.
- `revision` — Model revision hash. Overridable alongside `model`.

## Analysis

### DepthMap

Defined in: [Components/DepthMap.tsx:38](https://github.com/visionsofparadise/pictel/blob/12da5b777a32e9ba23fca6cdc3826f284dedae7f/packages/ml/src/Components/DepthMap.tsx#L38)

Produces a grayscale depth map from child content via the `depth-estimation` pipeline. Uses `onnx-community/depth-anything-v2-small` by default.

- `model` — Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`.
- `revision` — Model revision hash. Overridable alongside `model`.

## Segmentation

### RemoveBackground()

> **RemoveBackground**(`props`): `Element`

Defined in: [Components/RemoveBackground.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/RemoveBackground.tsx#L38)

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

Defined in: [Components/Sam2.tsx:152](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Sam2.tsx#L152)

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

Defined in: [Components/SegFormer.tsx:84](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/SegFormer.tsx#L84)

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

Defined in: [Components/Segment.tsx:31](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Segment.tsx#L31)

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

Defined in: [Components/Upscale.tsx:37](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Upscale.tsx#L37)

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

Defined in: [Components/DepthMap.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/DepthMap.tsx#L38)

Produces a grayscale depth map from child content via the `depth-estimation` pipeline. Uses `onnx-community/depth-anything-v2-small` by default.

- `model` — Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`.
- `revision` — Model revision hash. Overridable alongside `model`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DepthMapProps` | - |

#### Returns

`Element`

## Segmentation

### RemoveBackground()

> **RemoveBackground**(`props`): `Element`

Defined in: [Components/RemoveBackground.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/RemoveBackground.tsx#L38)

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

Defined in: [Components/Sam2.tsx:152](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Sam2.tsx#L152)

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

Defined in: [Components/SegFormer.tsx:84](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/SegFormer.tsx#L84)

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

Defined in: [Components/Segment.tsx:31](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Segment.tsx#L31)

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

Defined in: [Components/Upscale.tsx:37](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Upscale.tsx#L37)

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

Defined in: [Components/DepthMap.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/DepthMap.tsx#L38)

Produces a grayscale depth map from child content via the `depth-estimation` pipeline. Uses `onnx-community/depth-anything-v2-small` by default.

- `model` — Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`.
- `revision` — Model revision hash. Overridable alongside `model`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DepthMapProps` | - |

#### Returns

`Element`

## Segmentation

### RemoveBackground()

> **RemoveBackground**(`props`): `Element`

Defined in: [Components/RemoveBackground.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/RemoveBackground.tsx#L38)

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

Defined in: [Components/Sam2.tsx:152](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Sam2.tsx#L152)

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

Defined in: [Components/SegFormer.tsx:84](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/SegFormer.tsx#L84)

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

Defined in: [Components/Segment.tsx:31](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Segment.tsx#L31)

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

Defined in: [Components/Upscale.tsx:37](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Upscale.tsx#L37)

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

Defined in: [Components/DepthMap.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/DepthMap.tsx#L38)

Produces a grayscale depth map from child content via the `depth-estimation` pipeline. Uses `onnx-community/depth-anything-v2-small` by default.

- `model` — Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`.
- `revision` — Model revision hash. Overridable alongside `model`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DepthMapProps` | - |

#### Returns

`Element`

## Segmentation

### RemoveBackground()

> **RemoveBackground**(`props`): `Element`

Defined in: [Components/RemoveBackground.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/RemoveBackground.tsx#L38)

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

Defined in: [Components/Sam2.tsx:152](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Sam2.tsx#L152)

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

Defined in: [Components/SegFormer.tsx:84](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/SegFormer.tsx#L84)

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

Defined in: [Components/Segment.tsx:31](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Segment.tsx#L31)

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

Defined in: [Components/Upscale.tsx:37](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Upscale.tsx#L37)

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

Defined in: [Components/DepthMap.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/DepthMap.tsx#L38)

Produces a grayscale depth map from child content via the `depth-estimation` pipeline. Uses `onnx-community/depth-anything-v2-small` by default.

- `model` — Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`.
- `revision` — Model revision hash. Overridable alongside `model`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DepthMapProps` | - |

#### Returns

`Element`

## Segmentation

### RemoveBackground()

> **RemoveBackground**(`props`): `Element`

Defined in: [Components/RemoveBackground.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/RemoveBackground.tsx#L38)

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

Defined in: [Components/Sam2.tsx:152](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Sam2.tsx#L152)

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

Defined in: [Components/SegFormer.tsx:84](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/SegFormer.tsx#L84)

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

Defined in: [Components/Segment.tsx:31](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Segment.tsx#L31)

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

Defined in: [Components/Upscale.tsx:37](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Upscale.tsx#L37)

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

Defined in: [Components/DepthMap.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/DepthMap.tsx#L38)

Produces a grayscale depth map from child content via the `depth-estimation` pipeline. Uses `onnx-community/depth-anything-v2-small` by default.

- `model` — Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`.
- `revision` — Model revision hash. Overridable alongside `model`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DepthMapProps` | - |

#### Returns

`Element`

## Segmentation

### RemoveBackground()

> **RemoveBackground**(`props`): `Element`

Defined in: [Components/RemoveBackground.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/RemoveBackground.tsx#L38)

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

Defined in: [Components/Sam2.tsx:152](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Sam2.tsx#L152)

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

Defined in: [Components/SegFormer.tsx:84](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/SegFormer.tsx#L84)

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

Defined in: [Components/Segment.tsx:31](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Segment.tsx#L31)

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

Defined in: [Components/Upscale.tsx:37](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/Upscale.tsx#L37)

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

Defined in: [Components/DepthMap.tsx:38](https://github.com/visionsofparadise/pictel/blob/3617f170671679912909d98a69f4e400ad0a4b92/packages/ml/src/Components/DepthMap.tsx#L38)

Produces a grayscale depth map from child content via the `depth-estimation` pipeline. Uses `onnx-community/depth-anything-v2-small` by default.

- `model` — Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`.
- `revision` — Model revision hash. Overridable alongside `model`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `DepthMapProps` | - |

#### Returns

`Element`
