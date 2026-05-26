/**
 * Reads the output ImageData from a RasterEffect's resolved canvas.
 *
 * Accepts either a `<canvas data-pictel-raster>` element directly, or any
 * ancestor element containing one (in which case the first matching
 * descendant canvas is used). The canvas is a sibling of the RasterEffect's
 * children wrapper in the DOM; callers usually pass the canvas directly
 * via `container.querySelector("canvas[data-pictel-raster]")`.
 */
export function readRasterEffectOutput(root: HTMLElement): ImageData {
	const canvas =
		root instanceof HTMLCanvasElement && root.hasAttribute("data-pictel-raster")
			? root
			: root.querySelector<HTMLCanvasElement>("canvas[data-pictel-raster]");

	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new Error("readRasterEffectOutput: could not find a [data-pictel-raster] canvas");
	}

	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (!context) throw new Error("readRasterEffectOutput: canvas 2d context unavailable");

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
