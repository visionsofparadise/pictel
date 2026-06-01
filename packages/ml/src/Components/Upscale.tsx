import { useCallback, useEffect, useMemo, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { Pipeline } from "@huggingface/transformers"
import type { RawImage } from "@huggingface/transformers"
import { imageDataToRawImage, rawImageToImageData } from "../bridge"
import { runPipeline, subscribePipeline } from "../registry"
import { requireWebGPU } from "../webgpu"

const TASK = "image-to-image"

const DEFAULT_MODEL = "Xenova/swin2SR-classical-sr-x2-64"
const DEFAULT_REVISION = "93dfc9089abda257351d3a58d5771e2c1ff69442"

export async function upscale(pixels: ImageData, pipe: Pipeline): Promise<ImageData> {
	const raw = imageDataToRawImage(pixels)
	const result = (await pipe(raw)) as RawImage

	return rawImageToImageData(result)
}

interface UpscaleProps {
	model?: string
	revision?: string
	children: ReactNode
	version?: string
}

/**
 * Upscales child content to higher resolution — the default model doubles each dimension. The canvas backing buffer grows; the rendered surface keeps the original layout footprint so upscaled pixels read as added detail rather than added size. Requires WebGPU.
 *
 * - `model` — Hugging Face model ID for super-resolution. Defaults to `Xenova/swin2SR-classical-sr-x2-64` (2×).
 * - `revision` — Pinned model revision hash. Defaults to the commit the package ships against. Override alongside `model` when swapping models.
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Enhancement
 */
export function Upscale({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	children,
	version,
}: UpscaleProps) {
	const internal = `upscale@1+m=${model}+r=${revision}+b=webgpu`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

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
				pixels: await runPipeline(TASK, model, revision, (pipe) => upscale(target, pipe)),
			}
		},
		[subscription, model, revision],
	)

	return (
		<RasterEffect effect={effect} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
