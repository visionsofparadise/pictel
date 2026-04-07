import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import type { EffectResult } from "../../pipeline/raster"
import { RasterEffect } from "../RasterEffect"
import { applyUniformBlur } from "./Blur"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

interface ParsedColor {
	r: number
	g: number
	b: number
	a: number
}

function parseHex(hex: string): ParsedColor {
	const digits = hex.startsWith("#") ? hex.slice(1) : hex

	if (digits.length === 3) {
		return {
			r: parseInt(digits[0]! + digits[0]!, 16),
			g: parseInt(digits[1]! + digits[1]!, 16),
			b: parseInt(digits[2]! + digits[2]!, 16),
			a: 255,
		}
	}

	if (digits.length === 6) {
		return {
			r: parseInt(digits.slice(0, 2), 16),
			g: parseInt(digits.slice(2, 4), 16),
			b: parseInt(digits.slice(4, 6), 16),
			a: 255,
		}
	}

	if (digits.length === 8) {
		return {
			r: parseInt(digits.slice(0, 2), 16),
			g: parseInt(digits.slice(2, 4), 16),
			b: parseInt(digits.slice(4, 6), 16),
			a: parseInt(digits.slice(6, 8), 16),
		}
	}

	return { r: 0, g: 0, b: 0, a: 255 }
}

function parseColor(color: string): ParsedColor {
	const trimmed = color.trim()

	if (trimmed.startsWith("#")) return parseHex(trimmed)

	const rgbaMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/.exec(trimmed)

	if (rgbaMatch) {
		return {
			r: parseInt(rgbaMatch[1]!, 10),
			g: parseInt(rgbaMatch[2]!, 10),
			b: parseInt(rgbaMatch[3]!, 10),
			a: rgbaMatch[4] !== undefined ? Math.round(parseFloat(rgbaMatch[4]) * 255) : 255,
		}
	}

	return { r: 0, g: 0, b: 0, a: 255 }
}

export function applyDropShadow(
	pixels: ImageData,
	offsetX: number,
	offsetY: number,
	blurRadius: number,
	color: string,
): EffectResult {
	const srcW = pixels.width
	const srcH = pixels.height
	const src = pixels.data
	const blur = Math.round(Math.max(0, blurRadius))
	const parsed = parseColor(color)

	const absOx = Math.abs(offsetX)
	const absOy = Math.abs(offsetY)
	const outW = srcW + 2 * blur + absOx
	const outH = srcH + 2 * blur + absOy

	// Step 1: Create alpha mask at the shadow offset position within the expanded canvas
	const shadowOriginX = blur + Math.max(0, offsetX)
	const shadowOriginY = blur + Math.max(0, offsetY)

	const maskData = new Uint8ClampedArray(outW * outH * 4)

	for (let sy = 0; sy < srcH; sy++) {
		for (let sx = 0; sx < srcW; sx++) {
			const srcIdx = (sy * srcW + sx) * 4
			const dstX = shadowOriginX + sx
			const dstY = shadowOriginY + sy
			const dstIdx = (dstY * outW + dstX) * 4

			// Store alpha as grayscale for blur, then colorize after
			const alpha = src[srcIdx + 3]!
			maskData[dstIdx] = alpha
			maskData[dstIdx + 1] = alpha
			maskData[dstIdx + 2] = alpha
			maskData[dstIdx + 3] = alpha
		}
	}

	// Step 2: Blur the shadow mask
	const maskImage = new ImageData(maskData, outW, outH)
	let blurredMask: ImageData

	if (blur > 0) {
		const blurred = applyUniformBlur(maskImage, blur)
		blurredMask = blurred.pixels
	} else {
		blurredMask = maskImage
	}

	// Step 3: Colorize the blurred shadow and composite source over it
	const bW = blurredMask.width
	const bH = blurredMask.height
	const blurredData = blurredMask.data
	const outputData = new Uint8ClampedArray(bW * bH * 4)

	// Colorize: set RGB to parsed color, alpha to shadow alpha * color alpha
	const colorAlpha = parsed.a / 255

	for (let px = 0; px < blurredData.length; px += 4) {
		const shadowAlpha = blurredData[px + 3]! / 255 * colorAlpha
		outputData[px] = parsed.r
		outputData[px + 1] = parsed.g
		outputData[px + 2] = parsed.b
		outputData[px + 3] = Math.round(shadowAlpha * 255)
	}

	// Step 4: Composite source over shadow
	// The source position in the blurred output:
	// If blur was applied, the blurred output is (outW + 2*blur) x (outH + 2*blur) due to applyUniformBlur expanding
	// The source's position within the original expanded canvas was at (blur + max(0,-offsetX), blur + max(0,-offsetY))
	// After blur expansion, add another blur offset
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

			// Source-over compositing
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

	// Step 5: Compute overflow relative to source position
	const overflow = {
		top: blur > 0 ? srcInBlurredY : Math.max(0, blur - offsetY),
		right: blur > 0 ? bW - srcInBlurredX - srcW : Math.max(0, blur + offsetX),
		bottom: blur > 0 ? bH - srcInBlurredY - srcH : Math.max(0, blur + offsetY),
		left: blur > 0 ? srcInBlurredX : Math.max(0, blur - offsetX),
	}

	return {
		pixels: new ImageData(outputData, bW, bH),
		overflow,
	}
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface DropShadowProps extends ComponentPropsWithoutRef<"div"> {
	offsetX: number
	offsetY: number
	blurRadius: number
	color: string
	backdrop?: boolean
	flatten?: boolean
	children?: ReactNode
}

export function DropShadow({ offsetX, offsetY, blurRadius, color, backdrop, flatten, children, ...rest }: DropShadowProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyDropShadow(pixels, offsetX, offsetY, blurRadius, color),
		[offsetX, offsetY, blurRadius, color],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop} flatten={flatten} {...rest}>
			{children}
		</RasterEffect>
	)
}
