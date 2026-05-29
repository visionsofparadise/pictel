import { describe, it, expect, beforeAll } from "vitest"
import { buildVectorField } from "./VectorField"

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

function at(field: ImageData, x: number, y: number) {
	const px = (y * field.width + x) * 4
	return {
		r: field.data[px],
		g: field.data[px + 1],
		b: field.data[px + 2],
		cos: field.data[px] / 127.5 - 1,
		sin: field.data[px + 1] / 127.5 - 1,
	}
}

describe("buildVectorField", () => {
	it("linear angle=0 → cos +1, sin 0 everywhere", () => {
		const field = buildVectorField(8, 8, "linear", { angle: 0 })
		const { r, g } = at(field, 3, 5)
		expect(r).toBeCloseTo(255, -1)
		expect(g).toBeCloseTo(128, -1)
	})

	it("linear angle=90 → cos 0, sin +1 everywhere", () => {
		const field = buildVectorField(8, 8, "linear", { angle: 90 })
		const { r, g } = at(field, 3, 5)
		expect(r).toBeCloseTo(128, -1)
		expect(g).toBeCloseTo(255, -1)
	})

	it("radial points outward — right of center has cos > 0", () => {
		const field = buildVectorField(8, 8, "radial")
		const { r } = at(field, 6, 4)
		expect(r).toBeGreaterThan(128)
	})

	it("tangential is perpendicular to radial at the same pixel", () => {
		const radial = buildVectorField(8, 8, "radial")
		const tangential = buildVectorField(8, 8, "tangential")
		const rad = at(radial, 6, 2)
		const tan = at(tangential, 6, 2)
		const dot = rad.cos * tan.cos + rad.sin * tan.sin
		expect(dot).toBeCloseTo(0, 1)
	})

	it("falloff → B high near center, low at corner", () => {
		const field = buildVectorField(9, 9, "radial", { magnitude: "falloff" })
		// Pixel adjacent to the exact center (which is the degenerate B=0 path).
		const nearCenter = at(field, 5, 4)
		const corner = at(field, 0, 0)
		expect(nearCenter.b).toBeGreaterThan(200)
		expect(corner.b).toBeLessThan(40)
	})

	it("radial/tangential center pixel is neutral 128,128,0", () => {
		// Sample center of pixel (3,3) on an 8px axis is 3.5; placing the field
		// center exactly there (3.5/8) makes distance 0 → the degenerate path.
		const onCenter = 3.5 / 8

		const radial = at(buildVectorField(8, 8, "radial", { centerX: onCenter, centerY: onCenter }), 3, 3)
		expect([radial.r, radial.g, radial.b]).toEqual([128, 128, 0])

		const tangential = at(buildVectorField(8, 8, "tangential", { centerX: onCenter, centerY: onCenter }), 3, 3)
		expect([tangential.r, tangential.g, tangential.b]).toEqual([128, 128, 0])
	})
})
