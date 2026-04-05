import { useEffect, useRef } from "react";
import { useCanvasContext } from "../context/canvas";

export function useComposite(callback: (selfPixels: ImageData, behindPixels: ImageData) => void): React.RefObject<HTMLDivElement | null> {
	const divRef = useRef<HTMLDivElement>(null);

	const { registerComposite } = useCanvasContext();

	useEffect(() => registerComposite(divRef, callback), [registerComposite, callback]);

	return divRef;
}
