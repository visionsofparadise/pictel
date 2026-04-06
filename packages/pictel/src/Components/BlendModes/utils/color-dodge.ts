export function colorDodge(dst: number, src: number): number {
	return src === 1 ? 1 : Math.min(1, dst / (1 - src))
}
