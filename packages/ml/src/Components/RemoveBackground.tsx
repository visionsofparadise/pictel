import { useCallback, useMemo, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { Pipeline } from "@huggingface/transformers"
import { imageDataToRawImage, rawImageToImageData } from "../bridge"
import { getOrLoadPipeline } from "../registry"
import { requireWebGPU } from "../webgpu"

const DEFAULT_MODEL = "onnx-community/BEN2-ONNX"
const DEFAULT_REVISION = "c552aa82688edce09f0ac9d2e31ad53d9d629010"

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
export async function removeBackground(pixels: ImageData, pipe: Pipeline): Promise<ImageData> {
	const raw = imageDataToRawImage(pixels)
	const result = await pipe(raw)
	const single = Array.isArray(result) ? result[0] : result

	return rawImageToImageData(single)
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

interface RemoveBackgroundProps {
	model?: string
	revision?: string
	children: ReactNode
}

/**
 * Removes the background from the child content — the subject keeps its color, everything else becomes transparent. Stack over any background (gradient, image, solid color) for cutout compositions. Requires WebGPU.
 *
 * - `model` — Hugging Face model ID for background removal. Defaults to `onnx-community/BEN2-ONNX`.
 * - `revision` — Pinned model revision hash. Defaults to the commit the package ships against. Override alongside `model` when swapping models.
 *
 * @param props
 * @category Segmentation
 */
export function RemoveBackground({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	children,
}: RemoveBackgroundProps) {
	const pipelinePromise = useMemo(
		() => requireWebGPU().then(() => getOrLoadPipeline("background-removal", model, revision)),
		[model, revision],
	)

	const effect = useCallback<RasterEffectCallback>(
		async (target) => {
			const pipe = await pipelinePromise
			const pixels = await removeBackground(target, pipe)

			return { pixels }
		},
		[pipelinePromise],
	)

	return (
		<RasterEffect effect={effect}>
			{children}
		</RasterEffect>
	)
}
