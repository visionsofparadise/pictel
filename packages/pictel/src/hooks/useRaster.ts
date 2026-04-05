import { useEffect, useRef } from "react";
import { useCanvasContext } from "../context/canvas";

export function useRaster(callback: (childPixels: ImageData) => void): React.RefObject<HTMLDivElement | null> {
	const divRef = useRef<HTMLDivElement>(null);

	const { registerRaster } = useCanvasContext();

	useEffect(() => registerRaster(divRef, callback), [registerRaster, callback]);

	return divRef;
}
