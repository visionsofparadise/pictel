export function rasterCanvases(container: HTMLElement): Array<HTMLCanvasElement> {
	const all = Array.from(container.querySelectorAll<HTMLCanvasElement>("canvas[data-pictel-raster]"));

	if (all.length === 0) throw new Error("no canvas[data-pictel-raster] found under container");

	return all;
}

export function readCanvas(canvas: HTMLCanvasElement): ImageData {
	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (!context) throw new Error("readCanvas: canvas 2d context unavailable");

	return context.getImageData(0, 0, canvas.width, canvas.height);
}

export function pixelAt(pixels: ImageData, x: number, y: number): [number, number, number, number] {
	const index = (y * pixels.width + x) * 4;

	return [
		pixels.data[index] ?? 0,
		pixels.data[index + 1] ?? 0,
		pixels.data[index + 2] ?? 0,
		pixels.data[index + 3] ?? 0,
	];
}

function draw(size: number, paint: (context: CanvasRenderingContext2D) => void): string {
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext("2d");

	if (!context) throw new Error("synthetic content: canvas 2d context unavailable");

	paint(context);

	return canvas.toDataURL();
}

export function gradientUrl(size: number): string {
	return draw(size, (context) => {
		const gradient = context.createLinearGradient(0, 0, size, size);
		gradient.addColorStop(0, "#101820");
		gradient.addColorStop(1, "#f0e0c0");
		context.fillStyle = gradient;
		context.fillRect(0, 0, size, size);
	});
}

export function checkerUrl(size: number): string {
	return draw(size, (context) => {
		const cell = Math.max(4, Math.floor(size / 8));

		for (let y = 0; y < size; y += cell) {
			for (let x = 0; x < size; x += cell) {
				context.fillStyle = (x / cell + y / cell) % 2 === 0 ? "#e8e0d0" : "#203040";
				context.fillRect(x, y, cell, cell);
			}
		}
	});
}

export function subjectDiscUrl(size: number): string {
	return draw(size, (context) => {
		context.fillStyle = "#181818";
		context.fillRect(0, 0, size, size);
		context.fillStyle = "#e0b040";
		context.beginPath();
		context.arc(size / 2, size / 2, size * 0.3, 0, Math.PI * 2);
		context.fill();
	});
}
