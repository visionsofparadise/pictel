import { describe, expect, it } from "vitest"
import { drawLinePattern } from "./LinePattern"

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

describe("LinePattern", () => {
	it("applies rotation for angled lines", () => {
		const { context, calls } = createMockContext()

		drawLinePattern(context, 100, 100, { spacing: 20, thickness: 2, angle: 45, color: "#000" })

		const rotateCalls = callsOf(calls, "rotate")

		expect(rotateCalls).toHaveLength(1)
		expect(rotateCalls[0][0]).toBeCloseTo(Math.PI / 4)

		const moveToCalls = callsOf(calls, "moveTo")
		const lineToCalls = callsOf(calls, "lineTo")

		expect(moveToCalls.length).toBeGreaterThan(0)
		expect(lineToCalls.length).toEqual(moveToCalls.length)
	})

	it("draws horizontal lines at angle 0", () => {
		const { context, calls } = createMockContext()

		drawLinePattern(context, 100, 100, { spacing: 20, thickness: 2, color: "#000" })

		const rotateCalls = callsOf(calls, "rotate")

		expect(rotateCalls).toHaveLength(1)
		expect(rotateCalls[0][0]).toBeCloseTo(0)

		// Verify save/restore wrapping
		const saveCalls = callsOf(calls, "save")
		const restoreCalls = callsOf(calls, "restore")

		expect(saveCalls).toHaveLength(1)
		expect(restoreCalls).toHaveLength(1)
	})

	it("fills background before drawing lines", () => {
		const { context, calls } = createMockContext()

		drawLinePattern(context, 100, 100, {
			spacing: 20,
			thickness: 2,
			color: "#000",
			background: "red",
		})

		const fillRectIndex = calls.findIndex((call) => call.method === "fillRect")
		const moveToIndex = calls.findIndex((call) => call.method === "moveTo")

		expect(fillRectIndex).toBeLessThan(moveToIndex)
	})
})
