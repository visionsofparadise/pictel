/**
 * Allocate a 2D drawing surface, preferring `OffscreenCanvas` where available
 * and falling back to a DOM canvas. Throws if no 2D context can be obtained.
 */
export function createCanvas(width: number, height: number): {
	canvas: OffscreenCanvas | HTMLCanvasElement
	context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
} {
	if (typeof OffscreenCanvas !== "undefined") {
		const canvas = new OffscreenCanvas(width, height)
		const context = canvas.getContext("2d")

		if (!context) throw new Error("Failed to get 2d context from OffscreenCanvas")

		return { canvas, context }
	}

	const canvas = document.createElement("canvas")
	canvas.width = width
	canvas.height = height
	const context = canvas.getContext("2d")

	if (!context) throw new Error("Failed to get 2d context from canvas")

	return { canvas, context }
}
