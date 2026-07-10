import { describe, it, expect, beforeAll } from "vitest"
import { applyChannelMix } from "./ChannelMixer"

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

function pixel(r: number, g: number, b: number, a: number): ImageData {
	return new ImageData(new Uint8ClampedArray([r, g, b, a]), 1, 1)
}

describe("applyChannelMix", () => {
	const identity = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1],
	]

	it("identity matrix returns identical pixels", () => {
		const result = applyChannelMix(pixel(100, 150, 200, 255), identity)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("swapping R and B channels turns red pixel blue", () => {
		const swapRB = [
			[0, 0, 1],
			[0, 1, 0],
			[1, 0, 0],
		]
		const result = applyChannelMix(pixel(255, 0, 0, 255), swapRB)
		expect(result.data[0]).toBe(0)
		expect(result.data[1]).toBe(0)
		expect(result.data[2]).toBe(255)
	})

	it("weighted mix produces expected output", () => {
		const mix = [
			[0.5, 0.5, 0],
			[0, 0.5, 0.5],
			[0.5, 0, 0.5],
		]
		const result = applyChannelMix(pixel(200, 100, 50, 255), mix)
		expect(result.data[0]).toBe(150)
		expect(result.data[1]).toBe(75)
		expect(result.data[2]).toBe(125)
	})

	it("preserves alpha unchanged", () => {
		const result = applyChannelMix(pixel(100, 150, 200, 42), identity)
		expect(result.data[3]).toBe(42)
	})
})
