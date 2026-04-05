import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void): () => void {
	window.addEventListener("popstate", onStoreChange);

	return () => {
		window.removeEventListener("popstate", onStoreChange);
	};
}

export function useSearchParam(name: string, defaultValue: string): string {
	return useSyncExternalStore(subscribe, () => {
		const searchParams = new URLSearchParams(window.location.search);

		return searchParams.get(name) ?? defaultValue;
	});
}
