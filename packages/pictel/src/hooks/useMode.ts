import { DEFAULT_MODE, MODES, type Mode } from "../Mode";
import { useSearchParam } from "./useSearchParam";

// FIX: Just move the Mode definition and consts here

export function useMode(): Mode {
	const value = useSearchParam("mode", DEFAULT_MODE);

	return (MODES as ReadonlyArray<string>).includes(value) ? (value as Mode) : DEFAULT_MODE;
}
