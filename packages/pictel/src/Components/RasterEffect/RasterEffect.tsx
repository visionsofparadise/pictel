import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useCanvasContext } from "../../context/canvas";
import { RasterEffectContext, createRegistry, useRasterEffectContext } from "../../context/raster-effect";
import { normalizeResult, type EffectResult } from "../utils/raster";
import { createRasterEffectError } from "./Error";
import { captureWrapper } from "./utils/capture";
import { getOwnUnloadedImages } from "./utils/scope";

export type RasterEffectCallback = (target: ImageData, apply?: ImageData, map?: ImageData) => ImageData | EffectResult | Promise<ImageData | EffectResult>;

const SLOT_OBSERVER_OPTIONS: MutationObserverInit = {
	childList: true,
	subtree: true,
	characterData: true,
	attributes: true,
	attributeFilter: ["src"],
};

function originatedInNestedBoundary(record: MutationRecord, ownSlot: Element): boolean {
	let node: Node | null = record.target;

	while (node !== null && node !== ownSlot) {
		if (node instanceof Element && (node.hasAttribute("data-pictel-raster-effect") || node.hasAttribute("data-pictel-raster-source"))) {
			return true;
		}

		node = node.parentNode;
	}

	return false;
}

interface OffscreenSlotProps {
	host: Element;
	style: CSSProperties;
	onMount: (slotEl: HTMLDivElement | null) => void;
	children: ReactNode;
}

function OffscreenSlot({ host, style, onMount, children }: OffscreenSlotProps) {
	const [slotEl, setSlotEl] = useState<HTMLDivElement | null>(null);

	return (
		<>
			{createPortal(
				<div
					ref={(node) => {
						setSlotEl(node);
						onMount(node);
					}}
					aria-hidden="true"
					style={style}
				/>,
				host,
			)}
			{slotEl && createPortal(children, slotEl)}
		</>
	);
}

interface RasterEffectProps {
	effect: RasterEffectCallback;
	children: ReactNode;
	apply?: ReactNode;
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
 * The primitive every effect, blend, and map-driven component is built on. Captures
 * its children as pixels, hands them to an `effect` callback, and renders the result
 * in place of the children.
 *
 * Most consumers reach for a higher-level component (`Blur`, `Multiply`, `DisplacementMap`,
 * etc.) rather than `RasterEffect` directly. Use it when authoring a custom effect: the
 * callback receives `ImageData` for the children and optionally for an overlay (`apply`)
 * or modulation map (`map`), and returns transformed `ImageData`.
 *
 * - `effect` — Required. Called with the captured children pixels and, if supplied, the `apply` and `map` pixels. May return `ImageData` directly, or an `EffectResult` with `pixels` + `overflow` when the effect produces bleed (blur halos, drop shadows). Async returns are supported.
 * - `children` — Required. The base layer the effect operates on. Rendered live in the layout, then replaced by the output canvas once the effect resolves.
 * - `apply` — Optional overlay layer for blend-style effects. Captured in parallel with children and passed to `effect` as the second argument. Renders offscreen — not visible in the live composition.
 * - `map` — Optional parameter map for map-driven effects (displacement fields, depth, segmentation masks). Captured in parallel with children and passed to `effect` as the third argument. Renders offscreen — not visible in the live composition.
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

	const slotStyle = useMemo<CSSProperties>(() => ({ width: slotSize.width, height: slotSize.height, pointerEvents: "none" }), [slotSize.width, slotSize.height]);

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

			invalidate();
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

			const unloaded = [...getOwnUnloadedImages(childrenSlot), ...(applyEl !== null ? getOwnUnloadedImages(applyEl) : []), ...(mapEl !== null ? getOwnUnloadedImages(mapEl) : [])];

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

		const contentObserver = new MutationObserver((records) => {
			for (const record of records) {
				if (!originatedInNestedBoundary(record, childrenSlot)) {
					invalidate();

					return;
				}
			}
		});

		contentObserver.observe(childrenSlot, SLOT_OBSERVER_OPTIONS);

		const applyObserver: MutationObserver | null =
			applyEl !== null
				? new MutationObserver((records) => {
						for (const record of records) {
							if (!originatedInNestedBoundary(record, applyEl)) {
								invalidate();

								return;
							}
						}
					})
				: null;

		if (applyObserver !== null && applyEl !== null) {
			applyObserver.observe(applyEl, SLOT_OBSERVER_OPTIONS);
		}

		const mapObserver: MutationObserver | null =
			mapEl !== null
				? new MutationObserver((records) => {
						for (const record of records) {
							if (!originatedInNestedBoundary(record, mapEl)) {
								invalidate();

								return;
							}
						}
					})
				: null;

		if (mapObserver !== null && mapEl !== null) {
			mapObserver.observe(mapEl, SLOT_OBSERVER_OPTIONS);
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
			<div
				ref={childrenSlotRef}
				data-pictel-raster-effect
				style={{ display: snapshot ? "none" : "block" }}
			>
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
			{hasApply && (
				<OffscreenSlot host={offscreenHost} style={slotStyle} onMount={setApplySlot}>
					{apply}
				</OffscreenSlot>
			)}
			{hasMap && (
				<OffscreenSlot host={offscreenHost} style={slotStyle} onMount={setMapSlot}>
					{map}
				</OffscreenSlot>
			)}
		</RasterEffectContext.Provider>
	);
}

RasterEffect.displayName = "RasterEffect";
