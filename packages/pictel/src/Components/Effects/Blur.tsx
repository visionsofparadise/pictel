import type { ReactNode } from "react";
import { useCallback } from "react";
import { normalizeResult, type EffectResult } from "../utils/raster";
import { Pipeline, type PipelineCallback } from "../Pipeline/Pipeline";
import { luminance } from "./utils/luminance";
import { mixBlend } from "./utils/mix-blend";
import { padImageData } from "./utils/pad-image-data";

/* eslint-disable @typescript-eslint/no-non-null-assertion */

function boxBlurPass(
	input: Float64Array,
	output: Float64Array,
	width: number,
	height: number,
	radius: number,
): void {
	if (radius <= 0) {
		output.set(input);

		return;
	}

	const kernelSize = 2 * radius + 1;

	for (let oy = 0; oy < height; oy++) {
		for (let channel = 0; channel < 4; channel++) {
			let acc = 0;

			for (let kx = -radius; kx <= radius; kx++) {
				const cx = Math.max(0, Math.min(width - 1, kx));
				acc += input[(oy * width + cx) * 4 + channel]!;
			}

			output[(oy * width + 0) * 4 + channel] = acc / kernelSize;

			for (let ox = 1; ox < width; ox++) {
				const addX = Math.min(ox + radius, width - 1);
				const removeX = Math.max(ox - radius - 1, 0);
				acc += input[(oy * width + addX) * 4 + channel]! - input[(oy * width + removeX) * 4 + channel]!;
				output[(oy * width + ox) * 4 + channel] = acc / kernelSize;
			}
		}
	}

	const vBuffer = new Float64Array(output.length);

	for (let ox = 0; ox < width; ox++) {
		for (let channel = 0; channel < 4; channel++) {
			let acc = 0;

			for (let ky = -radius; ky <= radius; ky++) {
				const cy = Math.max(0, Math.min(height - 1, ky));
				acc += output[(cy * width + ox) * 4 + channel]!;
			}

			vBuffer[(0 * width + ox) * 4 + channel] = acc / kernelSize;

			for (let oy = 1; oy < height; oy++) {
				const addY = Math.min(oy + radius, height - 1);
				const removeY = Math.max(oy - radius - 1, 0);
				acc += output[(addY * width + ox) * 4 + channel]! - output[(removeY * width + ox) * 4 + channel]!;
				vBuffer[(oy * width + ox) * 4 + channel] = acc / kernelSize;
			}
		}
	}

	output.set(vBuffer);
}

export function boxRadiiForGaussian(sigma: number): [number, number, number] {
	const ideal = Math.sqrt((12 * sigma * sigma) / 3 + 1);
	let lower = Math.floor(ideal);

	if (lower % 2 === 0) lower -= 1;

	const upper = lower + 2;
	const count = Math.round(
		(12 * sigma * sigma - 3 * lower * lower - 12 * lower - 9) / (-4 * lower - 4),
	);

	const r1 = Math.max(0, (count > 0 ? lower : upper) - 1) / 2;
	const r2 = Math.max(0, (count > 1 ? lower : upper) - 1) / 2;
	const r3 = Math.max(0, (count > 2 ? lower : upper) - 1) / 2;

	return [Math.round(r1), Math.round(r2), Math.round(r3)];
}

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

	const bufferA = new Float64Array(outW * outH * 4);

	for (let oy = 0; oy < outH; oy++) {
		const sy = Math.max(0, Math.min(srcH - 1, oy - blurRadius));

		for (let ox = 0; ox < outW; ox++) {
			const sx = Math.max(0, Math.min(srcW - 1, ox - blurRadius));
			const srcOffset = (sy * srcW + sx) * 4;
			const dstOffset = (oy * outW + ox) * 4;
			bufferA[dstOffset] = src[srcOffset]!;
			bufferA[dstOffset + 1] = src[srcOffset + 1]!;
			bufferA[dstOffset + 2] = src[srcOffset + 2]!;
			bufferA[dstOffset + 3] = src[srcOffset + 3]!;
		}
	}

	const bufferB = new Float64Array(outW * outH * 4);
	const radii = boxRadiiForGaussian(blurRadius);

	boxBlurPass(bufferA, bufferB, outW, outH, radii[0]);
	boxBlurPass(bufferB, bufferA, outW, outH, radii[1]);
	boxBlurPass(bufferA, bufferB, outW, outH, radii[2]);

	const outData = new Uint8ClampedArray(outW * outH * 4);

	for (let offset = 0; offset < outData.length; offset++) {
		outData[offset] = Math.round(bufferB[offset]!);
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

	const mipCount = Math.min(8, maxRadius);
	const mipLevels: Array<{ radius: number; data: Float64Array; overflow: number }> = [];

	for (let mipIdx = 0; mipIdx < mipCount; mipIdx++) {
		const mipRadius = Math.max(1, Math.round(((mipIdx + 1) / mipCount) * maxRadius));

		if (mipLevels.length > 0 && mipLevels[mipLevels.length - 1]!.radius === mipRadius) continue;

		const result = normalizeResult(applyUniformBlur(pixels, mipRadius));
		const mipData = new Float64Array(result.pixels.data.length);

		for (let offset = 0; offset < result.pixels.data.length; offset++) {
			mipData[offset] = result.pixels.data[offset]!;
		}

		mipLevels.push({
			radius: mipRadius,
			data: mipData,
			overflow: result.overflow.top,
		});
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
				effectiveR = (lum / 255) * blurRadius;
			}

			const outOffset = (oy * outW + ox) * 4;

			if (effectiveR <= 0) {
				if (sx >= 0 && sx < srcW && sy >= 0 && sy < srcH) {
					const srcOffset = (sy * srcW + sx) * 4;
					outData[outOffset] = src[srcOffset]!;
					outData[outOffset + 1] = src[srcOffset + 1]!;
					outData[outOffset + 2] = src[srcOffset + 2]!;
					outData[outOffset + 3] = src[srcOffset + 3]!;
				}

				continue;
			}

			let lowerMip = mipLevels[0]!;
			let upperMip = mipLevels[0]!;

			for (const mip of mipLevels) {
				if (mip.radius <= effectiveR) {
					lowerMip = mip;
				}

				if (mip.radius >= effectiveR) {
					upperMip = mip;
					break;
				}
			}

			const lowerX = ox - maxRadius + lowerMip.overflow;
			const lowerY = oy - maxRadius + lowerMip.overflow;
			const lowerW = srcW + 2 * lowerMip.overflow;
			const lowerH = srcH + 2 * lowerMip.overflow;

			const upperX = ox - maxRadius + upperMip.overflow;
			const upperY = oy - maxRadius + upperMip.overflow;
			const upperW = srcW + 2 * upperMip.overflow;
			const upperH = srcH + 2 * upperMip.overflow;

			let blend = 0;

			if (upperMip.radius !== lowerMip.radius) {
				blend = (effectiveR - lowerMip.radius) / (upperMip.radius - lowerMip.radius);
			}

			for (let channel = 0; channel < 4; channel++) {
				let lowerVal = 0;
				let upperVal = 0;

				if (lowerX >= 0 && lowerX < lowerW && lowerY >= 0 && lowerY < lowerH) {
					lowerVal = lowerMip.data[(lowerY * lowerW + lowerX) * 4 + channel]!;
				}

				if (upperX >= 0 && upperX < upperW && upperY >= 0 && upperY < upperH) {
					upperVal = upperMip.data[(upperY * upperW + upperX) * 4 + channel]!;
				}

				outData[outOffset + channel] = Math.round(lowerVal + (upperVal - lowerVal) * blend);
			}
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

interface BlurProps {
	/** Blur radius in pixels. With a map, radius scales per-pixel by map luminance. */
	radius: number;
	/** `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance. */
	mode?: "parameter" | "mix";
	map?: ReactNode;
	children: ReactNode;
}

/**
 * Applies a Gaussian-approximation blur or a map-driven variable-radius blur.
 *
 * - `radius` — Blur radius in pixels. With a map, radius scales per-pixel by map luminance.
 * - `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.
 *
 * @param props
 * @category Effects
 */
export function Blur({ radius, mode = "parameter", map, children }: BlurProps) {
	const effect = useCallback<PipelineCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyVariableBlur(target, mapPixels, radius)
				}

				const result = normalizeResult(applyUniformBlur(target, radius))
				const { overflow } = result
				const paddedTarget = padImageData(target, overflow.top, overflow.right, overflow.bottom, overflow.left)
				const paddedMap = padImageData(mapPixels, overflow.top, overflow.right, overflow.bottom, overflow.left)

				return { pixels: mixBlend(paddedTarget, result.pixels, paddedMap), overflow }
			}

			return applyUniformBlur(target, radius)
		},
		[radius, mode],
	);

	return (
		<Pipeline effect={effect} map={map}>
			{children}
		</Pipeline>
	);
}
