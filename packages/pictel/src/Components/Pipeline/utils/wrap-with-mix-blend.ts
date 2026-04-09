import type { EffectResult } from "../../utils/raster";
import { normalizeResult } from "../../utils/raster";
import { mixBlend } from "../../Effects/utils/mix-blend";
import { padImageData } from "../../Effects/utils/pad-image-data";
import type { RasterEffectCallback } from "../RasterEffect";

function applyMixBlend(
	rawResult: ImageData | EffectResult,
	original: ImageData,
	map: ImageData,
): EffectResult {
	const { pixels: resultPixels, overflow } = normalizeResult(rawResult);

	if (overflow.top === 0 && overflow.right === 0 && overflow.bottom === 0 && overflow.left === 0) {
		return { pixels: mixBlend(original, resultPixels, map), overflow };
	}

	const paddedOriginal = padImageData(original, overflow.top, overflow.right, overflow.bottom, overflow.left);
	const paddedMap = padImageData(map, overflow.top, overflow.right, overflow.bottom, overflow.left);

	return { pixels: mixBlend(paddedOriginal, resultPixels, paddedMap), overflow };
}

export function wrapWithMixBlend(
	effect: RasterEffectCallback,
	pixels: ImageData,
	map: ImageData,
): ImageData | EffectResult | Promise<ImageData | EffectResult> {
	const rawResult = effect(pixels);

	if (rawResult instanceof Promise) {
		return rawResult.then((resolved) => applyMixBlend(resolved, pixels, map));
	}

	return applyMixBlend(rawResult, pixels, map);
}
