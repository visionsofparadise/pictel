import { useCallback, useMemo, type ReactNode } from "react"
import type { Pipeline } from "@huggingface/transformers"
import { Pipeline as PictelPipeline, type PipelineCallback } from "pictel"
import { imageDataToRawImage, rawImageToImageData } from "../bridge"
import { getOrLoadPipeline } from "../registry"
import { requireWebGPU } from "../webgpu"

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
	/** Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`. */
	model?: string
	/** Model revision hash. Overridable alongside `model`. */
	revision?: string
	children: ReactNode
}

/**
 * Produces a grayscale depth map from child content via the `depth-estimation` pipeline. Uses `onnx-community/depth-anything-v2-small` by default.
 *
 * - `model` — Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`.
 * - `revision` — Model revision hash. Overridable alongside `model`.
 *
 * @param props
 * @category Analysis
 */
export function DepthMap({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	children,
}: DepthMapProps) {
	const pipelinePromise = useMemo(
		() => requireWebGPU().then(() => getOrLoadPipeline("depth-estimation", model, revision)),
		[model, revision],
	)

	const effect = useCallback<PipelineCallback>(
		async (target) => {
			const pipe = await pipelinePromise
			const pixels = await estimateDepth(target, pipe)

			return { pixels }
		},
		[pipelinePromise],
	)

	return (
		<PictelPipeline effect={effect}>
			{children}
		</PictelPipeline>
	)
}
