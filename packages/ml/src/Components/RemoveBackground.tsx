import { useCallback, useEffect, useRef, type ReactNode } from "react"
import { RasterEffect } from "pictel"
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

	return rawImageToImageData(result)
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

interface RemoveBackgroundProps {
	/** Hugging Face model ID for background removal. Defaults to `onnx-community/BEN2-ONNX`. */
	model?: string
	/** Model revision hash. Overridable alongside `model`. */
	revision?: string
	backdrop?: boolean
	flatten?: boolean
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
	backdrop,
	flatten,
	children,
}: RemoveBackgroundProps) {
	const pipelineRef = useRef<Promise<Pipeline>>(undefined)

	useEffect(() => {
		pipelineRef.current = requireWebGPU().then(() =>
			getOrLoadPipeline("background-removal", model, revision),
		)
	}, [model, revision])

	const effect = useCallback(
		async (pixels: ImageData) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const pipe = await pipelineRef.current!

			return removeBackground(pixels, pipe)
		},
		[model, revision],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop} flatten={flatten}>
			{children}
		</RasterEffect>
	)
}
