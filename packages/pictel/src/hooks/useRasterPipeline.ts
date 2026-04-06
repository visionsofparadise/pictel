import { useCallback, useEffect, useRef, useState } from "react";
import type { CanvasDimensions } from "../context/canvas";
import type { PipelineError } from "../pipeline/errors";
import { executePipeline, type ObserverControl } from "../pipeline/executor";
import { buildExecutionOrder, type Registration } from "../pipeline/graph";
import { createMaskState } from "../pipeline/masking";
import { buildPipelineState, teardownPipelineState } from "../pipeline/state";

interface RasterPipelineResult {
	readonly register: (registration: Registration) => () => void;
	readonly errors: Array<PipelineError>;
}

export function useRasterPipeline(canvasRef: React.RefObject<HTMLDivElement | null>, dimensions: CanvasDimensions): RasterPipelineResult {
	const registrations = useRef(new Map<string, Registration>());
	const captureCache = useRef(new Map<string, ImageData>());
	const maskState = useRef(createMaskState());
	const observerRef = useRef<MutationObserver | null>(null);

	const [errors, setErrors] = useState<Array<PipelineError>>([]);
	const [dirty, setDirty] = useState(0);

	const register = useCallback((registration: Registration): (() => void) => {
		registrations.current.set(registration.id, registration);

		return () => {
			registrations.current.delete(registration.id);
		};
	}, []);

	// Set up MutationObserver on the canvas root. Any DOM mutation in the subtree
	// increments the dirty counter, which triggers the pipeline useEffect.
	useEffect(() => {
		const outerDiv = canvasRef.current;

		if (!outerDiv) return;

		const observer = new MutationObserver(() => {
			setDirty((prev) => prev + 1);
		});

		observer.observe(outerDiv, { childList: true, attributes: true, subtree: true, characterData: true });
		observerRef.current = observer;

		return () => {
			observer.disconnect();
			observerRef.current = null;
		};
	}, [canvasRef]);

	// Pipeline runs when the dirty counter changes. The observer catches all DOM mutations
	// in the canvas subtree (including those caused by registration changes during render),
	// so registration changes trigger pipeline reruns via the observer.
	useEffect(() => {
		let aborted = false;

		const outerDiv = canvasRef.current;

		if (!outerDiv) return;

		outerDiv.setAttribute("data-ready", "false");

		const regs = Array.from(registrations.current.values());
		const captureDimensions = "reference" in dimensions ? { width: dimensions.reference.width, height: dimensions.reference.height } : null;

		const observerControl: ObserverControl = {
			disconnect: () => {
				observerRef.current?.disconnect();
			},
			reconnect: () => {
				if (observerRef.current) {
					observerRef.current.observe(outerDiv, { childList: true, attributes: true, subtree: true, characterData: true });
				}
			},
		};

		observerControl.disconnect();
		const pipelineState = buildPipelineState(outerDiv, maskState.current);
		observerControl.reconnect();

		const { rects, stackingOrder } = pipelineState;
		const levels = buildExecutionOrder(regs, stackingOrder, rects);

		void executePipeline(levels, pipelineState, { canvasRoot: outerDiv, captureDimensions, cache: captureCache.current }, observerControl).then((pipelineErrors) => {
			if (aborted) return;

			setErrors(pipelineErrors);
			outerDiv.setAttribute("data-ready", "true");
		});

		return () => {
			observerControl.disconnect();
			teardownPipelineState(pipelineState);
			observerControl.reconnect();

			aborted = true;
		};
	}, [dirty, canvasRef, dimensions]);

	return { register, errors };
}
