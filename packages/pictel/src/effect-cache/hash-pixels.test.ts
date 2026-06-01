// @vitest-environment jsdom

import { describe, it, expect, beforeAll } from "vitest";
import { hashImageData } from "./hash-pixels";

beforeAll(() => {
	if (typeof globalThis.ImageData === "undefined") {
		globalThis.ImageData = class ImageData {
			readonly data: Uint8ClampedArray;
			readonly width: number;
			readonly height: number;
			readonly colorSpace = "srgb" as const;

			constructor(data: Uint8ClampedArray, width: number, height: number) {
				this.data = data;
				this.width = width;
				this.height = height;
			}
		} as unknown as typeof globalThis.ImageData;
	}
});

function makePixels(width: number, height: number, fill: (index: number) => number): ImageData {
	const buffer = new Uint8ClampedArray(width * height * 4);

	for (let index = 0; index < buffer.length; index++) {
		buffer[index] = fill(index);
	}

	return new ImageData(buffer, width, height);
}

describe("hashImageData", () => {
	it("returns the same hash for identical pixel buffers", () => {
		const a = makePixels(8, 8, (index) => index % 256);
		const b = makePixels(8, 8, (index) => index % 256);

		expect(hashImageData(a)).toBe(hashImageData(b));
	});

	it("returns a different hash when one byte changes", () => {
		const a = makePixels(8, 8, (index) => index % 256);
		const b = makePixels(8, 8, (index) => index % 256);
		b.data[42] = (b.data[42] ?? 0) ^ 0x01;

		expect(hashImageData(a)).not.toBe(hashImageData(b));
	});

	it("distinguishes equal-byte buffers of different dimensions", () => {
		const a = makePixels(2, 4, () => 0);
		const b = makePixels(4, 2, () => 0);

		expect(hashImageData(a)).not.toBe(hashImageData(b));
	});

	it("returns an unsigned 32-bit value", () => {
		const pixels = makePixels(4, 4, (index) => (index * 31) & 0xff);
		const hash = hashImageData(pixels);

		expect(Number.isInteger(hash)).toBe(true);
		expect(hash).toBeGreaterThanOrEqual(0);
		expect(hash).toBeLessThanOrEqual(0xffffffff);
	});
});
