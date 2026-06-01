const FNV_OFFSET_BASIS_32 = 0x811c9dc5;
const FNV_PRIME_32 = 0x01000193;

export function hashImageData(pixels: ImageData): number {
	const { data, width, height } = pixels;
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	const wordCount = Math.floor(data.byteLength / 4);

	let hash = FNV_OFFSET_BASIS_32 >>> 0;

	hash = Math.imul(hash ^ (width & 0xff), FNV_PRIME_32) >>> 0;
	hash = Math.imul(hash ^ ((width >>> 8) & 0xff), FNV_PRIME_32) >>> 0;
	hash = Math.imul(hash ^ ((width >>> 16) & 0xff), FNV_PRIME_32) >>> 0;
	hash = Math.imul(hash ^ ((width >>> 24) & 0xff), FNV_PRIME_32) >>> 0;
	hash = Math.imul(hash ^ (height & 0xff), FNV_PRIME_32) >>> 0;
	hash = Math.imul(hash ^ ((height >>> 8) & 0xff), FNV_PRIME_32) >>> 0;
	hash = Math.imul(hash ^ ((height >>> 16) & 0xff), FNV_PRIME_32) >>> 0;
	hash = Math.imul(hash ^ ((height >>> 24) & 0xff), FNV_PRIME_32) >>> 0;

	for (let wordIdx = 0; wordIdx < wordCount; wordIdx++) {
		const word = view.getUint32(wordIdx * 4, true);

		hash = Math.imul(hash ^ (word & 0xff), FNV_PRIME_32) >>> 0;
		hash = Math.imul(hash ^ ((word >>> 8) & 0xff), FNV_PRIME_32) >>> 0;
		hash = Math.imul(hash ^ ((word >>> 16) & 0xff), FNV_PRIME_32) >>> 0;
		hash = Math.imul(hash ^ ((word >>> 24) & 0xff), FNV_PRIME_32) >>> 0;
	}

	const tailStart = wordCount * 4;

	for (let byteIdx = tailStart; byteIdx < data.byteLength; byteIdx++) {
		const byte = data[byteIdx] ?? 0;
		hash = Math.imul(hash ^ byte, FNV_PRIME_32) >>> 0;
	}

	return hash >>> 0;
}

interface CanvasHashEntry {
	dataVersion: number;
	hash: number;
}

const canvasHashCache = new WeakMap<HTMLCanvasElement, CanvasHashEntry>();

export function hashCanvasPixels(canvas: HTMLCanvasElement, dataVersion: number): number {
	const cached = canvasHashCache.get(canvas);

	if (cached?.dataVersion === dataVersion) {
		return cached.hash;
	}

	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (context === null) {
		throw new Error("hashCanvasPixels: canvas has no 2d context");
	}

	const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
	const hash = hashImageData(pixels);

	canvasHashCache.set(canvas, { dataVersion, hash });

	return hash;
}
