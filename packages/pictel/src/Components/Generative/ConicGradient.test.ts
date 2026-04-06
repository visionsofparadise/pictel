import { describe, expect, it, vi } from "vitest"
import { drawConicGradient } from "./ConicGradient"

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
	const conicGradients: Array<{
		startAngle: number
		centerX: number
		centerY: number
		gradient: MockGradient
	}> = []

	const mock = {
		fillStyle: null as unknown,
		fillRect: vi.fn(),
		createConicGradient: vi.fn(
			(startAngle: number, centerX: number, centerY: number) => {
				const gradient = createMockGradient()
				conicGradients.push({ startAngle, centerX, centerY, gradient })

				return gradient
			},
		),
		conicGradients,
	}

	return mock as typeof mock & CanvasRenderingContext2D
}

describe("ConicGradient", () => {
	it("converts startAngle=90 to radians", () => {
		const context = createMockContext()

		drawConicGradient(
			context,
			100,
			100,
			[{ color: "red", position: 0 }],
			0.5,
			0.5,
			90,
		)

		expect(context.createConicGradient).toHaveBeenCalledOnce()

		const { startAngle, centerX, centerY } = context.conicGradients[0]
		expect(startAngle).toBeCloseTo(Math.PI / 2, 10)
		expect(centerX).toBeCloseTo(50, 5)
		expect(centerY).toBeCloseTo(50, 5)
	})
})
