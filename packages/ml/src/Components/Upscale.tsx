import { useCallback, useMemo, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
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

interface UpscaleProps {
	/** Hugging Face model ID for super-resolution. Defaults to `Xenova/swin2SR-classical-sr-x2-64`. */
	model?: string
	/** Model revision hash. Overridable alongside `model`. */
	revision?: string
	children: ReactNode
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
	children,
}: UpscaleProps) {
	const pipelinePromise = useMemo(
		() => requireWebGPU().then(() => getOrLoadPipeline("image-to-image", model, revision)),
		[model, revision],
	)

	const effect = useCallback<RasterEffectCallback>(
		async (target) => {
			const pipe = await pipelinePromise
			const pixels = await upscale(target, pipe)

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
