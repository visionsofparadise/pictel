/**
 * Per-Canvas pool of reusable `ImageData` buffers, bucketed by dimensions.
 *
 * Deep compositions allocate many multi-megabyte `ImageData` buffers per
 * render — one each for every captured `target`/`apply`/`map` plus every
 * intermediate produced inside effect functions. Allowing each to be GC'd
 * between renders pushes the heap-allocation rate up and adds GC pauses
 * proportional to composition depth.
 *
 * The pool buckets released buffers by `${width}x${height}` and hands them
 * back to `acquire(width, height)` callers. Buffers from a different size
 * are not reused — `ImageData` is dimension-typed. Each bucket is capped
 * (`maxPerBucket`, default 4) to bound retained memory: a deep composition
 * with 6 captures of 640×960 plus a few intermediate dim classes retains
 * roughly `4 × dimClasses × 2.5MB` rather than letting allocation grow
 * unbounded.
 *
 * Pool consumers must only release buffers they own. User-returned
 * `ImageData` from effect callbacks is user-owned by contract and must
 * NOT be released.
 */

export interface ImageDataPool {
	acquire(width: number, height: number): ImageData;
	release(data: ImageData): void;
}

export interface ImageDataPoolOptions {
	maxPerBucket?: number;
}

function bucketKey(width: number, height: number): string {
	return `${String(width)}x${String(height)}`;
}

export function createImageDataPool(options: ImageDataPoolOptions = {}): ImageDataPool {
	const maxPerBucket = options.maxPerBucket ?? 4;
	const buckets = new Map<string, Array<ImageData>>();

	return {
		acquire(width, height) {
			const key = bucketKey(width, height);
			const bucket = buckets.get(key);

			if (bucket !== undefined && bucket.length > 0) {
				const reused = bucket.pop();

				if (reused !== undefined) return reused;
			}

			// Use the 3-argument constructor (data, width, height) so the
			// pool works under jsdom (test) — jsdom's ImageData does not
			// support the 2-argument (width, height) form.
			return new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
		},
		release(data) {
			const key = bucketKey(data.width, data.height);
			let bucket = buckets.get(key);

			if (bucket === undefined) {
				bucket = [];
				buckets.set(key, bucket);
			}

			if (bucket.length >= maxPerBucket) return;

			bucket.push(data);
		},
	};
}
