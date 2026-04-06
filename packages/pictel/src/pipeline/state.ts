import { type MaskState, setupMasks, teardownMasks } from "./masking";
import { buildStackingOrder, type StackingOrder } from "./stacking";

export interface PipelineState {
	readonly rects: ReadonlyMap<HTMLElement, DOMRect>;
	readonly stackingOrder: StackingOrder;
	readonly maskState: MaskState;
}

export function buildPipelineState(canvasRoot: HTMLElement, maskState: MaskState): PipelineState {
	const { rects, elements } = setupMasks(canvasRoot, maskState);

	const stackingOrder = buildStackingOrder(elements);

	return { rects, stackingOrder, maskState };
}

export function teardownPipelineState(state: PipelineState): void {
	teardownMasks(state.maskState);
}
