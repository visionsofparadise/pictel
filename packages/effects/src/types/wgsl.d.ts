// Vite-style raw-text imports for WGSL shader sources. The `?raw` suffix is a
// Vite convention that returns the file's contents as a string at build time;
// this declaration teaches TypeScript the resulting module shape.
declare module "*.wgsl?raw" {
	const src: string
	export default src
}
