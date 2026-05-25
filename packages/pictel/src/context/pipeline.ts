import { createContext, useContext } from "react";

/**
 * Per-subtree pending registry. Each Pipeline and RasterSource registers a
 * pending getter with its immediate pipeline-ancestor (the nearest enclosing
 * `PipelineContext.Provider` value — either a Canvas's root registry or
 * another Pipeline's self-registry). Outer pipelines gate on `anyPending`
 * (pure JS read) instead of scanning the DOM for `[data-pictel-pending]`.
 *
 * Subscribers are notified whenever a registrant's pending state flips so
 * downstream consumers (`useSyncExternalStore`, Canvas's attribute mirror,
 * outer Pipeline's re-gate) can react to ready/pending transitions.
 */
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

export const PipelineContext = createContext<Registry | null>(null);

export function usePipelineContext(): Registry {
	const value = useContext(PipelineContext);

	if (value === null) {
		throw new Error("usePipelineContext must be used within a Canvas (or nested Pipeline) — no PipelineContext provider was found in the ancestry");
	}

	return value;
}
