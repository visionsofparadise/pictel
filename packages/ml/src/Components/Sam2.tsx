import { useCallback, useEffect, useMemo, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { Sam2Model, AutoProcessor, Tensor, RawImage } from "@huggingface/transformers"
import type { Processor } from "@huggingface/transformers"
import { requireWebGPU } from "../webgpu"
import { createSubscriberCache } from "../subscriber-cache"

const DEFAULT_MODEL = "onnx-community/sam2-hiera-tiny-ONNX"
const DEFAULT_REVISION = "main"

interface Sam2Resources {
	model: Sam2Model
	processor: Processor
}

type Sam2Key = readonly [model: string, revision: string]

const sam2Cache = createSubscriberCache<Sam2Resources, Sam2Key>({
	cacheKey: (modelId, revision) => `${modelId}:${revision}`,
	load: (modelId, revision) =>
		Promise.all([
			Sam2Model.from_pretrained(modelId, {
				dtype: { vision_encoder: "q4", prompt_encoder_mask_decoder: "fp32" } as unknown as "auto",
				device: "webgpu",
				revision,
			}) as Promise<Sam2Model>,
			AutoProcessor.from_pretrained(modelId, { revision } as Record<string, string>),
		]).then(([sam2, proc]) => ({ model: sam2, processor: proc })),
	dispose: async (resources) => {
		// Transformers.js Sam2Model exposes an async `dispose()` for releasing
		// the underlying ONNX session. The Processor has no lifecycle to release.
		await (resources.model as unknown as { dispose?: () => Promise<void> }).dispose?.()
	},
})

function subscribeSam2(modelId: string, revision: string): { promise: Promise<Sam2Resources>; unsubscribe: () => void } {
	return sam2Cache.subscribe(modelId, revision)
}

async function runSam2<R>(
	modelId: string,
	revision: string,
	runner: (resources: Sam2Resources) => Promise<R>,
): Promise<R> {
	return sam2Cache.track([modelId, revision], runner)
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
	const pixelCount = width * height

	for (let px = 0; px < pixelCount; px++) {
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
	model?: string
	revision?: string
	points?: Array<Point>
	negativePoints?: Array<Point>
	children: ReactNode
}

/**
 * Point-prompted segmentation — drop one or more `points` on what you want segmented and SAM2 returns a white-on-black mask of that region. Use `negativePoints` to carve regions out of the result. Reach for this over `SegFormer` when you want to target a specific subject rather than label everything. Pass through a downstream effect's `map` prop to confine that effect to the masked region. Requires WebGPU.
 *
 * - `points` — Positive point prompts in pixel coordinates indicating the target region. Defaults to `[]` (no mask).
 * - `negativePoints` — Negative point prompts in pixel coordinates indicating regions to exclude from the result. Defaults to `[]`.
 * - `model` — Hugging Face model ID for SAM2. Defaults to `onnx-community/sam2-hiera-tiny-ONNX`.
 * - `revision` — Pinned model revision. Defaults to `main`. Override alongside `model` when swapping models.
 *
 * @param props
 * @category Segmentation
 */
export function Sam2({
	model = DEFAULT_MODEL,
	revision = DEFAULT_REVISION,
	points = [],
	negativePoints = [],
	children,
}: Sam2Props) {
	const subscription = useMemo(
		() => {
			const sub = subscribeSam2(model, revision)
			const promise = requireWebGPU().then(() => sub.promise)

			return { promise, unsubscribe: sub.unsubscribe }
		},
		[model, revision],
	)
	useEffect(() => subscription.unsubscribe, [subscription])

	const effect = useCallback<RasterEffectCallback>(
		async (target) => {
			await subscription.promise
			const pixels = await runSam2(model, revision, async ({ model: sam2Model, processor }) =>
				sam2Segment(target, sam2Model, processor, points, negativePoints),
			)

			return { pixels }
		},
		[subscription, model, revision, points, negativePoints],
	)

	return (
		<RasterEffect effect={effect}>
			{children}
		</RasterEffect>
	)
}
