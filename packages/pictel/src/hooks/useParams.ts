import { useMemo } from "react";
import { useSearchParam } from "./useSearchParam";

export function useParams<T = Record<string, unknown>>(): T {
	const raw = useSearchParam("params", "{}");

	return useMemo<T>(() => {
		try {
			return JSON.parse(raw) as T;
		} catch (error) {
			console.error("useParams: failed to parse the `params` query parameter as JSON", error);

			return {} as T;
		}
	}, [raw]);
}
