import { useCallback, useEffect, useMemo, type ReactNode } from "react"
import type { Pipeline } from "@huggingface/transformers"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { imageDataToRawImage, rawImageToImageData } from "../bridge"
import { runPipeline, subscribePipeline } from "../registry"
import { requireWebGPU } from "../webgpu"

const TASK = "depth-estimation"

const DEFAULT_MODEL = "onnx-community/depth-anything-v2-small"
const DEFAULT_REVISION = "02504fff2a0de682e3162e5e89bdeab034e1b96d"

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
export async function estimateDepth(pixels: ImageData, pipe: Pipeline): Promise<ImageData> {
	const raw = imageDataToRawImage(pixels)
	const result = await pipe(raw)

	return rawImageToImageData(result.depth)
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

interface DepthMapProps {
	model?: string
	revision?: string
	children: ReactNode
}

/**
 * Produces a grayscale depth map of the child content — nearer surfaces brighter, farther surfaces darker. Pass through a downstream effect's `map` prop to drive depth-based effects (variable-radius blur, depth-cued color grading, parallax displacement). Requires WebGPU.
 *
 * - `model` — Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`.
 * - `revision` — Pinned model revision hash. Defaults to the commit the package ships against. Override alongside `model` when swapping models.
 *
 * @param props
 * @category Analysis
 */
export function DepthMap({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	children,
}: DepthMapProps) {
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
				pixels: await runPipeline(TASK, model, revision, (pipe) => estimateDepth(target, pipe)),
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
