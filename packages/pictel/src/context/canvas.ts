import { createContext, useContext } from "react";
import type { PipelineError } from "../pipeline/errors";
import type { StackingOrder } from "../pipeline/stacking";

export interface ReferenceDimensions {
	reference: { width: number; height: number };
}

export interface AspectRatioDimensions {
	aspectRatio: number;
}

export type CanvasDimensions = ReferenceDimensions | AspectRatioDimensions;

export interface CanvasSnapshot {
	readonly stackingOrder: StackingOrder;
	readonly rects: ReadonlyMap<HTMLElement, DOMRect>;
	readonly canvasRect: DOMRect;
}

export interface Viewport {
	width: number;
	height: number;
}

export interface CanvasContextValue {
	mode: string;
	dimensions: CanvasDimensions;
	viewport: Viewport;
	domSnapshot: React.RefObject<CanvasSnapshot | null>;
	maskDefs: React.RefObject<SVGDefsElement | null>;
	canvasRoot: React.RefObject<HTMLDivElement | null>;
	captureDimensions: { width: number; height: number } | null;
	reportError: (error: PipelineError) => void;
}

export const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvasContext(): CanvasContextValue {
	const value = useContext(CanvasContext);

	if (value === null) {
		throw new Error("useCanvasContext must be used within a Canvas component");
	}

	return value;
}
