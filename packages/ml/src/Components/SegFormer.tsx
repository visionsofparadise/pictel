import { useCallback, useEffect, useMemo, type ReactNode } from "react"
import type { Pipeline } from "@huggingface/transformers"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { imageDataToRawImage, rawImageToImageData } from "../bridge"
import { runPipeline, subscribePipeline } from "../registry"
import { requireWebGPU } from "../webgpu"

const TASK = "image-segmentation"

const DEFAULT_MODEL = "Xenova/segformer-b0-finetuned-ade-512-512"
const DEFAULT_REVISION = "main"

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export async function segFormerSegment(pixels: ImageData, pipe: Pipeline): Promise<ImageData> {
	const raw = imageDataToRawImage(pixels)
	const results: Array<{ label: string; mask: unknown }> = await pipe(raw)

	if (results.length === 0) {
		return new ImageData(pixels.width, pixels.height)
	}

	const width = pixels.width
	const height = pixels.height
	const output = new ImageData(width, height)
	const pixelCount = width * height

	for (let segIdx = 0; segIdx < results.length; segIdx++) {
		const maskImage = rawImageToImageData(results[segIdx]!.mask as never)
		const color = segmentColor(segIdx)

		for (let px = 0; px < pixelCount; px++) {
			if (maskImage.data[px * 4]! > 0) {
				output.data[px * 4] = color[0]!
				output.data[px * 4 + 1] = color[1]!
				output.data[px * 4 + 2] = color[2]!
				output.data[px * 4 + 3] = 255
			}
		}
	}

	for (let px = 0; px < pixelCount; px++) {
		if (output.data[px * 4 + 3] === 0) {
			output.data[px * 4 + 3] = 255
		}
	}

	return output
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment */

function segmentColor(index: number): [number, number, number] {
	const palette: Array<[number, number, number]> = [
		[230, 25, 75], [60, 180, 75], [255, 225, 25], [0, 130, 200],
		[245, 130, 48], [145, 30, 180], [70, 240, 240], [240, 50, 230],
		[210, 245, 60], [250, 190, 212], [0, 128, 128], [220, 190, 255],
		[170, 110, 40], [255, 250, 200], [128, 0, 0], [170, 255, 195],
		[128, 128, 0], [255, 215, 180], [0, 0, 128], [128, 128, 128],
	]

	return palette[index % palette.length]!
}

interface SegFormerProps {
	model?: string
	revision?: string
	children: ReactNode
}

/**
 * Automatic semantic segmentation — labels every region of the child content and outputs a color-coded segment map (each detected class gets a deterministic palette color). Reach for this when you want every object segmented without prompting; use `Sam2` instead when you need to target a specific region by clicking points. Pass through a downstream effect's `map` prop to drive per-segment effects. Requires WebGPU.
 *
 * - `model` — Hugging Face model ID for semantic segmentation. Defaults to `Xenova/segformer-b0-finetuned-ade-512-512`.
 * - `revision` — Pinned model revision. Defaults to `main`. Override alongside `model` when swapping models.
 *
 * @param props
 * @category Segmentation
 */
export function SegFormer({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	children,
}: SegFormerProps) {
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
				pixels: await runPipeline(TASK, model, revision, (pipe) => segFormerSegment(target, pipe)),
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
