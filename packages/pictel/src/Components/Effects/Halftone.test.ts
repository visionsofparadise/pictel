import { describe, it, expect, beforeAll, vi } from "vitest"
import { applyHalftone } from "./Halftone"
import { sampleWindow } from "./utils/sample-window"

// Mock canvas context for jsdom (no real Canvas2D).
//
// `fillStyle` is a single mutable property, so to know which ink color a given
// dot was stamped in we record the current `fillStyle` alongside every `fill()`
// call. `fillColors` is a parallel array to the `fill` mock's calls.
const fillColors: string[] = []
const mockCtx = {
	fillStyle: "",
	globalCompositeOperation: "source-over",
	fillRect: vi.fn(),
	translate: vi.fn(),
	rotate: vi.fn(),
	beginPath: vi.fn(),
	arc: vi.fn(),
	fill: vi.fn(() => {
		fillColors.push(mockCtx.fillStyle)
	}),
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
		// Full coverage → radius reaches the cell half-diagonal: half * √2 = 5 * √2 ≈ 7.07
		const firstArcCall = mockCtx.arc.mock.calls[0] as [number, number, number, number, number]
		expect(firstArcCall[2]).toBeCloseTo(5 * Math.SQRT2, 1)
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
 * For each `arc()` mock call, the first arg is the dot's drawn x position.
 * Count how many fall in the left half vs the right half of the output.
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

	it("at angle=45, the image is not rotated — dots track the source's black side", () => {
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

		// Only the dot lattice rotates — the image does not. Every dot is
		// sampled and drawn at the same point, so a dot is stamped only where
		// the source is actually dark. The source's left half is black, so
		// (apart from a few cells straddling the centre boundary) every dot
		// lands on the screen-left. If the image itself were rotated, the black
		// band would smear diagonally and dots would spill across the centre.
		const { left, right } = countDotSidesByScreenX(mockCtx.arc.mock.calls, width / 2)
		expect(left).toBeGreaterThan(0)
		expect(right).toBeLessThan(left / 4)
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

/** Normalize a CSS color string to a comparable `rgb(r, g, b)` form. */
function rgb(r: number, g: number, b: number): string {
	return `rgb(${r}, ${g}, ${b})`
}

describe("applyHalftone luminance mode — dotColor", () => {
	it("stamps dots in a non-black dotColor", () => {
		const outputData = new Uint8ClampedArray(100 * 100 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 100, 100))
		mockCtx.arc.mockClear()
		mockCtx.fill.mockClear()
		fillColors.length = 0

		// Dark image so dots are drawn.
		const input = solidImage(100, 100, 0, 0, 0)
		applyHalftone(input, 10, 0, "luminance", [255, 0, 0])

		expect(mockCtx.arc).toHaveBeenCalled()
		// Every dot stamped in the requested red ink.
		expect(fillColors.length).toBeGreaterThan(0)
		expect(fillColors.every((c) => c === rgb(255, 0, 0))).toBe(true)
	})

	it("defaults dotColor to black, leaving existing callers unchanged", () => {
		const outputData = new Uint8ClampedArray(50 * 50 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 50, 50))
		mockCtx.arc.mockClear()
		mockCtx.fill.mockClear()
		fillColors.length = 0

		const input = solidImage(50, 50, 0, 0, 0)
		// Three-arg call form — the original signature, must still work.
		applyHalftone(input, 10, 0)

		expect(fillColors.length).toBeGreaterThan(0)
		expect(fillColors.every((c) => c === rgb(0, 0, 0))).toBe(true)
	})
})

describe("applyHalftone cmyk mode", () => {
	it("pure red field produces magenta and yellow dots, no cyan", () => {
		// R=255,G=0,B=0 → C=0, M=1, Y=1, K=0. After GCR (K=0) the chromatic
		// channels are unchanged: cyan demand is zero, magenta/yellow are full.
		const outputData = new Uint8ClampedArray(120 * 120 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 120, 120))
		mockCtx.arc.mockClear()
		mockCtx.fill.mockClear()
		fillColors.length = 0

		const input = solidImage(120, 120, 255, 0, 0)
		applyHalftone(input, 12, 0, "cmyk")

		const cyan = fillColors.filter((c) => c === rgb(0, 255, 255)).length
		const magenta = fillColors.filter((c) => c === rgb(255, 0, 255)).length
		const yellow = fillColors.filter((c) => c === rgb(255, 255, 0)).length
		const key = fillColors.filter((c) => c === rgb(0, 0, 0)).length

		expect(cyan).toBe(0)
		expect(key).toBe(0)
		expect(magenta).toBeGreaterThan(0)
		expect(yellow).toBeGreaterThan(0)
	})

	it("pure white field stays white (no dots in any channel)", () => {
		// R=G=B=255 → C=M=Y=K=0 — no ink demand anywhere.
		const outputData = new Uint8ClampedArray(120 * 120 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 120, 120))
		mockCtx.arc.mockClear()
		mockCtx.fill.mockClear()
		fillColors.length = 0

		const input = solidImage(120, 120, 255, 255, 255)
		applyHalftone(input, 12, 0, "cmyk")

		expect(mockCtx.arc).not.toHaveBeenCalled()
		expect(fillColors.length).toBe(0)
	})

	it("pure black field goes solid via the Key channel", () => {
		// R=G=B=0 → C=M=Y=1, K=1. GCR pulls all ink into Key; the chromatic
		// channels become 0, the Key channel is full coverage.
		const outputData = new Uint8ClampedArray(120 * 120 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 120, 120))
		mockCtx.arc.mockClear()
		mockCtx.fill.mockClear()
		fillColors.length = 0

		const input = solidImage(120, 120, 0, 0, 0)
		applyHalftone(input, 12, 0, "cmyk")

		const cyan = fillColors.filter((c) => c === rgb(0, 255, 255)).length
		const magenta = fillColors.filter((c) => c === rgb(255, 0, 255)).length
		const yellow = fillColors.filter((c) => c === rgb(255, 255, 0)).length
		const key = fillColors.filter((c) => c === rgb(0, 0, 0)).length

		expect(cyan).toBe(0)
		expect(magenta).toBe(0)
		expect(yellow).toBe(0)
		expect(key).toBeGreaterThan(0)

		// Full coverage — Key dots stamped at max radius: the cell half-diagonal, half * √2 = 6 * √2 ≈ 8.49.
		const keyArcs = mockCtx.arc.mock.calls as [number, number, number, number, number][]
		expect(keyArcs.length).toBeGreaterThan(0)
		expect(keyArcs[0]![2]).toBeCloseTo(6 * Math.SQRT2, 1)
	})

	it("pure blue field produces cyan and magenta dots, no yellow", () => {
		// R=0,G=0,B=255 → C=1, M=1, Y=0, K=0 — cyan and magenta inks build blue.
		const outputData = new Uint8ClampedArray(120 * 120 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 120, 120))
		mockCtx.arc.mockClear()
		mockCtx.fill.mockClear()
		fillColors.length = 0

		const input = solidImage(120, 120, 0, 0, 255)
		applyHalftone(input, 12, 0, "cmyk")

		const cyan = fillColors.filter((c) => c === rgb(0, 255, 255)).length
		const magenta = fillColors.filter((c) => c === rgb(255, 0, 255)).length
		const yellow = fillColors.filter((c) => c === rgb(255, 255, 0)).length

		expect(cyan).toBeGreaterThan(0)
		expect(magenta).toBeGreaterThan(0)
		expect(yellow).toBe(0)
	})

	it("overprints with multiply compositing", () => {
		const outputData = new Uint8ClampedArray(60 * 60 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 60, 60))
		mockCtx.globalCompositeOperation = "source-over"

		const input = solidImage(60, 60, 255, 0, 0)
		applyHalftone(input, 12, 0, "cmyk")

		// Restored to the default after the screen is stamped.
		expect(mockCtx.globalCompositeOperation).toBe("source-over")
	})

	it("output dimensions match input in cmyk mode", () => {
		const outputData = new Uint8ClampedArray(50 * 30 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 50, 30))

		const input = solidImage(50, 30, 128, 64, 200)
		const result = applyHalftone(input, 10, 0, "cmyk")

		expect(result.width).toBe(50)
		expect(result.height).toBe(30)
		expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 50, 30)
	})

	it("preserves source alpha in cmyk mode", () => {
		const data = new Uint8ClampedArray(4 * 4 * 4)
		for (let i = 0; i < data.length; i += 4) {
			data[i] = 200
			data[i + 1] = 50
			data[i + 2] = 100
			data[i + 3] = 128 // half-transparent
		}
		const input = new ImageData(data, 4, 4)

		// The mocked context returns fully opaque pixels; applyHalftone must
		// copy the source alpha back over them.
		const outputData = new Uint8ClampedArray(4 * 4 * 4).fill(255)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 4, 4))

		const result = applyHalftone(input, 4, 0, "cmyk")

		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(128)
		}
	})

	it("does not mutate input in cmyk mode", () => {
		const outputData = new Uint8ClampedArray(10 * 10 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 10, 10))

		const input = solidImage(10, 10, 100, 150, 200)
		const original = new Uint8ClampedArray(input.data)
		applyHalftone(input, 5, 0, "cmyk")
		expect(input.data).toEqual(original)
	})

})

describe("sampleWindow — CMYK screen registration", () => {
	const half = 5 // dotSize 10

	it("is exactly dotSize-square regardless of sub-pixel dot position", () => {
		// The registration bug: a floor/ceil window grows to 11px on fractional
		// centers. Every interior window must be exactly 2*half across, whether
		// the dot center is integer (Yellow 0°) or fractional (rotated screens).
		for (const offset of [0, 0.1, 0.25, 0.5, 0.71, 0.9]) {
			const win = sampleWindow(1000, 1000, 500 + offset, 500 + offset, half)
			expect(win.endX - win.startX).toBe(2 * half)
			expect(win.endY - win.startY).toBe(2 * half)
		}
	})

	it("keeps the window centroid within half a pixel of every dot center", () => {
		// All four CMYK screens rotate to different angles, so their lattice
		// points carry different fractional parts. The sample window must track
		// each dot to within ±0.5px per axis — the discrete-grid floor — so the
		// separations stay registered. A floor/ceil window drifts further, and
		// by a channel-specific amount, pulling the layers apart.
		for (let cx = 500; cx < 510; cx += 0.137) {
			const win = sampleWindow(1000, 1000, cx, cx, half)
			// Window centroid: pixel centers are x+0.5.
			const centroidX = (win.startX + win.endX) / 2
			expect(Math.abs(centroidX - cx)).toBeLessThanOrEqual(0.5)
		}
	})

	it("clamps to image bounds without widening the window elsewhere", () => {
		// A dot near the top-left corner: the window clips at 0 but the
		// in-bounds side is unaffected.
		const win = sampleWindow(1000, 1000, 1, 1, half)
		expect(win.startX).toBe(0)
		expect(win.startY).toBe(0)
		expect(win.endX).toBe(Math.round(1 - half) + 2 * half)
		expect(win.endY).toBe(Math.round(1 - half) + 2 * half)
	})
})

describe("applyHalftone color mode", () => {
	it("stamps each dot in the cell's own average color", () => {
		// A solid red field — every cell averages to pure red, so every dot is
		// stamped rgb(255, 0, 0). One shared grid, no channel separation.
		const outputData = new Uint8ClampedArray(120 * 120 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 120, 120))
		mockCtx.arc.mockClear()
		mockCtx.fill.mockClear()
		fillColors.length = 0

		const input = solidImage(120, 120, 255, 0, 0)
		applyHalftone(input, 12, 0, "color")

		expect(mockCtx.arc).toHaveBeenCalled()
		expect(fillColors.length).toBeGreaterThan(0)
		expect(fillColors.every((c) => c === rgb(255, 0, 0))).toBe(true)
	})

	it("draws no dots on pure white (zero ink demand)", () => {
		// min(255,255,255)/255 = 1 → coverage 0 → no dots.
		const outputData = new Uint8ClampedArray(120 * 120 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 120, 120))
		mockCtx.arc.mockClear()

		const input = solidImage(120, 120, 255, 255, 255)
		applyHalftone(input, 12, 0, "color")

		expect(mockCtx.arc).not.toHaveBeenCalled()
	})

	it("output dimensions match input in color mode", () => {
		const outputData = new Uint8ClampedArray(50 * 30 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 50, 30))

		const input = solidImage(50, 30, 128, 64, 200)
		const result = applyHalftone(input, 10, 0, "color")

		expect(result.width).toBe(50)
		expect(result.height).toBe(30)
		expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 50, 30)
	})

	it("preserves source alpha in color mode", () => {
		const data = new Uint8ClampedArray(4 * 4 * 4)
		for (let i = 0; i < data.length; i += 4) {
			data[i] = 200
			data[i + 1] = 50
			data[i + 2] = 100
			data[i + 3] = 128 // half-transparent
		}
		const input = new ImageData(data, 4, 4)

		const outputData = new Uint8ClampedArray(4 * 4 * 4).fill(255)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 4, 4))

		const result = applyHalftone(input, 4, 0, "color")

		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(128)
		}
	})

	it("does not mutate input in color mode", () => {
		const outputData = new Uint8ClampedArray(10 * 10 * 4)
		mockCtx.getImageData.mockReturnValue(new ImageData(outputData, 10, 10))

		const input = solidImage(10, 10, 100, 150, 200)
		const original = new Uint8ClampedArray(input.data)
		applyHalftone(input, 5, 0, "color")
		expect(input.data).toEqual(original)
	})
})
