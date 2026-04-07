import type { EffectResult } from "../../../../pipeline/raster";
import { luminance } from "../../utils/luminance";

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Per-pixel variable-radius blur. Map luminance at each pixel scales the effective
 * radius from 0 to `radius`. Output is larger by `maxRadius` on each side, where
 * maxRadius = peakMapLuminance * radius.
 */
export function applyVariableBlur(pixels: ImageData, map: ImageData, radius: number): EffectResult {
	const blurRadius = Math.round(radius);

	if (blurRadius <= 0) {
		return { pixels, overflow: { top: 0, right: 0, bottom: 0, left: 0 } };
	}

	const srcW = pixels.width;
	const srcH = pixels.height;
	const src = pixels.data;
	const mapData = map.data;

	let peakLuminance = 0;

	for (let pixelOffset = 0; pixelOffset < mapData.length; pixelOffset += 4) {
		const lum = luminance(mapData[pixelOffset]!, mapData[pixelOffset + 1]!, mapData[pixelOffset + 2]!);

		if (lum > peakLuminance) peakLuminance = lum;
	}

	const peakFactor = peakLuminance / 255;
	const maxRadius = Math.ceil(peakFactor * blurRadius);

	if (maxRadius <= 0) {
		return { pixels, overflow: { top: 0, right: 0, bottom: 0, left: 0 } };
	}

	const outW = srcW + 2 * maxRadius;
	const outH = srcH + 2 * maxRadius;
	const outData = new Uint8ClampedArray(outW * outH * 4);

	for (let oy = 0; oy < outH; oy++) {
		for (let ox = 0; ox < outW; ox++) {
			const sx = ox - maxRadius;
			const sy = oy - maxRadius;

			let effectiveR = 0;

			if (sx >= 0 && sx < srcW && sy >= 0 && sy < srcH) {
				const mapOffset = (sy * srcW + sx) * 4;
				const lum = luminance(mapData[mapOffset]!, mapData[mapOffset + 1]!, mapData[mapOffset + 2]!);
				effectiveR = Math.round((lum / 255) * blurRadius);
			}

			if (effectiveR <= 0) {
				if (sx >= 0 && sx < srcW && sy >= 0 && sy < srcH) {
					const srcOffset = (sy * srcW + sx) * 4;
					const outOffset = (oy * outW + ox) * 4;
					outData[outOffset] = src[srcOffset]!;
					outData[outOffset + 1] = src[srcOffset + 1]!;
					outData[outOffset + 2] = src[srcOffset + 2]!;
					outData[outOffset + 3] = src[srcOffset + 3]!;
				}

				continue;
			}

			const acc = [0, 0, 0, 0];
			let count = 0;

			for (let ky = -effectiveR; ky <= effectiveR; ky++) {
				for (let kx = -effectiveR; kx <= effectiveR; kx++) {
					const rx = sx + kx;
					const ry = sy + ky;

					if (rx >= 0 && rx < srcW && ry >= 0 && ry < srcH) {
						const srcOffset = (ry * srcW + rx) * 4;
						acc[0]! += src[srcOffset]!;
						acc[1]! += src[srcOffset + 1]!;
						acc[2]! += src[srcOffset + 2]!;
						acc[3]! += src[srcOffset + 3]!;
					}

					count++;
				}
			}

			const outOffset = (oy * outW + ox) * 4;
			outData[outOffset] = Math.round(acc[0]! / count);
			outData[outOffset + 1] = Math.round(acc[1]! / count);
			outData[outOffset + 2] = Math.round(acc[2]! / count);
			outData[outOffset + 3] = Math.round(acc[3]! / count);
		}
	}

	return {
		pixels: new ImageData(outData, outW, outH),
		overflow: {
			top: maxRadius,
			right: maxRadius,
			bottom: maxRadius,
			left: maxRadius,
		},
	};
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */
