export function colorBurn(dst: number, src: number): number {
	return src === 0 ? 0 : Math.max(0, 1 - (1 - dst) / src)
}
