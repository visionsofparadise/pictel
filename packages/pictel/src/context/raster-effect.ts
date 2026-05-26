import { createContext, useContext } from "react";

export interface Registry {
	register(id: string, getPending: () => boolean): () => void;
	notify(id: string): void;
	anyPending(): boolean;
	subscribe(callback: () => void): () => void;
}

export function createRegistry(): Registry {
	const registrants = new Map<string, () => boolean>();
	const pendingState = new Map<string, boolean>();
	const subscribers = new Set<() => void>();
	let pendingCount = 0;

	function fanout(): void {
		for (const callback of subscribers) callback();
	}

	return {
		register(id, getPending) {
			// Re-register with the same id replaces silently (matches the
			// prior `Map.set` behavior). Reconcile the cached pending count
			// against any previously stored state for this id.
			const previous = pendingState.get(id);

			if (previous === true) pendingCount--;

			const current = getPending();

			registrants.set(id, getPending);
			pendingState.set(id, current);

			if (current) pendingCount++;

			fanout();

			return () => {
				const last = pendingState.get(id);

				if (last === true) pendingCount--;

				registrants.delete(id);
				pendingState.delete(id);
				fanout();
			};
		},
		notify(id) {
			const getPending = registrants.get(id);

			if (getPending !== undefined) {
				const previous = pendingState.get(id) ?? false;
				const current = getPending();

				if (current !== previous) {
					pendingState.set(id, current);

					if (current) pendingCount++;
					else pendingCount--;
				}
			}

			fanout();
		},
		anyPending() {
			return pendingCount > 0;
		},
		subscribe(callback) {
			subscribers.add(callback);

			return () => {
				subscribers.delete(callback);
			};
		},
	};
}

export const RasterEffectContext = createContext<Registry | null>(null);

export function useRasterEffectContext(): Registry {
	const value = useContext(RasterEffectContext);

	if (value === null) {
		throw new Error("useRasterEffectContext must be used within a Canvas (or nested RasterEffect) — no RasterEffectContext provider was found in the ancestry");
	}

	return value;
}
