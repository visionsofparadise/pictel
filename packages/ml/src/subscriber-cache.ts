/**
 * Subscriber-tracked dispose policy for ML resource caches.
 *
 * Each cache entry tracks two counts:
 * - `subscribers` — components actively mounted against the resource. Incremented
 *   in a mount-time `subscribe` call, decremented by the returned `unsubscribe`.
 * - `inFlight` — inference calls currently using the resource. Bracketed by `track`.
 *
 * Disposal policy: when `subscribers` reaches zero AND `inFlight` is zero, the
 * resource is disposed (`dispose` callback called on the resolved value) and the
 * cache entry is removed. If `subscribers` hits zero while inference is in flight,
 * disposal is deferred until the last `track` call settles. Subsequent `subscribe`
 * for the same key before disposal completes reuses the entry — disposal is
 * cancelled.
 */

interface CacheEntry<T> {
	promise: Promise<T>
	subscribers: number
	inFlight: number
	disposalPending: boolean
}

export interface SubscriberCache<T, Key extends ReadonlyArray<unknown>> {
	subscribe: (...key: Key) => { promise: Promise<T>; unsubscribe: () => void }
	track: <R>(key: Key, runner: (resource: T) => Promise<R>) => Promise<R>
	dispose: (...key: Key) => Promise<void>
	size: () => number
}

export interface SubscriberCacheOptions<T, Key extends ReadonlyArray<unknown>> {
	load: (...key: Key) => Promise<T>
	dispose: (resource: T) => Promise<void>
	cacheKey: (...key: Key) => string
}

export function createSubscriberCache<T, Key extends ReadonlyArray<unknown>>(
	options: SubscriberCacheOptions<T, Key>,
): SubscriberCache<T, Key> {
	const entries = new Map<string, CacheEntry<T>>()

	function maybeDispose(keyStr: string, entry: CacheEntry<T>): void {
		if (entry.subscribers > 0) return

		if (entry.inFlight > 0) {
			entry.disposalPending = true

			return
		}

		entries.delete(keyStr)
		void entry.promise.then((resource) => options.dispose(resource)).catch(() => {
			// Swallow dispose errors — caller has already released the subscription.
		})
	}

	return {
		subscribe(...key: Key) {
			const keyStr = options.cacheKey(...key)
			let entry = entries.get(keyStr)

			if (!entry) {
				entry = {
					promise: options.load(...key),
					subscribers: 0,
					inFlight: 0,
					disposalPending: false,
				}
				entries.set(keyStr, entry)
			}

			entry.subscribers++
			entry.disposalPending = false

			let released = false

			const unsubscribe = (): void => {
				if (released) return

				released = true
				const current = entries.get(keyStr)

				if (!current) return

				current.subscribers--
				maybeDispose(keyStr, current)
			}

			return { promise: entry.promise, unsubscribe }
		},

		async track<R>(key: Key, runner: (resource: T) => Promise<R>): Promise<R> {
			const keyStr = options.cacheKey(...key)
			const entry = entries.get(keyStr)

			if (!entry) {
				// No active subscription — caller is using a stale promise. Run the
				// call without in-flight bracketing; the cache no longer governs the
				// resource lifecycle for this call.
				const resource = await options.load(...key)

				return runner(resource)
			}

			entry.inFlight++

			try {
				const resource = await entry.promise

				return await runner(resource)
			} finally {
				entry.inFlight--
				const current = entries.get(keyStr)

				if (current === entry) maybeDispose(keyStr, current)
			}
		},

		async dispose(...key: Key): Promise<void> {
			const keyStr = options.cacheKey(...key)
			const entry = entries.get(keyStr)

			if (!entry) return

			entries.delete(keyStr)
			const resource = await entry.promise
			await options.dispose(resource)
		},

		size() {
			return entries.size
		},
	}
}
