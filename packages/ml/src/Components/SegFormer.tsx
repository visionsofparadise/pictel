import { useCallback, useEffect, useRef, type ReactNode } from "react"
import type { Pipeline } from "@huggingface/transformers"
import { RasterEffect } from "pictel"
import { imageDataToRawImage, rawImageToImageData } from "../bridge"
import { getOrLoadPipeline } from "../registry"
import { requireWebGPU } from "../webgpu"

const DEFAULT_MODEL = "Xenova/segformer-b0-finetuned-ade-512-512"
const DEFAULT_REVISION = "main"

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export async function segFormerSegment(pixels: ImageData, pipe: Pipeline): Promise<ImageData> {
	const raw = imageDataToRawImage(pixels)
	const results: Array<{ label: string; mask: unknown }> = await pipe(raw)

	if (results.length === 0) {
		return new ImageData(pixels.width, pixels.height)
	}

	// Combine all segment masks into a color-coded output
	// Each segment gets a deterministic color based on its index
	const width = pixels.width
	const height = pixels.height
	const output = new ImageData(width, height)
	const pixelCount = width * height

	for (let segIdx = 0; segIdx < results.length; segIdx++) {
		const maskImage = rawImageToImageData(results[segIdx]!.mask as never)
		const color = segmentColor(segIdx)

		for (let px = 0; px < pixelCount; px++) {
			// Mask pixel is white (255) where the segment exists
			if (maskImage.data[px * 4]! > 0) {
				output.data[px * 4] = color[0]!
				output.data[px * 4 + 1] = color[1]!
				output.data[px * 4 + 2] = color[2]!
				output.data[px * 4 + 3] = 255
			}
		}
	}

	// Fill any unassigned pixels with black (alpha 255)
	for (let px = 0; px < pixelCount; px++) {
		if (output.data[px * 4 + 3] === 0) {
			output.data[px * 4 + 3] = 255
		}
	}

	return output
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment */

/** Deterministic color palette for segment indices. */
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
	/** Hugging Face model ID for semantic segmentation. Defaults to `Xenova/segformer-b0-finetuned-ade-512-512`. */
	model?: string
	/** Model revision. Overridable alongside `model`. */
	revision?: string
	backdrop?: boolean
	flatten?: boolean
	children: ReactNode
}

/**
 * Automatic semantic segmentation via the `image-segmentation` pipeline. Outputs a color-coded segment map. Uses `Xenova/segformer-b0-finetuned-ade-512-512` by default.
 *
 * - `model` — Hugging Face model ID for semantic segmentation. Defaults to `Xenova/segformer-b0-finetuned-ade-512-512`.
 * - `revision` — Model revision. Overridable alongside `model`.
 *
 * @param props
 * @category Segmentation
 */
export function SegFormer({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	backdrop,
	flatten,
	children,
}: SegFormerProps) {
	const pipelineRef = useRef<Promise<Pipeline>>(undefined)

	useEffect(() => {
		pipelineRef.current = requireWebGPU().then(() =>
			getOrLoadPipeline("image-segmentation", model, revision),
		)
	}, [model, revision])

	const effect = useCallback(
		async (pixels: ImageData) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const pipe = await pipelineRef.current!

			return segFormerSegment(pixels, pipe)
		},
		[model, revision],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop} flatten={flatten}>
			{children}
		</RasterEffect>
	)
}
