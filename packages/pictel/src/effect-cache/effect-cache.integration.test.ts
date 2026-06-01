import { afterEach, describe, expect, test, vi } from "vitest";
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

	test("rejects entries exceeding maxEntryBytes at the write boundary", async () => {
		// 16x16 RGBA = 1024 bytes; cap at 500 forces rejection.
		const cache = createEffectCache({ dbName: uniqueDbName("size-cap-reject"), maxEntryBytes: 500 });
		const oversized = makePixels(16, 16, () => 9);

		await cache.put(key(), oversized);

		expect(await cache.get(key())).toBeNull();
	});

	test("logs the size-cap warning once per version across repeated oversized puts", async () => {
		const cache = createEffectCache({ dbName: uniqueDbName("size-cap-log"), maxEntryBytes: 500 });
		const oversized = makePixels(16, 16, () => 9);
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		try {
			await cache.put(key({ version: "alpha" }), oversized);
			await cache.put(key({ version: "alpha", targetHash: 2 }), oversized);
			await cache.put(key({ version: "beta" }), oversized);

			const sizeCapMessages = warnSpy.mock.calls
				.map((args) => String(args[0] ?? ""))
				.filter((message) => message.includes("skipping cache write for entry exceeding maxEntryBytes"));

			expect(sizeCapMessages.length).toBe(2);
			expect(sizeCapMessages.some((m) => m.includes("version=alpha"))).toBe(true);
			expect(sizeCapMessages.some((m) => m.includes("version=beta"))).toBe(true);
		} finally {
			warnSpy.mockRestore();
		}
	});

	test("entries below maxEntryBytes cache normally with the cap configured", async () => {
		const cache = createEffectCache({ dbName: uniqueDbName("size-cap-pass"), maxEntryBytes: 4096 });
		const fits = makePixels(16, 16, () => 5);

		await cache.put(key(), fits);

		const result = await cache.get(key());

		expect(result).not.toBeNull();
		expect(Array.from(result?.data ?? [])).toEqual(Array.from(fits.data));
	});

	test("get returns the entry while expiresAt is in the future and updates lastAccess", async () => {
		const clock = { now: 1000 };
		const cache = createEffectCache({
			dbName: uniqueDbName("ttl-future"),
			ttlMs: 1000,
			nowFn: () => clock.now,
		});
		const pixels = makePixels(4, 4, () => 11);

		await cache.put(key(), pixels);

		clock.now = 1500;

		const result = await cache.get(key());

		expect(result).not.toBeNull();
		expect(Array.from(result?.data ?? [])).toEqual(Array.from(pixels.data));
	});

	test("get treats expired entries as misses and deletes them inline", async () => {
		const clock = { now: 1000 };
		const dbName = uniqueDbName("ttl-expired");
		const cache = createEffectCache({
			dbName,
			ttlMs: 1000,
			nowFn: () => clock.now,
		});
		const pixels = makePixels(4, 4, () => 22);

		await cache.put(key(), pixels);

		clock.now = 5000;

		expect(await cache.get(key())).toBeNull();

		const directRecord = await new Promise<unknown>((resolve, reject) => {
			const openRequest = indexedDB.open(dbName);
			openRequest.onsuccess = () => {
				const database = openRequest.result;
				const transaction = database.transaction("entries", "readonly");
				const store = transaction.objectStore("entries");
				const getRequest = store.getAll();
				getRequest.onsuccess = () => {
					database.close();
					resolve(getRequest.result);
				};
				getRequest.onerror = () => {
					database.close();
					reject(getRequest.error ?? new Error("getAll failed"));
				};
			};
			openRequest.onerror = () => {
				reject(openRequest.error ?? new Error("open failed"));
			};
		});

		expect(directRecord).toEqual([]);
	});

	test("expired-entry eviction decrements totalBytes so room is reclaimed for new writes", async () => {
		const clock = { now: 1000 };
		const cache = createEffectCache({
			dbName: uniqueDbName("ttl-meta"),
			maxBytes: 2048,
			ttlMs: 100_000,
			nowFn: () => clock.now,
		});
		// Two 1024-byte entries fill the cap exactly. Without the meta
		// decrement, writing entry C after A's lazy expiry would push the
		// total over the cap and evict B via LRU. Clock advances between
		// A's expiry (101_000) and B's expiry (150_000) so only A is
		// collected.
		const a = makePixels(16, 16, () => 1);
		const b = makePixels(16, 16, () => 2);
		const c = makePixels(16, 16, () => 3);

		await cache.put(key({ targetHash: 1 }), a);
		clock.now = 50_000;
		await cache.put(key({ targetHash: 2 }), b);

		clock.now = 110_000;

		expect(await cache.get(key({ targetHash: 1 }))).toBeNull();

		clock.now = 120_000;
		await cache.put(key({ targetHash: 3 }), c);

		expect(await cache.get(key({ targetHash: 2 }))).not.toBeNull();
		expect(await cache.get(key({ targetHash: 3 }))).not.toBeNull();
	});

	test("ttlMs Infinity writes no expiresAt and entries survive regardless of clock", async () => {
		const clock = { now: 1000 };
		const dbName = uniqueDbName("ttl-infinity");
		const cache = createEffectCache({
			dbName,
			ttlMs: Infinity,
			nowFn: () => clock.now,
		});
		const pixels = makePixels(4, 4, () => 33);

		await cache.put(key(), pixels);

		clock.now = Number.MAX_SAFE_INTEGER;

		const result = await cache.get(key());

		expect(result).not.toBeNull();
		expect(Array.from(result?.data ?? [])).toEqual(Array.from(pixels.data));

		const stored = await new Promise<{ expiresAt?: number } | null>((resolve, reject) => {
			const openRequest = indexedDB.open(dbName);
			openRequest.onsuccess = () => {
				const database = openRequest.result;
				const transaction = database.transaction("entries", "readonly");
				const store = transaction.objectStore("entries");
				const getRequest = store.getAll();
				getRequest.onsuccess = () => {
					database.close();
					const records = getRequest.result as Array<{ expiresAt?: number }>;
					resolve(records[0] ?? null);
				};
				getRequest.onerror = () => {
					database.close();
					reject(getRequest.error ?? new Error("getAll failed"));
				};
			};
			openRequest.onerror = () => {
				reject(openRequest.error ?? new Error("open failed"));
			};
		});

		expect(stored).not.toBeNull();
		expect(stored?.expiresAt).toBeUndefined();
	});

	test("legacy entries without expiresAt read back successfully", async () => {
		const dbName = uniqueDbName("ttl-legacy");
		// Create the DB shape the cache expects, then insert a v1-style record
		// with no `expiresAt` field — simulating an entry written before the
		// TTL feature shipped.
		await new Promise<void>((resolve, reject) => {
			const openRequest = indexedDB.open(dbName, 1);
			openRequest.onupgradeneeded = () => {
				const database = openRequest.result;
				const entries = database.createObjectStore("entries", { keyPath: "key" });
				entries.createIndex("by-last-access", "lastAccess");
				database.createObjectStore("meta", { keyPath: "id" });
			};
			openRequest.onsuccess = () => {
				const database = openRequest.result;
				const transaction = database.transaction(["entries", "meta"], "readwrite");
				const buffer = new Uint8ClampedArray(4 * 4 * 4).fill(77).buffer;
				transaction.objectStore("entries").put({
					key: "1:_:_:legacy@1",
					width: 4,
					height: 4,
					buffer,
					bytes: buffer.byteLength,
					lastAccess: 1000,
				});
				transaction.objectStore("meta").put({ id: "totals", totalBytes: buffer.byteLength });
				transaction.oncomplete = () => {
					database.close();
					resolve();
				};
				transaction.onerror = () => {
					database.close();
					reject(transaction.error ?? new Error("legacy insert failed"));
				};
			};
			openRequest.onerror = () => {
				reject(openRequest.error ?? new Error("legacy open failed"));
			};
		});

		const clock = { now: Number.MAX_SAFE_INTEGER };
		const cache = createEffectCache({
			dbName,
			ttlMs: 1000,
			nowFn: () => clock.now,
		});

		const result = await cache.get(key({ version: "legacy@1" }));

		expect(result).not.toBeNull();
		expect(result?.width).toBe(4);
		expect(result?.height).toBe(4);
		expect(Array.from(result?.data ?? []).every((value) => value === 77)).toBe(true);
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
