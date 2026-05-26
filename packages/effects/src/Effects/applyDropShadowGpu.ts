import { normalizeResult, type EffectResult } from "pictel"
import { applyBlurGpu } from "./applyBlurGpu"
import { parseColor } from "./utils/parse-color"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * GPU-accelerated counterpart to `applyDropShadow`. Same math, same output:
 * the only difference is the mask-blur step runs as a WebGPU separable box
 * cascade (`applyBlurGpu`) instead of the CPU `applyUniformBlur`. The
 * surrounding mask-build and color-composite passes stay on CPU — they're
 * a tiny fraction of total cost and porting them to GPU would only add
 * upload/readback overhead.
 *
 * Throws if WebGPU is unavailable.
 */
export async function applyDropShadowGpu(
	pixels: ImageData,
	offsetX: number,
	offsetY: number,
	blurRadius: number,
	color: string,
): Promise<EffectResult> {
	const srcW = pixels.width
	const srcH = pixels.height
	const src = pixels.data
	const blur = Math.round(Math.max(0, blurRadius))
	const parsed = parseColor(color)

	const absOx = Math.abs(offsetX)
	const absOy = Math.abs(offsetY)
	const outW = srcW + 2 * blur + absOx
	const outH = srcH + 2 * blur + absOy

	const shadowOriginX = blur + Math.max(0, offsetX)
	const shadowOriginY = blur + Math.max(0, offsetY)

	const maskData = new Uint8ClampedArray(outW * outH * 4)

	for (let sy = 0; sy < srcH; sy++) {
		for (let sx = 0; sx < srcW; sx++) {
			const srcIdx = (sy * srcW + sx) * 4
			const dstX = shadowOriginX + sx
			const dstY = shadowOriginY + sy
			const dstIdx = (dstY * outW + dstX) * 4

			const alpha = src[srcIdx + 3]!
			maskData[dstIdx] = alpha
			maskData[dstIdx + 1] = alpha
			maskData[dstIdx + 2] = alpha
			maskData[dstIdx + 3] = alpha
		}
	}

	const maskImage = new ImageData(maskData, outW, outH)
	let blurredMask: ImageData

	if (blur > 0) {
		// GPU blur. `applyBlurGpu` returns an EffectResult with overflow
		// matching `applyUniformBlur`; `normalizeResult` no-ops on a passthrough
		// EffectResult so we just take `.pixels` directly.
		const blurred = await applyBlurGpu(maskImage, blur)
		blurredMask = blurred.pixels
	} else {
		blurredMask = maskImage
	}

	const bW = blurredMask.width
	const bH = blurredMask.height
	const blurredData = blurredMask.data
	const outputData = new Uint8ClampedArray(bW * bH * 4)

	const colorAlpha = parsed.a / 255

	for (let px = 0; px < blurredData.length; px += 4) {
		const shadowAlpha = (blurredData[px + 3]! / 255) * colorAlpha
		outputData[px] = parsed.r
		outputData[px + 1] = parsed.g
		outputData[px + 2] = parsed.b
		outputData[px + 3] = Math.round(shadowAlpha * 255)
	}

	const srcInExpandedX = blur + Math.max(0, -offsetX)
	const srcInExpandedY = blur + Math.max(0, -offsetY)
	const srcInBlurredX = blur > 0 ? srcInExpandedX + blur : srcInExpandedX
	const srcInBlurredY = blur > 0 ? srcInExpandedY + blur : srcInExpandedY

	for (let sy = 0; sy < srcH; sy++) {
		for (let sx = 0; sx < srcW; sx++) {
			const srcIdx = (sy * srcW + sx) * 4
			const dstX = srcInBlurredX + sx
			const dstY = srcInBlurredY + sy
			const dstIdx = (dstY * bW + dstX) * 4

			const srcA = src[srcIdx + 3]! / 255
			const dstA = outputData[dstIdx + 3]! / 255
			const outA = srcA + dstA * (1 - srcA)

			if (outA > 0) {
				outputData[dstIdx] = Math.round((src[srcIdx]! * srcA + outputData[dstIdx]! * dstA * (1 - srcA)) / outA)
				outputData[dstIdx + 1] = Math.round((src[srcIdx + 1]! * srcA + outputData[dstIdx + 1]! * dstA * (1 - srcA)) / outA)
				outputData[dstIdx + 2] = Math.round((src[srcIdx + 2]! * srcA + outputData[dstIdx + 2]! * dstA * (1 - srcA)) / outA)
				outputData[dstIdx + 3] = Math.round(outA * 255)
			}
		}
	}

	const overflow = {
		top: blur > 0 ? srcInBlurredY : Math.max(0, blur - offsetY),
		right: blur > 0 ? bW - srcInBlurredX - srcW : Math.max(0, blur + offsetX),
		bottom: blur > 0 ? bH - srcInBlurredY - srcH : Math.max(0, blur + offsetY),
		left: blur > 0 ? srcInBlurredX : Math.max(0, blur - offsetX),
	}

	return normalizeResult({
		pixels: new ImageData(outputData, bW, bH),
		overflow,
	})
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */
