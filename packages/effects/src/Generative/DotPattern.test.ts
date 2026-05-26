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

		expect(arcCalls).toHaveLength(9)

		expect(arcCalls[0]).toEqual([25, 25, 5, 0, Math.PI * 2])
		expect(arcCalls[1]).toEqual([25, 75, 5, 0, Math.PI * 2])
	})

	it("fills background before drawing dots", () => {
		const { context, calls } = createMockContext()

		drawDotPattern(context, 100, 100, { spacing: 50, radius: 5, color: "#000", background: "#fff" })

		const fillRectCalls = callsOf(calls, "fillRect")

		expect(fillRectCalls[0]).toEqual([0, 0, 100, 100])

		const bgStyleIndex = calls.findIndex(
			(call) => call.method === "set:fillStyle" && call.args[0] === "#fff",
		)
		const fillRectIndex = calls.findIndex((call) => call.method === "fillRect")

		expect(bgStyleIndex).toBeLessThan(fillRectIndex)
	})
})
