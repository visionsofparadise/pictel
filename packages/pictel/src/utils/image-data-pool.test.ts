// @vitest-environment jsdom

import { describe, it, expect, beforeAll } from "vitest";
import { createImageDataPool } from "./image-data-pool";

// jsdom does not expose `ImageData` on the global. Shim a minimal compatible
// class so `new ImageData(data, width, height)` works inside the pool.
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

describe("createImageDataPool", () => {
	it("allocates a fresh ImageData on first acquire", () => {
		const pool = createImageDataPool();
		const data = pool.acquire(4, 4);

		expect(data.width).toBe(4);
		expect(data.height).toBe(4);
		expect(data.data.length).toBe(64);
	});

	it("reuses a released ImageData on a matching acquire", () => {
		const pool = createImageDataPool();
		const first = pool.acquire(4, 4);

		pool.release(first);

		const reused = pool.acquire(4, 4);

		expect(reused).toBe(first);
	});

	it("does not reuse buffers of a different size", () => {
		const pool = createImageDataPool();
		const small = pool.acquire(2, 2);

		pool.release(small);

		const large = pool.acquire(4, 4);

		expect(large).not.toBe(small);
		expect(large.width).toBe(4);
		expect(large.height).toBe(4);
	});

	it("keeps separate buckets for different dimensions", () => {
		const pool = createImageDataPool();
		const a = pool.acquire(2, 2);
		const b = pool.acquire(4, 4);

		pool.release(a);
		pool.release(b);

		expect(pool.acquire(2, 2)).toBe(a);
		expect(pool.acquire(4, 4)).toBe(b);
	});

	it("caps each bucket at maxPerBucket (default 4)", () => {
		const pool = createImageDataPool();
		const buffers = [pool.acquire(2, 2), pool.acquire(2, 2), pool.acquire(2, 2), pool.acquire(2, 2), pool.acquire(2, 2)];

		for (const buffer of buffers) pool.release(buffer);

		// Drain the bucket — should hand back exactly maxPerBucket=4 buffers
		// from the released set; the 5th release was dropped.
		const reused = new Set<ImageData>();

		for (let acquireIdx = 0; acquireIdx < 4; acquireIdx++) {
			reused.add(pool.acquire(2, 2));
		}

		expect(reused.size).toBe(4);

		// The pool is now empty for this bucket — next acquire allocates fresh.
		const fresh = pool.acquire(2, 2);

		expect(reused.has(fresh)).toBe(false);
	});

	it("respects a custom maxPerBucket option", () => {
		const pool = createImageDataPool({ maxPerBucket: 1 });
		const first = pool.acquire(2, 2);
		const second = pool.acquire(2, 2);

		pool.release(first);
		pool.release(second);

		// Only 1 buffer retained; the other was dropped.
		const reused = pool.acquire(2, 2);
		const fresh = pool.acquire(2, 2);

		expect([first, second]).toContain(reused);
		expect(reused).not.toBe(fresh);
	});
});
