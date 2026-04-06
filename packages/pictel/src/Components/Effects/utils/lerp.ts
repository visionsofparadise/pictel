/** Linear interpolation between two values. */
export function lerp(from: number, to: number, frac: number): number {
	return from + frac * (to - from)
}
