import { afterEach, describe, expect, test } from "vitest";
import { createEffectCache, type CacheKeyParts } from "./effect-cache";

let createdDatabases: Array<string> = [];

function uniqueDbName(label: string): string {
	const dbName = `pictel-effect-cache-test-${label}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
	createdDatabases.push(dbName);

	return dbName;
}

function deleteDatabase(name: string): Promise<void> {
	return new Promise<void>((resolve) => {
		const request = indexedDB.deleteDatabase(name);
		request.onsuccess = () => {
			resolve();
		};
		request.onerror = () => {
			resolve();
		};
		request.onblocked = () => {
			resolve();
		};
	});
}

afterEach(async () => {
	const names = createdDatabases;
	createdDatabases = [];

	await Promise.all(names.map(deleteDatabase));
});

function makePixels(width: number, height: number, fill: (index: number) => number): ImageData {
	const buffer = new Uint8ClampedArray(width * height * 4);

	for (let index = 0; index < buffer.length; index++) {
		buffer[index] = fill(index);
	}

	return new ImageData(buffer, width, height);
}

function key(parts: Partial<CacheKeyParts> = {}): CacheKeyParts {
	return {
		targetHash: parts.targetHash ?? 1,
		applyHash: parts.applyHash ?? null,
		mapHash: parts.mapHash ?? null,
		version: parts.version ?? "test@1",
	};
}

describe("EffectCache (IndexedDB)", () => {
	test("put then get with identical key returns the stored ImageData", async () => {
		const cache = createEffectCache({ dbName: uniqueDbName("roundtrip") });
		const pixels = makePixels(4, 4, (index) => index % 256);

		await cache.put(key(), pixels);

		const result = await cache.get(key());

		expect(result).not.toBeNull();
		expect(result?.width).toBe(4);
		expect(result?.height).toBe(4);
		expect(Array.from(result?.data ?? [])).toEqual(Array.from(pixels.data));
	});

	test("get with a non-matching key returns null", async () => {
		const cache = createEffectCache({ dbName: uniqueDbName("miss") });
		const pixels = makePixels(2, 2, () => 100);

		await cache.put(key({ targetHash: 1 }), pixels);

		const miss = await cache.get(key({ targetHash: 2 }));

		expect(miss).toBeNull();
	});

	test("entries with different versions do not collide", async () => {
		const cache = createEffectCache({ dbName: uniqueDbName("version") });
		const pixelsV1 = makePixels(2, 2, () => 10);
		const pixelsV2 = makePixels(2, 2, () => 200);

		await cache.put(key({ version: "v1" }), pixelsV1);
		await cache.put(key({ version: "v2" }), pixelsV2);

		const readV1 = await cache.get(key({ version: "v1" }));
		const readV2 = await cache.get(key({ version: "v2" }));

		expect(Array.from(readV1?.data ?? [])).toEqual(Array.from(pixelsV1.data));
		expect(Array.from(readV2?.data ?? [])).toEqual(Array.from(pixelsV2.data));
	});

	test("clear empties the store", async () => {
		const cache = createEffectCache({ dbName: uniqueDbName("clear") });
		await cache.put(key(), makePixels(2, 2, () => 1));

		await cache.clear();

		expect(await cache.get(key())).toBeNull();
	});

	test("LRU eviction drops the oldest entry when total bytes exceeds the cap", async () => {
		// Each 16x16 RGBA entry is 1024 bytes. With maxBytes = 2048, three writes
		// should evict the oldest-by-lastAccess (the first).
		const cache = createEffectCache({ dbName: uniqueDbName("lru"), maxBytes: 2048 });
		const a = makePixels(16, 16, () => 1);
		const b = makePixels(16, 16, () => 2);
		const c = makePixels(16, 16, () => 3);

		await cache.put(key({ targetHash: 1 }), a);
		// Ensure lastAccess timestamps differ even on fast clocks.
		await new Promise<void>((resolve) => {
			setTimeout(resolve, 5);
		});
		await cache.put(key({ targetHash: 2 }), b);
		await new Promise<void>((resolve) => {
			setTimeout(resolve, 5);
		});
		await cache.put(key({ targetHash: 3 }), c);

		expect(await cache.get(key({ targetHash: 1 }))).toBeNull();
		expect(await cache.get(key({ targetHash: 2 }))).not.toBeNull();
		expect(await cache.get(key({ targetHash: 3 }))).not.toBeNull();
	});

	test("falls back to a no-op cache when open() rejects", async () => {
		// Force open to fail by reusing a dbName at a higher pre-existing
		// version: opening at version 1 against an existing version-2 DB triggers
		// a VersionError.
		const dbName = uniqueDbName("fail-open");

		await new Promise<void>((resolve, reject) => {
			const request = indexedDB.open(dbName, 5);
			request.onsuccess = () => {
				request.result.close();
				resolve();
			};
			request.onerror = () => {
				reject(request.error ?? new Error("setup open failed"));
			};
		});

		const cache = createEffectCache({ dbName });
		const pixels = makePixels(2, 2, () => 7);

		await expect(cache.put(key(), pixels)).resolves.toBeUndefined();
		await expect(cache.get(key())).resolves.toBeNull();
	});
});
