import { createContext, useContext } from "react";

export interface ReferenceDimensions {
	reference: { width: number; height: number };
}

export interface AspectRatioDimensions {
	aspectRatio: number;
}

export type CanvasDimensions = ReferenceDimensions | AspectRatioDimensions;

export interface CanvasContextValue {
	mode: string;
	dimensions: CanvasDimensions;
	viewportWidth: number;
	viewportHeight: number;
	registerRaster: (ref: React.RefObject<HTMLElement | null>, callback: (pixels: ImageData) => void) => () => void;
	registerComposite: (ref: React.RefObject<HTMLElement | null>, callback: (selfPixels: ImageData, behindPixels: ImageData) => void) => () => void;
}

export const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvasContext(): CanvasContextValue {
	const value = useContext(CanvasContext);

	if (value === null) {
		throw new Error("useCanvasContext must be used within a Canvas component");
	}

	return value;
}
