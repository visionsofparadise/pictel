export function padImageData(
	source: ImageData,
	top: number,
	right: number,
	bottom: number,
	left: number,
): ImageData {
	const newWidth = source.width + left + right
	const newHeight = source.height + top + bottom
	const output = new ImageData(newWidth, newHeight)

	for (let y = 0; y < source.height; y++) {
		const sourceRowStart = y * source.width * 4
		const destRowStart = ((y + top) * newWidth + left) * 4
		output.data.set(
			source.data.subarray(sourceRowStart, sourceRowStart + source.width * 4),
			destRowStart,
		)
	}

	return output
}
