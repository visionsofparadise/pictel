import { describe, it, expect, beforeAll, vi } from "vitest"

class MockTensor {
	readonly type: string
	readonly data: ArrayLike<number | bigint>
	readonly dims: number[]

	constructor(type: string, data: ArrayLike<number | bigint>, dims: number[]) {
		this.type = type
		this.data = data
		this.dims = dims
	}
}

class MockRawImage {
	readonly data: Uint8ClampedArray | Uint8Array
	readonly width: number
	readonly height: number
	readonly channels: 1 | 2 | 3 | 4

	constructor(data: Uint8ClampedArray | Uint8Array, width: number, height: number, channels: 1 | 2 | 3 | 4) {
		this.data = data
		this.width = width
		this.height = height
		this.channels = channels
	}
}

const mockGetImageEmbeddings = vi.fn()
const mockModelCall = vi.fn()
const mockPostProcessMasks = vi.fn()
const mockProcessorCall = vi.fn()

const mockModel = Object.assign(mockModelCall, {
	get_image_embeddings: mockGetImageEmbeddings,
})

const mockProcessor = Object.assign(mockProcessorCall, {
	post_process_masks: mockPostProcessMasks,
})

vi.mock("@huggingface/transformers", () => ({
	Sam2Model: { from_pretrained: vi.fn() },
	AutoProcessor: { from_pretrained: vi.fn() },
	Tensor: MockTensor,
	RawImage: MockRawImage,
}))

beforeAll(() => {
	globalThis.ImageData = class ImageData {
		readonly data: Uint8ClampedArray
		readonly width: number
		readonly height: number

		constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
			if (typeof dataOrWidth === "number") {
				this.width = dataOrWidth
				this.height = widthOrHeight
				this.data = new Uint8ClampedArray(dataOrWidth * widthOrHeight * 4)
			} else {
				this.data = dataOrWidth
				this.width = widthOrHeight
				this.height = height!
			}
		}
	} as unknown as typeof globalThis.ImageData
})

function setupMocks(maskData: Uint8Array, maskDims: number[], iouScores: Float32Array) {
	const imageEmbeddings = { image_embeddings: "mock_embeddings" }

	mockProcessorCall.mockResolvedValue({
		pixel_values: "mock_pixels",
		original_sizes: [[2, 2]],
		reshaped_input_sizes: [[2, 2]],
	})

	mockGetImageEmbeddings.mockResolvedValue(imageEmbeddings)

	mockModelCall.mockResolvedValue({
		pred_masks: new MockTensor("float32", new Float32Array(4), [1, 1, 2, 2]),
		iou_scores: new MockTensor("float32", iouScores, [1, iouScores.length]),
	})

	mockPostProcessMasks.mockResolvedValue([
		new MockTensor("bool", maskData, maskDims),
	])
}

describe("sam2Segment", () => {
	it("produces a white-on-black mask from the best scoring mask", async () => {
		const { sam2Segment } = await import("./Sam2")

		// 2x2 mask: top-left and bottom-right are foreground
		const maskData = new Uint8Array([1, 0, 0, 1])
		setupMocks(maskData, [1, 1, 2, 2], new Float32Array([0.95]))

		const input = new ImageData(new Uint8ClampedArray(2 * 2 * 4), 2, 2)
		const result = await sam2Segment(input, mockModel as never, mockProcessor as never, [{ x: 100, y: 200 }], [])

		expect(result.width).toBe(2)
		expect(result.height).toBe(2)

		// Top-left: white (foreground)
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(255)
		expect(result.data[3]).toBe(255)

		// Top-right: black (background)
		expect(result.data[4]).toBe(0)
		expect(result.data[5]).toBe(0)
		expect(result.data[6]).toBe(0)
		expect(result.data[7]).toBe(255)

		// Bottom-left: black (background)
		expect(result.data[8]).toBe(0)
		expect(result.data[9]).toBe(0)
		expect(result.data[10]).toBe(0)
		expect(result.data[11]).toBe(255)

		// Bottom-right: white (foreground)
		expect(result.data[12]).toBe(255)
		expect(result.data[13]).toBe(255)
		expect(result.data[14]).toBe(255)
		expect(result.data[15]).toBe(255)
	})

	it("builds correct point and label tensors from points and negativePoints", async () => {
		const { sam2Segment } = await import("./Sam2")

		const maskData = new Uint8Array([0])
		setupMocks(maskData, [1, 1, 1, 1], new Float32Array([0.9]))

		const input = new ImageData(new Uint8ClampedArray(1 * 1 * 4), 1, 1)
		await sam2Segment(
			input,
			mockModel as never,
			mockProcessor as never,
			[{ x: 10, y: 20 }, { x: 30, y: 40 }],
			[{ x: 50, y: 60 }],
		)

		const callArgs = mockModelCall.mock.calls.at(-1)![0] as Record<string, unknown>
		const inputPoints = callArgs.input_points as MockTensor
		const inputLabels = callArgs.input_labels as MockTensor

		// 2 positive + 1 negative = 3 points
		expect(inputPoints.dims).toEqual([1, 1, 3, 2])
		expect(Array.from(inputPoints.data as Float32Array)).toEqual([10, 20, 30, 40, 50, 60])

		expect(inputLabels.dims).toEqual([1, 1, 3])
		expect(Array.from(inputLabels.data as BigInt64Array)).toEqual([1n, 1n, 0n])
	})

	it("selects the mask with the highest IoU score", async () => {
		const { sam2Segment } = await import("./Sam2")

		// 3 masks for a 1x1 image: mask 0 = off, mask 1 = on (best), mask 2 = off
		const maskData = new Uint8Array([0, 1, 0])
		const iouScores = new Float32Array([0.5, 0.99, 0.3])

		mockProcessorCall.mockResolvedValue({
			pixel_values: "mock_pixels",
			original_sizes: [[1, 1]],
			reshaped_input_sizes: [[1, 1]],
		})
		mockGetImageEmbeddings.mockResolvedValue({ image_embeddings: "mock" })
		mockModelCall.mockResolvedValue({
			pred_masks: new MockTensor("float32", new Float32Array(3), [1, 3, 1, 1]),
			iou_scores: new MockTensor("float32", iouScores, [1, 3]),
		})
		mockPostProcessMasks.mockResolvedValue([
			new MockTensor("bool", maskData, [1, 3, 1, 1]),
		])

		const input = new ImageData(new Uint8ClampedArray(1 * 1 * 4), 1, 1)
		const result = await sam2Segment(input, mockModel as never, mockProcessor as never, [{ x: 0, y: 0 }], [])

		// Best mask (index 1) is on, so output should be white
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(255)
		expect(result.data[3]).toBe(255)
	})

	it("does not mutate the input ImageData", async () => {
		const { sam2Segment } = await import("./Sam2")

		const maskData = new Uint8Array([1, 1, 1, 1])
		setupMocks(maskData, [1, 1, 2, 2], new Float32Array([0.9]))

		const inputData = new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60, 255, 70, 80, 90, 255, 100, 110, 120, 255])
		const inputCopy = new Uint8ClampedArray(inputData)
		const input = new ImageData(inputData, 2, 2)

		await sam2Segment(input, mockModel as never, mockProcessor as never, [{ x: 0, y: 0 }], [])

		expect(Array.from(input.data)).toEqual(Array.from(inputCopy))
	})
})
