import { useLayoutEffect, useRef } from "react";
import type { CanvasSnapshot } from "../context/canvas";
import { observeSubtree } from "../utils/observe";
import { buildStackingOrder } from "../utils/stacking";

export function useDomSnapshot(canvasRef: React.RefObject<HTMLDivElement | null>): React.RefObject<CanvasSnapshot | null> {
	const snapshotRef = useRef<CanvasSnapshot | null>(null);

	useLayoutEffect(() => {
		const canvasRoot = canvasRef.current;

		if (!canvasRoot) return;

		function rebuildSnapshot(): void {
			const canvasRoot = canvasRef.current;

			if (!canvasRoot) return;

			const rects = new Map<HTMLElement, DOMRect>();
			const elements: Array<HTMLElement> = [];
			const descendants = canvasRoot.querySelectorAll("*");

			for (const descendant of descendants) {
				const element = descendant as HTMLElement;
				const rect = element.getBoundingClientRect();

				rects.set(element, rect);
				elements.push(element);
			}

			const canvasRect = canvasRoot.getBoundingClientRect();
			const stackingOrder = buildStackingOrder(elements);

			snapshotRef.current = { stackingOrder, rects, canvasRect };
		}

		const observer = new MutationObserver(() => {
			rebuildSnapshot();
		});

		rebuildSnapshot();

		observeSubtree(observer, canvasRoot);

		return () => {
			observer.disconnect();
		};
	}, [canvasRef]);

	return snapshotRef;
}
