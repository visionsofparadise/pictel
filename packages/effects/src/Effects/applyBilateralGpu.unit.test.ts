import { describe, it, expect, beforeAll } from "vitest"
import { applyBilateralGpu } from "./applyBilateralGpu"

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

function uniformImage(
	width: number,
	height: number,
	r: number,
	g: number,
	b: number,
	a: number,
): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	for (let i = 0; i < data.length; i += 4) {
		data[i] = r
		data[i + 1] = g
		data[i + 2] = b
		data[i + 3] = a
	}
	return new ImageData(data, width, height)
}

// The Vitest unit environment is jsdom without WebGPU. The headless CI
// Chromium for integration also runs without --enable-unsafe-webgpu (per
// `apps/demo/vitest.integration.config.ts`), so the only environment where
// `applyBilateralGpu` will actually execute end-to-end is the dev-server
// benchmark page. The unit test therefore asserts the contract:
// the function MUST throw when WebGPU isn't reachable. Cross-validation
// against the CPU peer's pixel output happens manually via the benchmark
// page (per the plan's Phase 20.5 ship/skip decision).
describe("applyBilateralGpu", () => {
	it("throws when WebGPU is unavailable", async () => {
		const input = uniformImage(4, 4, 100, 100, 100, 255)

		await expect(applyBilateralGpu(input, 1, 25)).rejects.toThrow(/WebGPU/)
	})
})
