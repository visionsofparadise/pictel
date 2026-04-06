import { rectsIntersect, type StackingOrder } from "./stacking";

export type RasterEffectCallback = (children: ImageData) => void | Promise<void>;
export type CompositeEffectCallback = (self: ImageData, behind: ImageData) => void | Promise<void>;

interface BaseRegistration {
	readonly id: string;
	readonly ref: React.RefObject<HTMLElement | null>;
}

export interface RasterRegistration extends BaseRegistration {
	readonly type: "raster";
	readonly effect: RasterEffectCallback;
}

export interface CompositeRegistration extends BaseRegistration {
	readonly type: "composite";
	readonly effect: CompositeEffectCallback;
}

export type Registration = RasterRegistration | CompositeRegistration;

export interface EffectNode {
	readonly registration: Registration;
	readonly dependsOn: ReadonlyArray<string>;
}

export function buildExecutionOrder(registrations: Array<Registration>, stackingOrder: StackingOrder, rects: ReadonlyMap<HTMLElement, DOMRect>): Array<Array<EffectNode>> {
	if (registrations.length === 0) return [];

	// Sort by stacking order (back-to-front)
	const sorted = [...registrations].sort((ra, rb) => {
		const aElement = ra.ref.current;
		const bElement = rb.ref.current;

		if (!aElement || !bElement) return 0;

		const aIndex = stackingOrder.indexOf.get(aElement) ?? 0;
		const bIndex = stackingOrder.indexOf.get(bElement) ?? 0;

		return aIndex - bIndex;
	});

	// Build nodes with dependency lists
	const nodes: Array<EffectNode> = [];

	for (const reg of sorted) {
		const element = reg.ref.current;

		if (!element) continue;

		const elementIndex = stackingOrder.indexOf.get(element) ?? 0;
		const dependsOn: Array<string> = [];

		for (const other of sorted) {
			if (other.id === reg.id) continue;

			const otherElement = other.ref.current;

			if (!otherElement) continue;

			if (reg.type === "raster") {
				if (element.contains(otherElement)) {
					dependsOn.push(other.id);
				}
			} else {
				// composite: depends on descendants AND overlapping elements behind
				if (element.contains(otherElement)) {
					dependsOn.push(other.id);
				} else {
					const otherIndex = stackingOrder.indexOf.get(otherElement) ?? 0;

					if (otherIndex < elementIndex) {
						const elementRect = rects.get(element);
						const otherRect = rects.get(otherElement);

						if (elementRect && otherRect && rectsIntersect(elementRect, otherRect)) {
							dependsOn.push(other.id);
						}
					}
				}
			}
		}

		nodes.push({ registration: reg, dependsOn });
	}

	// Assign levels: a node goes in the first level where all dependencies are in earlier levels
	const levels: Array<Array<EffectNode>> = [];
	const nodeLevel = new Map<string, number>();
	const nodeById = new Map(nodes.map((nd) => [nd.registration.id, nd]));

	function resolveLevel(nodeId: string): number {
		const existing = nodeLevel.get(nodeId);

		if (existing !== undefined) return existing;

		const node = nodeById.get(nodeId);

		if (!node) return 0;

		let targetLevel = 0;

		for (const depId of node.dependsOn) {
			targetLevel = Math.max(targetLevel, resolveLevel(depId) + 1);
		}

		nodeLevel.set(nodeId, targetLevel);

		return targetLevel;
	}

	for (const node of nodes) {
		const targetLevel = resolveLevel(node.registration.id);

		while (levels.length <= targetLevel) {
			levels.push([]);
		}

		const levelArray = levels[targetLevel];

		if (levelArray) {
			levelArray.push(node);
		}
	}

	return levels;
}
