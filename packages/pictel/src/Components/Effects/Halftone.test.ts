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

/**
 * Build a source image whose left half is pure black and right half is pure white.
 */
function leftBlackRightWhiteImage(width: number, height: number): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	const half = width / 2
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4
			const v = x < half ? 0 : 255
			data[i] = v
			data[i + 1] = v
			data[i + 2] = v
			data[i + 3] = 255
		}
	}
	return new ImageData(data, width, height)
}

/**
 * For each `arc()` mock call, the first arg is the dot's screen-space x
 * (post-fix the dot is drawn at the screen-space cell center). Count how many
 * fall in the left half vs the right half of the screen.
 */
function countDotSidesByScreenX(arcCalls: readonly unknown[][], halfWidth: number) {
	let left = 0
	let right = 0
	for (const call of arcCalls) {
		const dotCx = call[0] as number
		if (dotCx < halfWidth) left++
		else right++
	}
	return { left, right }
}

describe("applyHalftone with non-zero angle", () => {
	it("at angle=0, left-black/right-white source produces left-heavy dot coverage", () => {
		const width = 100
		const height = 100
		const dotSize = 8
		const outputData = new Uint8ClampedArray(width * height * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, width, height))
		mockCtx.arc.mockClear()
		mockCtx.rotate.mockClear()
		mockCtx.translate.mockClear()

		const input = leftBlackRightWhiteImage(width, height)
		applyHalftone(input, dotSize, 0)

		const { left, right } = countDotSidesByScreenX(mockCtx.arc.mock.calls, width / 2)

		// Baseline: source-left is black so dots appear on the screen-left.
		expect(left).toBeGreaterThan(0)
		expect(left).toBeGreaterThan(right * 5)
	})

	it("at angle=45, image content stays aligned (dots remain on the side that was black in source)", () => {
		const width = 100
		const height = 100
		const dotSize = 8
		const outputData = new Uint8ClampedArray(width * height * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, width, height))
		mockCtx.arc.mockClear()
		mockCtx.rotate.mockClear()
		mockCtx.translate.mockClear()

		const input = leftBlackRightWhiteImage(width, height)
		applyHalftone(input, dotSize, 45)

		// The dot grid rotates, but the image content (which side is dark) does
		// not. With the fix, the screen-space dot positions still skew toward
		// the screen-left because that's where the back-rotated source is in
		// the source-left (black) half-plane. Pre-fix, the canvas rotation
		// would have spread the black band diagonally across the output and
		// the screen-x distribution would be roughly 1:1.
		const { left, right } = countDotSidesByScreenX(mockCtx.arc.mock.calls, width / 2)
		expect(left).toBeGreaterThan(0)
		// At 45° the rotated half-plane geometrically yields ~3:1 left:right
		// dots; assert a loose threshold above 1:1 (which is what the bug
		// produced) without overspecifying the exact ratio.
		expect(left).toBeGreaterThan(right * 2)
	})

	it("at angle=45, no canvas rotation transform is applied (content stays put)", () => {
		const width = 80
		const height = 80
		const outputData = new Uint8ClampedArray(width * height * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, width, height))
		mockCtx.rotate.mockClear()
		mockCtx.translate.mockClear()

		const input = solidImage(width, height, 128, 128, 128)
		applyHalftone(input, 8, 45)

		// The fix moves rotation out of the canvas transform and into per-cell
		// coordinate math. If a regression reintroduces context.rotate/translate
		// the photo will rotate again.
		expect(mockCtx.rotate).not.toHaveBeenCalled()
		expect(mockCtx.translate).not.toHaveBeenCalled()
	})
})
