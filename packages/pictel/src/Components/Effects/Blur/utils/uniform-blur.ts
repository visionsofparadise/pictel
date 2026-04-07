import type { EffectResult } from "../../../../pipeline/raster";

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Two-pass separable box blur. Output is larger than input by `radius` on each side.
 * Edge pixels beyond input bounds read as transparent black (0,0,0,0).
 */
export function applyUniformBlur(pixels: ImageData, radius: number): EffectResult {
	const blurRadius = Math.round(radius);

	if (blurRadius <= 0) {
		return { pixels, overflow: { top: 0, right: 0, bottom: 0, left: 0 } };
	}

	const srcW = pixels.width;
	const srcH = pixels.height;
	const outW = srcW + 2 * blurRadius;
	const outH = srcH + 2 * blurRadius;

	const src = pixels.data;

	function readSrc(ox: number, oy: number, channel: number): number {
		const sx = ox - blurRadius;
		const sy = oy - blurRadius;

		if (sx < 0 || sx >= srcW || sy < 0 || sy >= srcH) return 0;

		return src[(sy * srcW + sx) * 4 + channel]!;
	}

	// Horizontal pass: read from source, write to intermediate buffer (outW x outH).
	const hPass = new Float64Array(outW * outH * 4);
	const kernelSize = 2 * blurRadius + 1;

	for (let oy = 0; oy < outH; oy++) {
		const acc = [0, 0, 0, 0];

		for (let kx = -blurRadius; kx <= blurRadius; kx++) {
			for (let channel = 0; channel < 4; channel++) {
				acc[channel]! += readSrc(kx, oy, channel);
			}
		}

		for (let channel = 0; channel < 4; channel++) {
			hPass[(oy * outW + 0) * 4 + channel] = acc[channel]! / kernelSize;
		}

		for (let ox = 1; ox < outW; ox++) {
			for (let channel = 0; channel < 4; channel++) {
				acc[channel]! += readSrc(ox + blurRadius, oy, channel) - readSrc(ox - blurRadius - 1, oy, channel);
				hPass[(oy * outW + ox) * 4 + channel] = acc[channel]! / kernelSize;
			}
		}
	}

	// Vertical pass: read from horizontal pass buffer, write to output.
	const outData = new Uint8ClampedArray(outW * outH * 4);

	for (let ox = 0; ox < outW; ox++) {
		const acc = [0, 0, 0, 0];

		for (let ky = -blurRadius; ky <= blurRadius; ky++) {
			const ty = Math.max(0, Math.min(outH - 1, ky));

			for (let channel = 0; channel < 4; channel++) {
				acc[channel]! += hPass[(ty * outW + ox) * 4 + channel]!;
			}
		}

		for (let channel = 0; channel < 4; channel++) {
			outData[ox * 4 + channel] = Math.round(acc[channel]! / kernelSize);
		}

		for (let oy = 1; oy < outH; oy++) {
			const addY = Math.min(oy + blurRadius, outH - 1);
			const removeY = Math.max(oy - blurRadius - 1, 0);

			for (let channel = 0; channel < 4; channel++) {
				acc[channel]! += hPass[(addY * outW + ox) * 4 + channel]! - hPass[(removeY * outW + ox) * 4 + channel]!;
				outData[(oy * outW + ox) * 4 + channel] = Math.round(acc[channel]! / kernelSize);
			}
		}
	}

	return {
		pixels: new ImageData(outData, outW, outH),
		overflow: { top: blurRadius, right: blurRadius, bottom: blurRadius, left: blurRadius },
	};
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */
