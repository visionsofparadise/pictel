import { createContext, useContext } from "react";
import type { RasterEffectError } from "../utils/errors";

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
	/** Canvas-level offscreen host. RasterEffects append apply/map slot divs here and createPortal into them. Non-null whenever the CanvasContext.Provider is mounted: Canvas conditionally provides the context only after the host ref is captured. */
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
