import { describe, expect, it, vi } from "vitest"
import { drawLinearGradient } from "./LinearGradient"

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
	const linearGradients: Array<{
		startX: number
		startY: number
		endX: number
		endY: number
		gradient: MockGradient
	}> = []

	const mock = {
		fillStyle: null as unknown,
		fillRect: vi.fn(),
		createLinearGradient: vi.fn(
			(startX: number, startY: number, endX: number, endY: number) => {
				const gradient = createMockGradient()
				linearGradients.push({ startX, startY, endX, endY, gradient })

				return gradient
			},
		),
		linearGradients,
	}

	return mock as typeof mock & CanvasRenderingContext2D
}

describe("LinearGradient", () => {
	it("angle=0 on 100x100 produces left-to-right gradient line", () => {
		const context = createMockContext()

		drawLinearGradient(
			context,
			100,
			100,
			[{ color: "red", position: 0 }],
			0,
		)

		expect(context.createLinearGradient).toHaveBeenCalledOnce()

		const { startX, startY, endX, endY } = context.linearGradients[0]
		expect(startX).toBeCloseTo(0, 5)
		expect(startY).toBeCloseTo(50, 5)
		expect(endX).toBeCloseTo(100, 5)
		expect(endY).toBeCloseTo(50, 5)
	})

	it("angle=90 on 100x100 produces top-to-bottom gradient line", () => {
		const context = createMockContext()

		drawLinearGradient(
			context,
			100,
			100,
			[{ color: "red", position: 0 }],
			90,
		)

		const { startX, startY, endX, endY } = context.linearGradients[0]
		expect(startX).toBeCloseTo(50, 5)
		expect(startY).toBeCloseTo(0, 5)
		expect(endX).toBeCloseTo(50, 5)
		expect(endY).toBeCloseTo(100, 5)
	})

	it("adds color stops in order", () => {
		const context = createMockContext()

		drawLinearGradient(
			context,
			100,
			100,
			[
				{ color: "red", position: 0 },
				{ color: "blue", position: 1 },
			],
			0,
		)

		const { gradient } = context.linearGradients[0]
		expect(gradient.addColorStop).toHaveBeenCalledTimes(2)
		expect(gradient.colorStops[0]).toEqual({ offset: 0, color: "red" })
		expect(gradient.colorStops[1]).toEqual({ offset: 1, color: "blue" })
	})
})
