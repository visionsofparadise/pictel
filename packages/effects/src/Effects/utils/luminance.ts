export function luminance(red: number, green: number, blue: number): number {
	return 0.299 * red + 0.587 * green + 0.114 * blue
}
