import type { ComponentProps } from "react";
import { useCallback } from "react";
import type { EffectResult } from "../../pipeline/raster";
import { RasterEffect } from "../RasterEffect";
import { luminance } from "./utils/luminance";

/* eslint-disable @typescript-eslint/no-non-null-assertion */

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

interface BlurProps extends ComponentProps<"div"> {
	/** Blur radius in pixels. With a map, radius scales per-pixel by map luminance. */
	radius: number;
	/** `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance. */
	mode?: "parameter" | "mix";
	backdrop?: boolean;
	flatten?: boolean;
}

/**
 * Applies a uniform box blur or a map-driven variable-radius blur.
 *
 * - `radius` — Blur radius in pixels. With a map, radius scales per-pixel by map luminance.
 * - `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.
 *
 * @param props
 * @category Effects
 */
export function Blur({ radius, mode = "parameter", backdrop, flatten, ...rest }: BlurProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyUniformBlur(pixels, radius),
		[radius],
	);

	const mappedEffect = useCallback(
		(pixels: ImageData, map: ImageData) => applyVariableBlur(pixels, map, radius),
		[radius],
	);

	return (
		<RasterEffect
			effect={effect}
			mappedEffect={mappedEffect}
			mode={mode}
			backdrop={backdrop}
			flatten={flatten}
			{...rest}
		/>
	);
}
