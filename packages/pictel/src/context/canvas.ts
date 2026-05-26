import { createContext, useContext } from "react";
import type { RasterEffectError } from "../Components/RasterEffect/Error";

export interface CanvasDimensions {
	width: number;
	height: number;
}

export interface Viewport {
	width: number;
	height: number;
}

export interface CanvasContextValue {
	mode: string;
	dimensions: CanvasDimensions;
	viewport: Viewport;
	captureDimensions: CanvasDimensions;
	reportError: (error: RasterEffectError) => void;
	offscreenHost: HTMLDivElement;
}

export const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvasContext(): CanvasContextValue {
	const value = useContext(CanvasContext);

	if (value === null) {
		throw new Error("useCanvasContext must be used within a Canvas component");
	}

	return value;
}
