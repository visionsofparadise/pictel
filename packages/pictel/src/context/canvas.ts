import { createContext, useContext } from "react";
import type { PipelineError } from "../utils/errors";
import type { StackingOrder } from "../utils/stacking";

/**
 * Fixed pixel dimensions for the canvas's compositing buffer. The capture
 * pipeline rasterizes to exactly these dimensions; visual scale (preview
 * fit-to-viewport, display fit-to-container) is applied by Frame as a CSS
 * transform and does not affect buffer size.
 */
export interface CanvasDimensions {
	width: number;
	height: number;
}

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
	captureDimensions: CanvasDimensions;
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
