import { describe, it, expect, beforeAll, vi } from "vitest"
import { applyHalftone } from "./Halftone"

// Mock canvas context for jsdom (no real Canvas2D)
const mockCtx = {
	fillStyle: "",
	fillRect: vi.fn(),
	translate: vi.fn(),
	rotate: vi.fn(),
	beginPath: vi.fn(),
	arc: vi.fn(),
	fill: vi.fn(),
	getImageData: vi.fn(),
}

beforeAll(() => {
	globalThis.ImageData = class ImageData {
		readonly data: Uint8ClampedArray
		readonly width: number
		readonly height: number

		constructor(data: Uint8ClampedArray, width: number, height: number) {
			this.data = data
			this.width = width
			this.height = height
		}
	} as unknown as typeof globalThis.ImageData

	// Mock OffscreenCanvas
	globalThis.OffscreenCanvas = class {
		width: number
		height: number
		constructor(w: number, h: number) {
			this.width = w
			this.height = h
		}
		getContext() {
			return mockCtx
		}
	} as unknown as typeof globalThis.OffscreenCanvas
})

function solidImage(width: number, height: number, r: number, g: number, b: number): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	for (let i = 0; i < data.length; i += 4) {
		data[i] = r
		data[i + 1] = g
		data[i + 2] = b
		data[i + 3] = 255
	}
	return new ImageData(data, width, height)
}

describe("applyHalftone", () => {
	it("pure black input draws dots at max size", () => {
		const outputData = new Uint8ClampedArray(100 * 100 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 100, 100))
		mockCtx.arc.mockClear()
		mockCtx.fill.mockClear()
		mockCtx.fillRect.mockClear()

		const input = solidImage(100, 100, 0, 0, 0)
		applyHalftone(input, 10)

		// Should have drawn dots (arc calls)
		expect(mockCtx.arc).toHaveBeenCalled()
		// Each dot should have radius close to dotSize/2 = 5
		const firstArcCall = mockCtx.arc.mock.calls[0] as [number, number, number, number, number]
		expect(firstArcCall[2]).toBeCloseTo(5, 0)
	})

	it("pure white input draws no dots", () => {
		const outputData = new Uint8ClampedArray(100 * 100 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 100, 100))
		mockCtx.arc.mockClear()
		mockCtx.fill.mockClear()

		const input = solidImage(100, 100, 255, 255, 255)
		applyHalftone(input, 10)

		// Luminance = 255, radius = 0 -> no arc calls
		expect(mockCtx.arc).not.toHaveBeenCalled()
	})

	it("output dimensions match input", () => {
		const outputData = new Uint8ClampedArray(50 * 30 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 50, 30))
		mockCtx.arc.mockClear()

		const input = solidImage(50, 30, 128, 128, 128)
		const result = applyHalftone(input, 10)

		expect(result.width).toBe(50)
		expect(result.height).toBe(30)
		expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 50, 30)
	})

	it("dotSize affects grid spacing", () => {
		const outputData = new Uint8ClampedArray(100 * 100 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 100, 100))

		const input = solidImage(100, 100, 0, 0, 0)

		// Small dots -> more arc calls
		mockCtx.arc.mockClear()
		applyHalftone(input, 5)
		const smallDotCalls = mockCtx.arc.mock.calls.length

		mockCtx.arc.mockClear()
		applyHalftone(input, 20)
		const largeDotCalls = mockCtx.arc.mock.calls.length

		expect(smallDotCalls).toBeGreaterThan(largeDotCalls)
	})

	it("does not mutate input", () => {
		const outputData = new Uint8ClampedArray(10 * 10 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 10, 10))

		const input = solidImage(10, 10, 100, 150, 200)
		const original = new Uint8ClampedArray(input.data)
		applyHalftone(input, 5)
		expect(input.data).toEqual(original)
	})
})
