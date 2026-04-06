import { describe, expect, it } from "vitest"
import { drawGridPattern } from "./GridPattern"

interface MockCall {
	method: string
	args: Array<unknown>
}

function createMockContext(): { context: CanvasRenderingContext2D; calls: Array<MockCall> } {
	const calls: Array<MockCall> = []

	const handler: ProxyHandler<Record<string, unknown>> = {
		get(_target, prop) {
			if (prop === "calls") return calls

			return (...args: Array<unknown>) => {
				calls.push({ method: prop as string, args })
			}
		},
		set(_target, prop, value: unknown) {
			calls.push({ method: `set:${prop as string}`, args: [value] })

			return true
		},
	}

	const context = new Proxy({}, handler) as unknown as CanvasRenderingContext2D

	return { context, calls }
}

function callsOf(calls: Array<MockCall>, method: string): Array<Array<unknown>> {
	return calls.filter((call) => call.method === method).map((call) => call.args)
}

describe("GridPattern", () => {
	it("draws correct number of vertical and horizontal lines", () => {
		const { context, calls } = createMockContext()

		drawGridPattern(context, 200, 200, { spacingX: 50, spacingY: 100, thickness: 1, color: "#000" })

		const moveToCalls = callsOf(calls, "moveTo")
		const lineToCalls = callsOf(calls, "lineTo")

		// Vertical lines: x = 0, 50, 100, 150, 200 → 5 lines
		// Horizontal lines: y = 0, 100, 200 → 3 lines
		// Total = 8 lines
		expect(moveToCalls).toHaveLength(8)
		expect(lineToCalls).toHaveLength(8)

		// Verify vertical line positions (first 5 moveTo calls)
		expect(moveToCalls[0]).toEqual([0, 0])
		expect(moveToCalls[1]).toEqual([50, 0])
		expect(moveToCalls[2]).toEqual([100, 0])
		expect(moveToCalls[3]).toEqual([150, 0])
		expect(moveToCalls[4]).toEqual([200, 0])

		// Verify horizontal line positions (next 3 moveTo calls)
		expect(moveToCalls[5]).toEqual([0, 0])
		expect(moveToCalls[6]).toEqual([0, 100])
		expect(moveToCalls[7]).toEqual([0, 200])
	})

	it("defaults spacingY to spacingX", () => {
		const { context, calls } = createMockContext()

		drawGridPattern(context, 100, 100, { spacingX: 50, thickness: 1, color: "#000" })

		const moveToCalls = callsOf(calls, "moveTo")

		// Vertical: x = 0, 50, 100 → 3. Horizontal: y = 0, 50, 100 → 3. Total = 6.
		expect(moveToCalls).toHaveLength(6)
	})

	it("fills background before drawing grid lines", () => {
		const { context, calls } = createMockContext()

		drawGridPattern(context, 100, 100, {
			spacingX: 50,
			thickness: 1,
			color: "#000",
			background: "#eee",
		})

		const fillRectIndex = calls.findIndex((call) => call.method === "fillRect")
		const firstMoveToIndex = calls.findIndex((call) => call.method === "moveTo")

		expect(fillRectIndex).toBeLessThan(firstMoveToIndex)
		expect(callsOf(calls, "fillRect")[0]).toEqual([0, 0, 100, 100])
	})
})
