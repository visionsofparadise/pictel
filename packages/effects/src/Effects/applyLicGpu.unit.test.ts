import { describe, it, expect, beforeAll } from "vitest"
import { applyLicGpu } from "./applyLicGpu"

// Vitest runs in a node environment without WebGPU. The function must throw
// in that case (no CPU fallback). Output-parity with CPU `applyLIC` cannot be
// asserted here; the demo benchmark page (apps/demo/src/benchmark/entry.tsx
// LICGpu entry) is the manual integration check.

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

function makeSeed(width: number, height: number): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	for (let i = 0; i < data.length; i += 4) {
		data[i] = 200
		data[i + 1] = 100
		data[i + 2] = 50
		data[i + 3] = 255
	}
	return new ImageData(data, width, height)
}

describe("applyLicGpu", () => {
	it("throws when WebGPU is unavailable (no CPU fallback)", async () => {
		const seed = makeSeed(8, 8)
		const field = makeSeed(8, 8)
		await expect(applyLicGpu(seed, field, 10, 1.0)).rejects.toThrow(/WebGPU/i)
	})

	it("rejects when seed and field dimensions disagree", async () => {
		const seed = makeSeed(8, 8)
		const field = makeSeed(16, 16)
		await expect(applyLicGpu(seed, field, 10, 1.0)).rejects.toThrow(/dimensions/i)
	})

	it("rejects when length is non-positive", async () => {
		const seed = makeSeed(8, 8)
		const field = makeSeed(8, 8)
		await expect(applyLicGpu(seed, field, 0, 1.0)).rejects.toThrow(/length/i)
	})
})
