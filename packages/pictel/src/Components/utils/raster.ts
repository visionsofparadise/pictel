export interface EffectResult {
	pixels: ImageData;
	overflow?: { top: number; right: number; bottom: number; left: number };
}

export function normalizeResult(result: ImageData | EffectResult): Required<EffectResult> {
	if ("pixels" in result) {
		return {
			pixels: result.pixels,
			overflow: result.overflow ?? { top: 0, right: 0, bottom: 0, left: 0 },
		};
	}

	return { pixels: result, overflow: { top: 0, right: 0, bottom: 0, left: 0 } };
}

export function drawToCanvas(canvas: HTMLCanvasElement, data: ImageData): void {
	canvas.width = data.width;
	canvas.height = data.height;
	canvas.getContext("2d", { willReadFrequently: true })?.putImageData(data, 0, 0);
}
