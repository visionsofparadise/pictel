/**
 * Navigate from a pipeline div to its output canvas. The canvas lives inside
 * the raster wrapper (the only canvas direct-descendant of the pipeline div
 * via the [data-pictel-raster] marker). Returns the ImageData read from it.
 */
export function readPipelineOutput(pipelineDiv: HTMLElement): ImageData {
	const canvas = pipelineDiv.querySelector<HTMLCanvasElement>(":scope > [data-pictel-raster] > canvas");

	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new Error("readPipelineOutput: could not find output canvas at expected DOM position");
	}

	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (!context) throw new Error("readPipelineOutput: canvas 2d context unavailable");

	return context.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Sample a single pixel from ImageData. Returns [r, g, b, a] in 0-255.
 */
export function readPixel(
	pixels: ImageData,
	x: number,
	y: number,
): [number, number, number, number] {
	const index = (y * pixels.width + x) * 4;
	const red = pixels.data[index] ?? 0;
	const green = pixels.data[index + 1] ?? 0;
	const blue = pixels.data[index + 2] ?? 0;
	const alpha = pixels.data[index + 3] ?? 0;

	return [red, green, blue, alpha];
}
