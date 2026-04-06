import { describe, expect, it, vi } from "vitest"
import { drawRadialGradient } from "./RadialGradient"

interface MockGradient {
	colorStops: Array<{ offset: number; color: string }>
	addColorStop: ReturnType<typeof vi.fn>
}

function createMockGradient(): MockGradient {
	const gradient: MockGradient = {
		colorStops: [],
		addColorStop: vi.fn((offset: number, color: string) => {
			gradient.colorStops.push({ offset, color })
		}),
	}

	return gradient
}

function createMockContext() {
	const radialGradients: Array<{
		innerX: number
		innerY: number
		innerRadius: number
		outerX: number
		outerY: number
		outerRadius: number
		gradient: MockGradient
	}> = []

	const mock = {
		fillStyle: null as unknown,
		fillRect: vi.fn(),
		createRadialGradient: vi.fn(
			(
				innerX: number,
				innerY: number,
				innerRadius: number,
				outerX: number,
				outerY: number,
				outerRadius: number,
			) => {
				const gradient = createMockGradient()
				radialGradients.push({
					innerX,
					innerY,
					innerRadius,
					outerX,
					outerY,
					outerRadius,
					gradient,
				})

				return gradient
			},
		),
		radialGradients,
	}

	return mock as typeof mock & CanvasRenderingContext2D
}

describe("RadialGradient", () => {
	it("resolves center and radius from normalized values", () => {
		const context = createMockContext()

		drawRadialGradient(
			context,
			200,
			100,
			[{ color: "red", position: 0 }],
			0.25,
			0.75,
			0.5,
		)

		expect(context.createRadialGradient).toHaveBeenCalledOnce()

		const { innerX, innerY, innerRadius, outerX, outerY, outerRadius } =
			context.radialGradients[0]
		expect(innerX).toBeCloseTo(50, 5)
		expect(innerY).toBeCloseTo(75, 5)
		expect(innerRadius).toBeCloseTo(0, 5)
		expect(outerX).toBeCloseTo(50, 5)
		expect(outerY).toBeCloseTo(75, 5)
		expect(outerRadius).toBeCloseTo(50, 5)
	})
})
