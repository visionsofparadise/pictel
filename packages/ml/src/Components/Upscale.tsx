import { useCallback, useEffect, useRef, type ComponentProps } from "react"
import { RasterEffect } from "pictel"
import type { Pipeline } from "@huggingface/transformers"
import type { RawImage } from "@huggingface/transformers"
import { imageDataToRawImage, rawImageToImageData } from "../bridge"
import { getOrLoadPipeline } from "../registry"
import { requireWebGPU } from "../webgpu"

const DEFAULT_MODEL = "Xenova/swin2SR-classical-sr-x2-64"
const DEFAULT_REVISION = "93dfc9089abda257351d3a58d5771e2c1ff69442"

export async function upscale(pixels: ImageData, pipe: Pipeline): Promise<ImageData> {
	const raw = imageDataToRawImage(pixels)
	const result = (await pipe(raw)) as RawImage

	return rawImageToImageData(result)
}

interface UpscaleProps extends ComponentProps<"div"> {
	/** Hugging Face model ID for super-resolution. Defaults to `Xenova/swin2SR-classical-sr-x2-64`. */
	model?: string
	/** Model revision hash. Overridable alongside `model`. */
	revision?: string
	backdrop?: boolean
	flatten?: boolean
}

/**
 * Upscales child content to higher resolution via the `image-to-image` pipeline. Uses `Xenova/swin2SR-classical-sr-x2-64` by default.
 *
 * - `model` — Hugging Face model ID for super-resolution. Defaults to `Xenova/swin2SR-classical-sr-x2-64`.
 * - `revision` — Model revision hash. Overridable alongside `model`.
 *
 * @param props
 * @category Enhancement
 */
export function Upscale({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	backdrop,
	flatten,
	...rest
}: UpscaleProps) {
	const pipelineRef = useRef<Promise<Pipeline>>(undefined)

	useEffect(() => {
		pipelineRef.current = requireWebGPU().then(() =>
			getOrLoadPipeline("image-to-image", model, revision),
		)
	}, [model, revision])

	const effect = useCallback(
		async (pixels: ImageData) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const pipe = await pipelineRef.current!

			return upscale(pixels, pipe)
		},
		[model, revision],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop} flatten={flatten} {...rest} />
	)
}
