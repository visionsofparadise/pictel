export interface SampleWindow {
	startX: number
	startY: number
	endX: number
	endY: number
}

export function sampleWindow(width: number, height: number, sourceCx: number, sourceCy: number, half: number): SampleWindow {
	const anchorX = Math.round(sourceCx - half)
	const anchorY = Math.round(sourceCy - half)
	const span = Math.round(half * 2)

	return {
		startX: Math.max(0, anchorX),
		startY: Math.max(0, anchorY),
		endX: Math.min(width, anchorX + span),
		endY: Math.min(height, anchorY + span),
	}
}
