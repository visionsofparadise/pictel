import { useSearchParam } from "./useSearchParam";

export const MODES = ["preview", "display", "render"] as const;

export type Mode = (typeof MODES)[number];

export const DEFAULT_MODE: Mode = "preview";

export function useMode(): Mode {
	const value = useSearchParam("mode", DEFAULT_MODE);

	return (MODES as ReadonlyArray<string>).includes(value) ? (value as Mode) : DEFAULT_MODE;
}
