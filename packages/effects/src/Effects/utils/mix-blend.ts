/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function mixBlend(
	original: ImageData,
	result: ImageData,
	map: ImageData,
): ImageData {
	if (
		original.width !== result.width ||
		original.width !== map.width ||
		original.height !== result.height ||
		original.height !== map.height
	) {
		throw new Error(
			`mixBlend: dimension mismatch — original ${original.width}x${original.height}, result ${result.width}x${result.height}, map ${map.width}x${map.height}`,
		)
	}

	const orig = original.data
	const resultData = result.data
	const mapData = map.data
	const output = new ImageData(original.width, original.height)
	const dest = output.data

	for (let px = 0; px < orig.length; px += 4) {
		const factor =
			(0.299 * mapData[px]! + 0.587 * mapData[px + 1]! + 0.114 * mapData[px + 2]!) / 255

		const o0 = orig[px]!
		const o1 = orig[px + 1]!
		const o2 = orig[px + 2]!
		const o3 = orig[px + 3]!

		dest[px] = o0 + factor * (resultData[px]! - o0)
		dest[px + 1] = o1 + factor * (resultData[px + 1]! - o1)
		dest[px + 2] = o2 + factor * (resultData[px + 2]! - o2)
		dest[px + 3] = o3 + factor * (resultData[px + 3]! - o3)
	}

	return output
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */
