import { DEFAULT_MODE, MODES, type Mode } from "../modes";
import { useSearchParam } from "./useSearchParam";

export function useMode(): Mode {
	const value = useSearchParam("mode", DEFAULT_MODE);

	return (MODES as ReadonlyArray<string>).includes(value) ? (value as Mode) : DEFAULT_MODE;
}
