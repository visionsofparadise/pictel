import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import { TargetEffect } from "../TargetEffect"

function mulberry32(seed: number): () => number {
	let state = seed | 0

	return () => {
		state = (state + 0x6d2b79f5) | 0
		let hash = Math.imul(state ^ (state >>> 15), 1 | state)
		hash = (hash + Math.imul(hash ^ (hash >>> 7), 61 | hash)) ^ hash

		return ((hash ^ (hash >>> 14)) >>> 0) / 0xffffffff
	}
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyGrain(pixels: ImageData, intensity: number, seed: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)
	const rng = mulberry32(seed)

	for (let px = 0; px < src.length; px += 4) {
		const noise = (rng() * 2 - 1) * intensity
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!

		output[px] = Math.min(255, Math.max(0, Math.round(red + noise)))
		output[px + 1] = Math.min(255, Math.max(0, Math.round(green + noise)))
		output[px + 2] = Math.min(255, Math.max(0, Math.round(blue + noise)))
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface GrainProps extends ComponentPropsWithoutRef<"div"> {
	intensity: number
	seed: number
	flatten?: boolean
	children?: ReactNode
}

export function Grain({ intensity, seed, flatten, children, ...rest }: GrainProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyGrain(pixels, intensity, seed),
		[intensity, seed],
	)

	return (
		<TargetEffect effect={effect} flatten={flatten} {...rest}>
			{children}
		</TargetEffect>
	)
}
