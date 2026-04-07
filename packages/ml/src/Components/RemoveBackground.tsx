import { useCallback, useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react"
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

interface RemoveBackgroundProps extends ComponentPropsWithoutRef<"div"> {
	model?: string
	revision?: string
	mode?: "parameter" | "mix"
	backdrop?: boolean
	flatten?: boolean
	children?: ReactNode
}

export function RemoveBackground({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	mode = "mix",
	backdrop,
	flatten,
	children,
	...rest
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
		<RasterEffect effect={effect} mode={mode} backdrop={backdrop} flatten={flatten} {...rest}>
			{children}
		</RasterEffect>
	)
}
