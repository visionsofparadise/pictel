import { useMemo } from "react";
import { useSearchParam } from "./useSearchParam";

/**
 * Reads the `?props=` URL query parameter, JSON-parses it, and returns the
 * resulting object. This is how a composition receives the props the CLI
 * export pipeline supplies — each export entry's `props` are JSON-encoded into
 * the `props=` query param and delivered to the composition through this hook.
 *
 * Malformed JSON is non-fatal: the error is logged via `console.error` and an
 * empty object is returned, so a bad query param degrades gracefully rather
 * than crashing the composition.
 *
 * @returns The parsed props object, cast to `T`. An empty object when the
 *   param is absent or its JSON is malformed.
 * @category Hooks
 */
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
