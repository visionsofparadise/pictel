export function luminance(re: number, gr: number, bl: number): number {
	return 0.299 * re + 0.587 * gr + 0.114 * bl
}
