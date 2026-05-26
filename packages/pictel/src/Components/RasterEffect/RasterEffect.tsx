import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useCanvasContext } from "../../context/canvas";
import { RasterEffectContext, createRegistry, useRasterEffectContext } from "../../context/raster-effect";
import { createRasterEffectError } from "../../utils/errors";
import { normalizeResult, type EffectResult } from "../utils/raster";
import { captureWrapper } from "./utils/capture";
import { getOwnUnloadedImages } from "./utils/scope";

export type RasterEffectCallback = (
	target: ImageData,
	apply?: ImageData,
	map?: ImageData,
) => ImageData | EffectResult | Promise<ImageData | EffectResult>;

interface RasterEffectProps {
	/**
	 * Effect callback. Receives target pixels (children), optional apply pixels
	 * (overlay layer), and optional map pixels (parameter map).
	 */
	effect: RasterEffectCallback;
	/**
	 * Base layer content. Renders inside a wrapper that sizes to children's
	 * intrinsic dimensions while no capture has resolved, and flips to
	 * `display: none` once a snapshot is set — so the sibling output canvas
	 * occupies the same layout slot at the same dimensions children measured at.
	 */
	children: ReactNode;
	/**
	 * Overlay layer for blend modes. Rendered into the Canvas-level offscreen
	 * host via a React portal; captured in parallel with children. Not visible
	 * in the live DOM and does not inherit CSS from the composition position.
	 */
	apply?: ReactNode;
	/**
	 * Parameter map for map-driven effects. Rendered into the Canvas-level
	 * offscreen host via a React portal; captured in parallel with children.
	 * Not visible in the live DOM and does not inherit CSS from the composition
	 * position.
	 */
	map?: ReactNode;
}

interface Snapshot {
	bufW: number;
	bufH: number;
	cssW: number;
	cssH: number;
	overflow: { top: number; right: number; bottom: number; left: number };
	pixels: ImageData;
}

interface Lifecycle {
	gate: () => void;
	invalidate: () => void;
	dispose: () => void;
}

/**
 * Unified raster-effect primitive. Handles all effect and blend cases through
 * prop-carried secondary inputs.
 *
 * DOM contribution per RasterEffect instance:
 *
 * - Inline (in the parent's layout slot): a wrapper `<div>` carrying
 *   `children` — block-level and sized to children's intrinsic box while
 *   no snapshot is set, hidden (`display: none`) once a snapshot is set
 *   (children stay mounted but un-laid-out). When a snapshot is set, a
 *   sibling `<canvas data-pictel-raster>` renders inline carrying the
 *   captured pixels at the snapshot's CSS dimensions.
 * - In the Canvas-level offscreen host (when `apply` or `map` are set):
 *   pictel-owned slot divs receiving the apply/map subtrees via React
 *   portals. These subtrees are isolated from the composition's CSS
 *   cascade.
 *
 * All present input wrappers (children, apply slot, map slot) are captured
 * in parallel via snapdom or the fast path when eligible.
 *
 * @param props
 * @category RasterEffect
 */
export function RasterEffect({ effect, children, apply, map }: RasterEffectProps) {
	const id = useId();
	const childrenSlotRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const canvasContext = useCanvasContext();
	const preW = canvasContext.dimensions.width;
	const preH = canvasContext.dimensions.height;
	const captureDimensions = canvasContext.captureDimensions;
	const reportError = canvasContext.reportError;
	const offscreenHost = canvasContext.offscreenHost;

	const parent = useRasterEffectContext();
	const selfRegistry = useMemo(() => createRegistry(), []);
	const pendingRef = useRef(true);
	const lifecycleRef = useRef<Lifecycle | null>(null);

	const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
	const [applySlot, setApplySlot] = useState<HTMLDivElement | null>(null);
	const [mapSlot, setMapSlot] = useState<HTMLDivElement | null>(null);
	const [slotSize, setSlotSize] = useState({ width: preW, height: preH });

	const hasApply = apply !== undefined;
	const hasMap = map !== undefined;

	const slotStyle = useMemo<CSSProperties>(
		() => ({ width: slotSize.width, height: slotSize.height, pointerEvents: "none" }),
		[slotSize.width, slotSize.height],
	);

	useLayoutEffect(() => {
		pendingRef.current = true;

		const unregister = parent.register(id, () => pendingRef.current);

		parent.notify(id);

		return () => {
			pendingRef.current = false;
			parent.notify(id);
			unregister();
		};
	}, [id, parent]);

	useLayoutEffect(() => {
		const childrenSlot = childrenSlotRef.current;

		if (!childrenSlot) return;

		if (hasApply && applySlot === null) return;

		if (hasMap && mapSlot === null) return;

		const applyEl = applySlot;
		const mapEl = mapSlot;

		const controller = new AbortController();
		const { signal } = controller;

		const unsubscribe = selfRegistry.subscribe(() => {
			if (signal.aborted) return;

			gate();
		});

		let snapshotWasNullForInvalidate = false;

		function invalidate(): void {
			if (signal.aborted) return;

			if (snapshotWasNullForInvalidate) return;

			snapshotWasNullForInvalidate = true;

			setSnapshot(null);
		}

		function gate(): void {
			if (signal.aborted || !childrenSlot) return;

			if (selfRegistry.anyPending()) return;

			const unloaded = [
				...getOwnUnloadedImages(childrenSlot),
				...(applyEl !== null ? getOwnUnloadedImages(applyEl) : []),
				...(mapEl !== null ? getOwnUnloadedImages(mapEl) : []),
			];

			if (unloaded.length > 0) {
				for (const img of unloaded) {
					img.addEventListener("load", () => gate(), { once: true, signal });
					img.addEventListener("error", () => gate(), { once: true, signal });
				}

				return;
			}

			const childrenW = childrenSlot.offsetWidth;
			const childrenH = childrenSlot.offsetHeight;

			if (childrenW === 0 && childrenH === 0) return;

			const wasPending = pendingRef.current;
			pendingRef.current = true;

			if (!wasPending) parent.notify(id);

			setSlotSize({ width: childrenW, height: childrenH });

			void Promise.resolve().then(() => execute(childrenW, childrenH));
		}

		async function execute(contentW: number, contentH: number): Promise<void> {
			try {
				if (signal.aborted || !childrenSlot) return;

				const [targetPixels, applyPixels, mapPixels] = await Promise.all([
					captureWrapper(childrenSlot, captureDimensions),
					applyEl !== null ? captureWrapper(applyEl, captureDimensions) : Promise.resolve(undefined),
					mapEl !== null ? captureWrapper(mapEl, captureDimensions) : Promise.resolve(undefined),
				]);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (signal.aborted) return;

				const rawResult = await effect(targetPixels, applyPixels, mapPixels);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (signal.aborted) return;

				const { pixels, overflow } = normalizeResult(rawResult);

				snapshotWasNullForInvalidate = false;

				setSnapshot({
					bufW: pixels.width,
					bufH: pixels.height,
					cssW: contentW,
					cssH: contentH,
					overflow,
					pixels,
				});
			} catch (error: unknown) {
				if (signal.aborted) return;

				reportError(createRasterEffectError(id, error));
				pendingRef.current = false;
				parent.notify(id);
			}
		}

		const contentObserver = new MutationObserver(invalidate);

		contentObserver.observe(childrenSlot, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ["src"],
		});

		const applyObserver: MutationObserver | null = applyEl !== null
			? new MutationObserver(invalidate)
			: null;

		if (applyObserver !== null && applyEl !== null) {
			applyObserver.observe(applyEl, {
				childList: true,
				subtree: true,
				characterData: true,
				attributes: true,
				attributeFilter: ["src"],
			});
		}

		const mapObserver: MutationObserver | null = mapEl !== null
			? new MutationObserver(invalidate)
			: null;

		if (mapObserver !== null && mapEl !== null) {
			mapObserver.observe(mapEl, {
				childList: true,
				subtree: true,
				characterData: true,
				attributes: true,
				attributeFilter: ["src"],
			});
		}

		const sizeObserver = new ResizeObserver(() => {
			if (signal.aborted) return;

			gate();
		});

		sizeObserver.observe(childrenSlot);

		lifecycleRef.current = {
			gate,
			invalidate,
			dispose: () => {
				controller.abort();
				unsubscribe();

				contentObserver.disconnect();

				if (applyObserver !== null) applyObserver.disconnect();

				if (mapObserver !== null) mapObserver.disconnect();

				sizeObserver.disconnect();
			},
		};

		gate();

		return () => {
			lifecycleRef.current?.dispose();
			lifecycleRef.current = null;
		};

	}, [id, effect, hasApply, hasMap, applySlot, mapSlot, captureDimensions, reportError, parent, selfRegistry]);

	const lastSeenSnapshotRef = useRef<Snapshot | null>(null);

	useLayoutEffect(() => {
		const previous = lastSeenSnapshotRef.current;
		lastSeenSnapshotRef.current = snapshot;

		if (snapshot === null) {
			if (previous !== null) {
				lifecycleRef.current?.gate();
			}

			return;
		}

		const canvasEl = canvasRef.current;

		if (canvasEl) {
			const context = canvasEl.getContext("2d", { willReadFrequently: true });

			if (context) context.putImageData(snapshot.pixels, 0, 0);
		}

		pendingRef.current = false;

		parent.notify(id);
	}, [snapshot, parent, id]);

	return (
		<RasterEffectContext.Provider value={selfRegistry}>
			<div ref={childrenSlotRef} style={{ display: snapshot ? "none" : "block" }}>
				{children}
			</div>
			{snapshot && (
				<canvas
					ref={canvasRef}
					data-pictel-raster
					width={snapshot.bufW}
					height={snapshot.bufH}
					style={{ width: snapshot.cssW, height: snapshot.cssH, display: "block" }}
					data-pictel-overflow-top={snapshot.overflow.top}
					data-pictel-overflow-right={snapshot.overflow.right}
					data-pictel-overflow-bottom={snapshot.overflow.bottom}
					data-pictel-overflow-left={snapshot.overflow.left}
				/>
			)}
			{(hasApply || hasMap) && createPortal(
				<>
					{hasApply && <div ref={setApplySlot} aria-hidden="true" style={slotStyle} />}
					{hasMap && <div ref={setMapSlot} aria-hidden="true" style={slotStyle} />}
				</>,
				offscreenHost,
			)}
			{hasApply && applySlot !== null && createPortal(apply, applySlot)}
			{hasMap && mapSlot !== null && createPortal(map, mapSlot)}
		</RasterEffectContext.Provider>
	);
}

RasterEffect.displayName = "RasterEffect";
