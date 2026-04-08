import { useCallback, useEffect, useRef, type ComponentProps } from "react"
import type { Pipeline } from "@huggingface/transformers"
import { RasterEffect } from "pictel"
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

interface DepthMapProps extends ComponentProps<"div"> {
	/** Hugging Face model ID for depth estimation. Defaults to `onnx-community/depth-anything-v2-small`. */
	model?: string
	/** Model revision hash. Overridable alongside `model`. */
	revision?: string
	backdrop?: boolean
	flatten?: boolean
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
	backdrop,
	flatten,
	...rest
}: DepthMapProps) {
	const pipelineRef = useRef<Promise<Pipeline>>(undefined)

	useEffect(() => {
		pipelineRef.current = requireWebGPU().then(() =>
			getOrLoadPipeline("depth-estimation", model, revision),
		)
	}, [model, revision])

	const effect = useCallback(
		async (pixels: ImageData) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const pipe = await pipelineRef.current!

			return estimateDepth(pixels, pipe)
		},
		[model, revision],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop} flatten={flatten} {...rest} />
	)
}
