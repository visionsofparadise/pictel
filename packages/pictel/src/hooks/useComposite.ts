import { useId, useLayoutEffect, useRef } from "react";
import { useCanvasContext } from "../context/canvas";
import type { CompositeEffectCallback } from "../pipeline/graph";

export function useComposite(effect: CompositeEffectCallback): React.RefObject<HTMLDivElement | null> {
	const divRef = useRef<HTMLDivElement>(null);
	const id = useId();

	const { rasterPipeline: { register } } = useCanvasContext();

	useLayoutEffect(() => register({ id, ref: divRef, type: "composite" as const, effect }), [register, id, effect]);

	return divRef;
}
