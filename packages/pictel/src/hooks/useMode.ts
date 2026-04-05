import { useSearchParam } from "./useSearchParam";

export function useMode(): string {
	return useSearchParam("mode", "preview");
}
