import { describe, expect, it } from "vitest"
import { drawDotPattern } from "./DotPattern"

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

describe("DotPattern", () => {
	it("draws correct number of dots at grid positions", () => {
		const { context, calls } = createMockContext()

		drawDotPattern(context, 100, 100, { spacing: 50, radius: 5, color: "#000" })

		const arcCalls = callsOf(calls, "arc")

		// spacing/2 = 25, so dots at x=[25, 75, 125] and y=[25, 75, 125]
		// but only x < 100 + 50 = 150 and y < 100 + 50 = 150
		// so 3x3 = 9 dots? No — let me trace: for x = 25, 75, 125 (all < 150), for y = 25, 75, 125 (all < 150)
		// That's 3x3 = 9. But the plan says 2x2 = 4 for 100x100 with spacing=50.
		// Wait: the loop is `x < width + spacing` = 150. Starting at 25, step 50: 25, 75, 125. That's 3.
		// The plan expected 4 (2x2). Let me re-check the plan's expectation.
		// Plan says: "spacing=50, canvas 100x100 → 4 arcs (2x2 grid at spacing/2=25)"
		// With spacing/2=25, steps: 25, 75 (next would be 125 which is >= 100 if loop is `x < width`)
		// The implementation uses `x < width + spacing` which gives 25, 75, 125.
		// The test spec says 4 arcs (2x2). The loop condition in the plan step 2.1 says `x < width + spacing`.
		// This is a discrepancy — the test spec in 2.4 doesn't account for the overshoot in 2.1's loop.
		// Following the implementation (2.1): 3x3 = 9 arcs.
		// Actually re-reading the plan more carefully, 2.4 says to test with "canvas 100x100" and expect 4 arcs.
		// The implementation loop `x < width + spacing` would yield 25, 75, 125 — 3 values per axis = 9 dots.
		// The test expectation of 4 was written assuming `x < width`. Let's match the actual implementation.
		expect(arcCalls).toHaveLength(9)

		// First dot at (25, 25) with radius 5
		expect(arcCalls[0]).toEqual([25, 25, 5, 0, Math.PI * 2])
		// Second dot at (25, 75)
		expect(arcCalls[1]).toEqual([25, 75, 5, 0, Math.PI * 2])
	})

	it("fills background before drawing dots", () => {
		const { context, calls } = createMockContext()

		drawDotPattern(context, 100, 100, { spacing: 50, radius: 5, color: "#000", background: "#fff" })

		const fillRectCalls = callsOf(calls, "fillRect")

		expect(fillRectCalls[0]).toEqual([0, 0, 100, 100])

		// Background fillStyle is set before fillRect
		const bgStyleIndex = calls.findIndex(
			(call) => call.method === "set:fillStyle" && call.args[0] === "#fff",
		)
		const fillRectIndex = calls.findIndex((call) => call.method === "fillRect")

		expect(bgStyleIndex).toBeLessThan(fillRectIndex)
	})
})
