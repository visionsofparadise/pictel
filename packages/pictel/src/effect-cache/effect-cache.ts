export interface CacheKeyParts {
	readonly targetHash: number;
	readonly applyHash: number | null;
	readonly mapHash: number | null;
	readonly version: string;
}

export interface EffectCache {
	get(key: CacheKeyParts): Promise<ImageData | null>;
	put(key: CacheKeyParts, value: ImageData): Promise<void>;
	clear(): Promise<void>;
}

export interface CreateEffectCacheOptions {
	dbName?: string;
	maxBytes?: number;
}

interface EntryRecord {
	key: string;
	width: number;
	height: number;
	buffer: ArrayBuffer;
	bytes: number;
	lastAccess: number;
}

interface MetaRecord {
	id: string;
	totalBytes: number;
}

const ENTRY_STORE = "entries";
const META_STORE = "meta";
const META_KEY = "totals";
const LAST_ACCESS_INDEX = "by-last-access";
const DEFAULT_DB_NAME = "pictel-effect-cache";
const DEFAULT_MAX_BYTES = 200 * 1024 * 1024;

function serializeKey(parts: CacheKeyParts): string {
	const apply = parts.applyHash === null ? "_" : parts.applyHash.toString(16);
	const map = parts.mapHash === null ? "_" : parts.mapHash.toString(16);

	return `${parts.targetHash.toString(16)}:${apply}:${map}:${parts.version}`;
}

function createNoopCache(): EffectCache {
	return {
		// eslint-disable-next-line @typescript-eslint/require-await
		async get() {
			return null;
		},
		// eslint-disable-next-line @typescript-eslint/require-await
		async put() {
			return;
		},
		// eslint-disable-next-line @typescript-eslint/require-await
		async clear() {
			return;
		},
	};
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		request.onsuccess = () => {
			resolve(request.result);
		};
		request.onerror = () => {
			reject(request.error ?? new Error("IDBRequest failed"));
		};
	});
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		transaction.oncomplete = () => {
			resolve();
		};
		transaction.onerror = () => {
			reject(transaction.error ?? new Error("IDBTransaction failed"));
		};
		transaction.onabort = () => {
			reject(transaction.error ?? new Error("IDBTransaction aborted"));
		};
	});
}

function openDatabase(dbName: string): Promise<IDBDatabase> {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(dbName, 1);

		request.onupgradeneeded = () => {
			const database = request.result;

			if (!database.objectStoreNames.contains(ENTRY_STORE)) {
				const store = database.createObjectStore(ENTRY_STORE, { keyPath: "key" });
				store.createIndex(LAST_ACCESS_INDEX, "lastAccess");
			}

			if (!database.objectStoreNames.contains(META_STORE)) {
				database.createObjectStore(META_STORE, { keyPath: "id" });
			}
		};

		request.onsuccess = () => {
			resolve(request.result);
		};

		request.onerror = () => {
			reject(request.error ?? new Error("indexedDB.open failed"));
		};

		request.onblocked = () => {
			reject(new Error("indexedDB.open blocked"));
		};
	});
}

async function readTotalBytes(database: IDBDatabase): Promise<number> {
	const transaction = database.transaction(META_STORE, "readonly");
	const store = transaction.objectStore(META_STORE);
	const record = (await requestToPromise(store.get(META_KEY) as IDBRequest<MetaRecord | undefined>)) ?? null;

	return record === null ? 0 : record.totalBytes;
}

export function createEffectCache(options: CreateEffectCacheOptions = {}): EffectCache {
	const dbName = options.dbName ?? DEFAULT_DB_NAME;
	const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

	if (typeof indexedDB === "undefined") {
		console.warn("pictel effect cache: IndexedDB unavailable; effects will run uncached");

		return createNoopCache();
	}

	let databasePromise: Promise<IDBDatabase> | null = null;
	let unavailable = false;

	async function getDatabase(): Promise<IDBDatabase | null> {
		if (unavailable) return null;

		databasePromise ??= openDatabase(dbName).catch((error: unknown) => {
			unavailable = true;
			console.warn("pictel effect cache: IndexedDB open failed; effects will run uncached", error);
			throw error;
		});

		try {
			return await databasePromise;
		} catch {
			return null;
		}
	}

	async function evictUntilUnderCap(database: IDBDatabase): Promise<void> {
		const transaction = database.transaction([ENTRY_STORE, META_STORE], "readwrite");
		const entries = transaction.objectStore(ENTRY_STORE);
		const meta = transaction.objectStore(META_STORE);
		const metaRecord = (await requestToPromise(meta.get(META_KEY) as IDBRequest<MetaRecord | undefined>)) ?? { id: META_KEY, totalBytes: 0 };

		if (metaRecord.totalBytes <= maxBytes) {
			transaction.abort();

			return;
		}

		const index = entries.index(LAST_ACCESS_INDEX);
		const cursorRequest = index.openCursor();
		let remaining = metaRecord.totalBytes;

		await new Promise<void>((resolve, reject) => {
			cursorRequest.onsuccess = () => {
				const cursor = cursorRequest.result;

				if (cursor === null || remaining <= maxBytes) {
					resolve();

					return;
				}

				const record = cursor.value as EntryRecord;
				remaining -= record.bytes;
				cursor.delete();
				cursor.continue();
			};
			cursorRequest.onerror = () => {
				reject(cursorRequest.error ?? new Error("cursor failed"));
			};
		});

		meta.put({ id: META_KEY, totalBytes: remaining } satisfies MetaRecord);

		await transactionToPromise(transaction);
	}

	async function getEntry(key: CacheKeyParts): Promise<ImageData | null> {
		const database = await getDatabase();

		if (database === null) return null;

		const serialized = serializeKey(key);

		try {
			const transaction = database.transaction(ENTRY_STORE, "readwrite");
			const store = transaction.objectStore(ENTRY_STORE);
			const record = (await requestToPromise(store.get(serialized) as IDBRequest<EntryRecord | undefined>)) ?? null;

			if (record === null) {
				transaction.abort();

				return null;
			}

			record.lastAccess = Date.now();
			store.put(record);

			await transactionToPromise(transaction);

			return new ImageData(new Uint8ClampedArray(record.buffer.slice(0)), record.width, record.height);
		} catch (error: unknown) {
			console.warn("pictel effect cache: get failed", error);

			return null;
		}
	}

	async function putEntry(key: CacheKeyParts, value: ImageData): Promise<void> {
		const database = await getDatabase();

		if (database === null) return;

		const serialized = serializeKey(key);
		const sourceBuffer = value.data.buffer;
		const sourceOffset = value.data.byteOffset;
		const sourceLength = value.data.byteLength;
		const buffer = sourceBuffer.slice(sourceOffset, sourceOffset + sourceLength);
		const record: EntryRecord = {
			key: serialized,
			width: value.width,
			height: value.height,
			buffer,
			bytes: buffer.byteLength,
			lastAccess: Date.now(),
		};

		try {
			const transaction = database.transaction([ENTRY_STORE, META_STORE], "readwrite");
			const entries = transaction.objectStore(ENTRY_STORE);
			const meta = transaction.objectStore(META_STORE);
			const existing = (await requestToPromise(entries.get(serialized) as IDBRequest<EntryRecord | undefined>)) ?? null;
			const metaRecord = (await requestToPromise(meta.get(META_KEY) as IDBRequest<MetaRecord | undefined>)) ?? { id: META_KEY, totalBytes: 0 };
			const previousBytes = existing === null ? 0 : existing.bytes;
			const nextTotal = metaRecord.totalBytes - previousBytes + record.bytes;

			entries.put(record);
			meta.put({ id: META_KEY, totalBytes: nextTotal } satisfies MetaRecord);

			await transactionToPromise(transaction);

			if (nextTotal > maxBytes) {
				await evictUntilUnderCap(database);
			}
		} catch (error: unknown) {
			console.warn("pictel effect cache: put failed", error);
		}
	}

	async function clear(): Promise<void> {
		const database = await getDatabase();

		if (database === null) return;

		try {
			const transaction = database.transaction([ENTRY_STORE, META_STORE], "readwrite");
			transaction.objectStore(ENTRY_STORE).clear();
			transaction.objectStore(META_STORE).put({ id: META_KEY, totalBytes: 0 } satisfies MetaRecord);

			await transactionToPromise(transaction);
		} catch (error: unknown) {
			console.warn("pictel effect cache: clear failed", error);
		}
	}

	return {
		get: getEntry,
		put: putEntry,
		clear,
	};
}

let singletonInstance: EffectCache | null = null;

/**
 * Returns the singleton effect-output cache. Pictel's `RasterEffect` calls this
 * internally; consumers rarely need it directly.
 */
export function getEffectCache(): EffectCache {
	singletonInstance ??= createEffectCache();

	return singletonInstance;
}

/**
 * Wipes the IndexedDB-backed effect-output cache. Useful when an effect's
 * algorithm changed but its `version` wasn't bumped (a bug — file an issue).
 * Returns a promise that resolves when the cache is empty.
 */
export function clearEffectCache(): Promise<void> {
	return getEffectCache().clear();
}

// Internal — exported so tests can reset the singleton between cases. Not part
// of the public package surface.
export function resetEffectCacheSingletonForTest(): void {
	singletonInstance = null;
}

// Expose the read for tests that need to verify accounting.
export async function getEffectCacheTotalBytesForTest(dbName: string): Promise<number> {
	if (typeof indexedDB === "undefined") return 0;

	const database = await openDatabase(dbName);

	try {
		return await readTotalBytes(database);
	} finally {
		database.close();
	}
}

// Expose openDatabase only for the test helper above; nothing else should
// reach into IDB directly.
