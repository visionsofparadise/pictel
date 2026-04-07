import { useCallback, useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react"
import type { Pipeline } from "@huggingface/transformers"
import { RasterEffect, Map, type MapCompose } from "pictel"
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

interface DepthMapProps extends ComponentPropsWithoutRef<"div"> {
	model?: string
	revision?: string
	mode?: "parameter" | "mix"
	backdrop?: boolean
	compose?: MapCompose
	flatten?: boolean
	children?: ReactNode
}

export function DepthMap({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	mode = "mix",
	backdrop,
	compose = "intersect",
	flatten,
	children,
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
		<Map compose={compose}>
			<RasterEffect effect={effect} mode={mode} backdrop={backdrop} flatten={flatten} {...rest}>
				{children}
			</RasterEffect>
		</Map>
	)
}
