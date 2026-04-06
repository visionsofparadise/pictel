import { createContext, useContext } from "react";
import type { PipelineError } from "../pipeline/errors";
import type { Registration } from "../pipeline/graph";

export interface ReferenceDimensions {
	reference: { width: number; height: number };
}

export interface AspectRatioDimensions {
	aspectRatio: number;
}

export type CanvasDimensions = ReferenceDimensions | AspectRatioDimensions;

export interface RasterPipelineContext {
	register: (registration: Registration) => () => void;
	errors: Array<PipelineError>;
}

export interface Viewport {
	width: number;
	height: number;
}

export interface CanvasContextValue {
	mode: string;
	dimensions: CanvasDimensions;
	viewport: Viewport;
	rasterPipeline: RasterPipelineContext;
}

export const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvasContext(): CanvasContextValue {
	const value = useContext(CanvasContext);

	if (value === null) {
		throw new Error("useCanvasContext must be used within a Canvas component");
	}

	return value;
}
