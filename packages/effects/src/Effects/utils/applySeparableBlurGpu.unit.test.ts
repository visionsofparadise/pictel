import { describe, it, expect, beforeAll } from "vitest"
import { applySeparableBlurGpu } from "./applySeparableBlurGpu"

// Vitest unit env is jsdom without WebGPU. Like applyBilateralGpu /
// applyLicGpu, this helper can only be exercised end-to-end via the dev
// benchmark page. The unit test asserts the input-validation contract:
// radius and size guards throw deterministically without a device.

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
})

// A no-op stub device that lets validation errors surface before any real
// GPU work is attempted. The helper validates radius and dimension agreement
// before touching the device, so a totally inert stub is fine.
function stubDevice(): GPUDevice {
	return {} as unknown as GPUDevice
}

function stubInput(width: number, height: number): { texture: GPUTexture; view: GPUTextureView } {
	const texture = { width, height } as unknown as GPUTexture
	const view = {} as unknown as GPUTextureView
	return { texture, view }
}

describe("applySeparableBlurGpu", () => {
	it("returns an empty array for empty input", async () => {
		const result = await applySeparableBlurGpu([], 5, stubDevice())
		expect(result).toEqual([])
	})

	it("rejects radius <= 0", async () => {
		await expect(
			applySeparableBlurGpu([stubInput(16, 16)], 0, stubDevice()),
		).rejects.toThrow(/radius/)
	})

	it("rejects radius that rounds to 0", async () => {
		await expect(
			applySeparableBlurGpu([stubInput(16, 16)], 0.4, stubDevice()),
		).rejects.toThrow(/radius/)
	})

	it("rejects inputs with mismatched dimensions", async () => {
		await expect(
			applySeparableBlurGpu(
				[stubInput(16, 16), stubInput(32, 16)],
				5,
				stubDevice(),
			),
		).rejects.toThrow(/dimensions/)
	})
})
