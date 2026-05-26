import { useMemo } from "react";
import { useSearchParam } from "./useSearchParam";

export function useProps<T = Record<string, unknown>>(): T {
	const raw = useSearchParam("props", "{}");

	return useMemo<T>(() => {
		try {
			return JSON.parse(raw) as T;
		} catch (error) {
			console.error("useProps: failed to parse the `props` query parameter as JSON", error);

			return {} as T;
		}
	}, [raw]);
}
