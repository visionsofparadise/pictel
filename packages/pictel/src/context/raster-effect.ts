import { createContext, useContext } from "react";

export interface Registry {
	register(id: string, getPending: () => boolean): () => void;
	notify(id: string): void;
	anyPending(): boolean;
	subscribe(callback: () => void): () => void;
}

export function createRegistry(): Registry {
	const registrants = new Map<string, () => boolean>();
	const subscribers = new Set<() => void>();

	function fanout(): void {
		for (const callback of subscribers) callback();
	}

	return {
		register(id, getPending) {
			registrants.set(id, getPending);
			fanout();

			return () => {
				registrants.delete(id);
				fanout();
			};
		},
		notify() {
			fanout();
		},
		anyPending() {
			for (const getPending of registrants.values()) {
				if (getPending()) return true;
			}

			return false;
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
