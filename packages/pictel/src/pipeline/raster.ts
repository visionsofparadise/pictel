export function drawToCanvas(canvas: HTMLCanvasElement, data: ImageData): void {
	canvas.width = data.width;
	canvas.height = data.height;
	canvas.getContext("2d")?.putImageData(data, 0, 0);
}
