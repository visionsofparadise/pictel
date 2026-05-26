import { lerp } from "./lerp"
import { luminance } from "./luminance"

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
			luminance(mapData[px]!, mapData[px + 1]!, mapData[px + 2]!) / 255

		dest[px] = lerp(orig[px]!, resultData[px]!, factor)
		dest[px + 1] = lerp(orig[px + 1]!, resultData[px + 1]!, factor)
		dest[px + 2] = lerp(orig[px + 2]!, resultData[px + 2]!, factor)
		dest[px + 3] = lerp(orig[px + 3]!, resultData[px + 3]!, factor)
	}

	return output
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */
