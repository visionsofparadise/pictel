export function staticFile(path: string): string {
	const normalized = path.replace(/^\.?\//, "");

	return `/${normalized}`;
}
