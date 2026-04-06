import type { CaptureCache } from "./capture";
import { captureBehind, captureChildren } from "./capture";
import { createPipelineError, type PipelineError } from "./errors";
import type { EffectNode } from "./graph";
import { applyCutout } from "./masking";
import { getElementsBehind } from "./stacking";
import type { PipelineState } from "./state";

export interface CaptureContext {
	readonly canvasRoot: HTMLElement;
	readonly captureDimensions: { width: number; height: number } | null;
	readonly cache: CaptureCache;
}

export async function executePipeline(
	levels: Array<Array<EffectNode>>,
	state: PipelineState,
	capture: CaptureContext,
): Promise<Array<PipelineError>> {
	const errors: Array<PipelineError> = [];
	const failed = new Set<string>();
	const { stackingOrder, rects, maskState } = state;
	const { canvasRoot, captureDimensions, cache } = capture;

	for (const level of levels) {
		await Promise.all(
			level.map(async (node) => {
				const { registration } = node;

				if (node.dependsOn.some((depId) => failed.has(depId))) {
					failed.add(registration.id);

					return;
				}

				const element = registration.ref.current;

				if (!element) return;

				try {
					if (registration.type === "raster") {
						const children = await captureChildren(element, captureDimensions, cache);
						await registration.effect(children);
					} else {
						const [self, behind] = await Promise.all([captureChildren(element, captureDimensions, cache), captureBehind(element, canvasRoot, captureDimensions, cache, stackingOrder, rects)]);

						await registration.effect(self, behind);

						const sourceRect = element.getBoundingClientRect();
						const behindElements = getElementsBehind(element, stackingOrder, rects);

						for (const behindElement of behindElements) {
							applyCutout(behindElement, sourceRect, maskState);
						}
					}
				} catch (error) {
					errors.push(createPipelineError(registration.id, error));
					failed.add(registration.id);
				}
			}),
		);
	}

	return errors;
}
