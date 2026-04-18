/**
 * Build a solid-color data URL using an offscreen canvas.
 */
export function solidImage(color: string, width: number, height: number): string {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d");

	if (!context) throw new Error("solidImage: canvas 2d context unavailable");

	context.fillStyle = color;
	context.fillRect(0, 0, width, height);

	return canvas.toDataURL();
}

/**
 * Build a horizontal or vertical gradient data URL.
 */
export function gradientImage(
	from: string,
	to: string,
	direction: "horizontal" | "vertical",
	width: number,
	height: number,
): string {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d");

	if (!context) throw new Error("gradientImage: canvas 2d context unavailable");

	const x2 = direction === "horizontal" ? width : 0;
	const y2 = direction === "vertical" ? height : 0;
	const gradient = context.createLinearGradient(0, 0, x2, y2);
	gradient.addColorStop(0, from);
	gradient.addColorStop(1, to);
	context.fillStyle = gradient;
	context.fillRect(0, 0, width, height);

	return canvas.toDataURL();
}

/**
 * Build a checkerboard pattern data URL. `size` is the square side in pixels.
 */
export function checkerboardImage(
	colorA: string,
	colorB: string,
	size: number,
	width: number,
	height: number,
): string {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d");

	if (!context) throw new Error("checkerboardImage: canvas 2d context unavailable");

	for (let y = 0; y < height; y += size) {
		for (let x = 0; x < width; x += size) {
			const isA = ((x / size) + (y / size)) % 2 === 0;
			context.fillStyle = isA ? colorA : colorB;
			context.fillRect(x, y, size, size);
		}
	}

	return canvas.toDataURL();
}
