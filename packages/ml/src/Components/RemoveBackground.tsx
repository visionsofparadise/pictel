import { useCallback, useEffect, useRef, type ReactNode } from "react"
import { Pipeline as PictelPipeline, type PipelineCallback } from "pictel"
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
	/** Hugging Face model ID for background removal. Defaults to `onnx-community/BEN2-ONNX`. */
	model?: string
	/** Model revision hash. Overridable alongside `model`. */
	revision?: string
	children: ReactNode
}

/**
 * Removes the background from child content, outputting RGBA with model-derived alpha. Uses `onnx-community/BEN2-ONNX` by default.
 *
 * - `model` — Hugging Face model ID for background removal. Defaults to `onnx-community/BEN2-ONNX`.
 * - `revision` — Model revision hash. Overridable alongside `model`.
 *
 * @param props
 * @category Segmentation
 */
export function RemoveBackground({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	children,
}: RemoveBackgroundProps) {
	const pipelineRef = useRef<Promise<Pipeline>>(undefined)

	useEffect(() => {
		pipelineRef.current = requireWebGPU().then(() =>
			getOrLoadPipeline("background-removal", model, revision),
		)
	}, [model, revision])

	const effect = useCallback<PipelineCallback>(
		async (target) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const pipe = await pipelineRef.current!
			const pixels = await removeBackground(target, pipe)

			return { pixels }
		},
		[model, revision],
	)

	return (
		<PictelPipeline effect={effect}>
			{children}
		</PictelPipeline>
	)
}
