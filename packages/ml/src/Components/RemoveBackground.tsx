import { useCallback, useEffect, useMemo, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { Pipeline } from "@huggingface/transformers"
import { imageDataToRawImage, rawImageToImageData } from "../bridge"
import { runPipeline, subscribePipeline } from "../registry"
import { requireWebGPU } from "../webgpu"

const TASK = "background-removal"

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
	const subscription = useMemo(
		() => {
			const sub = subscribePipeline(TASK, model, revision)
			const promise = requireWebGPU().then(() => sub.promise)

			return { promise, unsubscribe: sub.unsubscribe }
		},
		[model, revision],
	)
	useEffect(() => subscription.unsubscribe, [subscription])

	const effect = useCallback<RasterEffectCallback>(
		async (target) => {
			await subscription.promise

			return {
				pixels: await runPipeline(TASK, model, revision, (pipe) => removeBackground(target, pipe)),
			}
		},
		[subscription, model, revision],
	)

	return (
		<RasterEffect effect={effect}>
			{children}
		</RasterEffect>
	)
}
