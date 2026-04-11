import { useCallback, useEffect, useRef, type ReactNode } from "react"
import { RasterEffect } from "pictel"
import { Sam2Model, AutoProcessor, Tensor, RawImage } from "@huggingface/transformers"
import type { Processor } from "@huggingface/transformers"
import { requireWebGPU } from "../webgpu"

const DEFAULT_MODEL = "onnx-community/sam2-hiera-tiny-ONNX"
const DEFAULT_REVISION = "main"

interface Sam2Resources {
	model: Sam2Model
	processor: Processor
}

const loading = new Map<string, Promise<Sam2Resources>>()

function getOrLoadSam2(modelId: string, revision: string): Promise<Sam2Resources> {
	const key = `${modelId}:${revision}`
	const existing = loading.get(key)

	if (existing) return existing

	const promise = Promise.all([
		Sam2Model.from_pretrained(modelId, {
			dtype: { vision_encoder: "q4", prompt_encoder_mask_decoder: "fp32" } as unknown as "auto",
			device: "webgpu",
			revision,
		}) as Promise<Sam2Model>,
		AutoProcessor.from_pretrained(modelId, { revision } as Record<string, string>),
	]).then(([sam2, proc]) => ({ model: sam2, processor: proc }))

	loading.set(key, promise)

	return promise
}

export interface Point {
	x: number
	y: number
}

/* eslint-disable @typescript-eslint/naming-convention */
export async function sam2Segment(
	pixels: ImageData,
	sam2Model: Sam2Model,
	processor: Processor,
	points: ReadonlyArray<Point>,
	negativePoints: ReadonlyArray<Point>,
): Promise<ImageData> {
	const raw = new RawImage(pixels.data, pixels.width, pixels.height, 4)
	const imageProcessed: Record<string, unknown> = await (processor as (img: RawImage) => Promise<Record<string, unknown>>)(raw)
	const imageEmbeddings = await sam2Model.get_image_embeddings(imageProcessed as { pixel_values: Tensor })

	const allPoints = [...points, ...negativePoints]
	const coords = allPoints.flatMap((pt) => [pt.x, pt.y])
	const labels = [
		...points.map(() => 1n),
		...negativePoints.map(() => 0n),
	]

	const inputPoints = new Tensor("float32", new Float32Array(coords), [1, 1, allPoints.length, 2])
	const inputLabels = new Tensor("int64", new BigInt64Array(labels), [1, 1, allPoints.length])

	const outputs: { pred_masks: Tensor; iou_scores: Tensor } = await (sam2Model as unknown as (inputs: Record<string, unknown>) => Promise<{ pred_masks: Tensor; iou_scores: Tensor }>)({
		...imageEmbeddings,
		input_points: inputPoints,
		input_labels: inputLabels,
	})

	const masks: Array<Tensor> = await (processor as unknown as { post_process_masks: (masks: Tensor, originalSizes: unknown, reshapedSizes: unknown) => Promise<Array<Tensor>> }).post_process_masks(
		outputs.pred_masks,
		imageProcessed.original_sizes,
		imageProcessed.reshaped_input_sizes,
	)

	// Select the mask with the highest IoU score
	const iouData = outputs.iou_scores.data as Float32Array
	let bestIdx = 0
	let bestScore = -Infinity

	for (let scoreIdx = 0; scoreIdx < iouData.length; scoreIdx++) {
		const score = iouData[scoreIdx] ?? -Infinity

		if (score > bestScore) {
			bestScore = score
			bestIdx = scoreIdx
		}
	}

	// masks[0] has dims [1, numMasks, height, width] — extract the best mask
	const mask = masks[0]

	if (!mask) throw new Error("SAM2 returned no masks")

	const maskData = mask.data as Uint8Array
	const maskHeight = mask.dims[2] ?? pixels.height
	const maskWidth = mask.dims[3] ?? pixels.width
	const maskPixelCount = maskHeight * maskWidth
	const bestMaskOffset = bestIdx * maskPixelCount

	const width = pixels.width
	const height = pixels.height
	const output = new ImageData(width, height)

	// The post-processed mask is at original image dimensions
	// maskData is bool (0 or 1) — convert to white-on-black
	const pixelCount = width * height

	for (let px = 0; px < pixelCount; px++) {
		// Scale coordinates if mask dimensions differ from input (shouldn't after post_process_masks, but be safe)
		const mx = Math.min(Math.floor((px % width) * maskWidth / width), maskWidth - 1)
		const my = Math.min(Math.floor(Math.floor(px / width) * maskHeight / height), maskHeight - 1)
		const maskIdx = bestMaskOffset + my * maskWidth + mx

		if (maskData[maskIdx]) {
			output.data[px * 4] = 255
			output.data[px * 4 + 1] = 255
			output.data[px * 4 + 2] = 255
		}

		output.data[px * 4 + 3] = 255
	}

	return output
}
/* eslint-enable @typescript-eslint/naming-convention */

interface Sam2Props {
	/** Hugging Face model ID for SAM2. Defaults to `onnx-community/sam2-hiera-tiny-ONNX`. */
	model?: string
	/** Model revision. Overridable alongside `model`. */
	revision?: string
	/** Positive point prompts indicating the target region. */
	points?: Array<Point>
	/** Negative point prompts indicating regions to exclude. */
	negativePoints?: Array<Point>
	backdrop?: boolean
	flatten?: boolean
	children: ReactNode
}

/**
 * Point-prompted segmentation using SAM2. Outputs a white-on-black mask for the region matching the given prompts. Uses `onnx-community/sam2-hiera-tiny-ONNX` by default.
 *
 * - `points` — Positive point prompts indicating the target region.
 * - `negativePoints` — Negative point prompts indicating regions to exclude.
 * - `model` — Hugging Face model ID for SAM2. Defaults to `onnx-community/sam2-hiera-tiny-ONNX`.
 * - `revision` — Model revision. Overridable alongside `model`.
 *
 * @param props
 * @category Segmentation
 */
export function Sam2({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	points = [],
	negativePoints = [],
	backdrop,
	flatten,
	children,
}: Sam2Props) {
	const resourcesRef = useRef<Promise<Sam2Resources>>(undefined)

	useEffect(() => {
		resourcesRef.current = requireWebGPU().then(() => getOrLoadSam2(model, revision))
	}, [model, revision])

	const effect = useCallback(
		async (pixels: ImageData) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { model: sam2Model, processor } = await resourcesRef.current!

			return sam2Segment(pixels, sam2Model, processor, points, negativePoints)
		},
		[model, revision, points, negativePoints],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop} flatten={flatten}>
			{children}
		</RasterEffect>
	)
}
