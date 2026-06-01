import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useCanvasContext } from "../../context/canvas";
import { RasterEffectContext, createRegistry, useRasterEffectContext } from "../../context/raster-effect";
import { getEffectCache } from "../../effect-cache/effect-cache";
import { hashImageData } from "../../effect-cache/hash-pixels";
import { normalizeResult, type EffectResult } from "../utils/raster";
import { createRasterEffectError } from "./Error";
import { captureWrapper } from "./utils/capture";
import { getOwnImages } from "./utils/scope";

// Tracks which (effect, version) pairs we've already warned about for the
// non-zero-overflow cache-skip. Per the v1 design doc carve-out, the cache
// entry shape stores output pixels only; effects that bleed (Blur, DropShadow,
// Bloom, Outline, Hatch/LIC with map-driven kernels) skip the cache write and
// log once.
const overflowSkipLogged = new WeakMap<RasterEffectCallback, Set<string>>();

function logOverflowSkipOnce(effect: RasterEffectCallback, version: string): void {
	let versions = overflowSkipLogged.get(effect);

	if (versions === undefined) {
		versions = new Set();
		overflowSkipLogged.set(effect, versions);
	}

	if (versions.has(version)) return;

	versions.add(version);
	console.warn(`pictel effect cache: skipping cache write for effect with non-zero overflow (version=${version})`);
}

type ImageLoadState = "loaded" | "loading";

/**
 * Per-slot cache: every directly-owned `<img>` in the slot mapped to its
 * current load state. `null` means the cache is invalid and must be rebuilt
 * on the next read (lazy population). Populated by `readUnloaded` on first
 * use; maintained incrementally by the slot's MutationObserver.
 */
type ImageCache = Map<HTMLImageElement, ImageLoadState> | null;

function readUnloaded(slot: Element, cacheRef: { current: ImageCache }): Array<HTMLImageElement> {
	let cache = cacheRef.current;

	if (cache === null) {
		cache = new Map();

		for (const img of getOwnImages(slot)) {
			cache.set(img, img.complete ? "loaded" : "loading");
		}

		cacheRef.current = cache;
	}

	const unloaded: Array<HTMLImageElement> = [];

	for (const [img, state] of cache) {
		if (state === "loading") unloaded.push(img);
	}

	return unloaded;
}

/**
 * Walk a MutationRecord's added/removed node lists for any `<img>` (the node
 * itself or any descendant). A childList mutation that touches an `<img>` in
 * either list invalidates the slot's image cache.
 */
function recordTouchesImage(record: MutationRecord): boolean {
	if (record.type !== "childList") return false;

	for (const node of record.addedNodes) {
		if (node instanceof HTMLImageElement) return true;

		if (node instanceof Element && node.querySelector("img") !== null) return true;
	}

	for (const node of record.removedNodes) {
		if (node instanceof HTMLImageElement) return true;

		if (node instanceof Element && node.querySelector("img") !== null) return true;
	}

	return false;
}

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
	version?: string;
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
 * - `version` — Optional cache key. When set, the captured input pixels are hashed and combined with this string to look up a previously-computed output in the IndexedDB-backed effect cache; on hit, the cached pixels are used and `effect` is not called. On miss, `effect` runs and its output is written back. When undefined, the cache is bypassed entirely — no hashing, no lookup, no write. Standard effects in `@pictel/effects` and `@pictel/ml` accept a `version?: string` prop and compose it with their internal version; pass `version` at any layer to force invalidation downward. The cache trusts the version string: when authoring a custom effect, bump its internal version whenever `apply` changes in a way that affects output pixels. Effects that return non-zero `EffectResult.overflow` (`Blur`, `DropShadow`, `Bloom`, `Outline`, certain `Hatch` / `LIC` configurations) skip the cache write in v1 — the entry shape stores output pixels only — with a one-time `console.warn` per `(effect, version)` pair. See [design-effect-output-cache](https://github.com/visionsofparadise/planner/blob/main/projects/code/pictel/design-effect-output-cache.md).
 *
 * @param props
 * @category RasterEffect
 */
export function RasterEffect({ effect, children, apply, map, version }: RasterEffectProps) {
	const id = useId();
	const childrenSlotRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const canvasContext = useCanvasContext();
	const preW = canvasContext.dimensions.width;
	const preH = canvasContext.dimensions.height;
	const captureDimensions = canvasContext.captureDimensions;
	const reportError = canvasContext.reportError;
	const offscreenHost = canvasContext.offscreenHost;
	const imageDataPool = canvasContext.imageDataPool;

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
		const cache = getEffectCache();

		const unsubscribe = selfRegistry.subscribe(() => {
			if (signal.aborted) return;

			invalidate();
			gate();
		});

		const contentImageCache: { current: ImageCache } = { current: null };
		const applyImageCache: { current: ImageCache } = { current: null };
		const mapImageCache: { current: ImageCache } = { current: null };

		function markImageLoaded(img: HTMLImageElement): void {
			for (const cacheRef of [contentImageCache, applyImageCache, mapImageCache]) {
				const cache = cacheRef.current;

				if (cache?.has(img) === true) cache.set(img, "loaded");
			}
		}

		/**
		 * Apply the slot's batch of MutationRecords to its image cache.
		 * - childList records that add/remove `<img>` invalidate (null) the
		 *   cache; the next `readUnloaded` rebuilds it.
		 * - attribute records on an `<img>` already in the cache update its
		 *   load state (src changes flip `complete` to false).
		 * - Other records leave the cache untouched.
		 *
		 * Nested-boundary records are filtered upstream by the observer
		 * callback before reaching here.
		 */
		function applyRecordsToCache(records: ReadonlyArray<MutationRecord>, cacheRef: { current: ImageCache }): void {
			const cache = cacheRef.current;

			for (const record of records) {
				if (recordTouchesImage(record)) {
					cacheRef.current = null;

					return;
				}

				if (cache !== null && record.type === "attributes" && record.target instanceof HTMLImageElement && cache.has(record.target)) {
					cache.set(record.target, record.target.complete ? "loaded" : "loading");
				}
			}
		}

		let snapshotWasNullForInvalidate = false;
		let executeInFlight = false;
		let rerunQueued = false;
		// True from the moment an execute either starts (in-flight) or
		// completes successfully (set a snapshot). Stays true until
		// `invalidate()` clears it. Used to suppress spurious `gate()` calls
		// that fire after the snapshot is already current — most importantly
		// the ResizeObserver's initial-entry delivery, which lands after the
		// first execute completes and would otherwise re-run the effect a
		// second time on a clean first mount.
		let snapshotIsCurrent = false;

		function invalidate(): void {
			if (signal.aborted) return;

			// Real invalidation — the in-flight or completed result is now
			// stale. If something is in flight, queue a rerun for when it
			// finishes; either way, the current snapshot (if any) is no
			// longer authoritative.
			if (executeInFlight) rerunQueued = true;

			snapshotIsCurrent = false;

			if (snapshotWasNullForInvalidate) return;

			snapshotWasNullForInvalidate = true;

			setSnapshot(null);
		}

		const imagesWithListeners = new WeakSet<HTMLImageElement>();

		function gate(): void {
			if (signal.aborted || !childrenSlot) return;

			if (selfRegistry.anyPending()) return;

			const unloaded = [...readUnloaded(childrenSlot, contentImageCache), ...(applyEl !== null ? readUnloaded(applyEl, applyImageCache) : []), ...(mapEl !== null ? readUnloaded(mapEl, mapImageCache) : [])];

			if (unloaded.length > 0) {
				for (const img of unloaded) {
					if (imagesWithListeners.has(img)) continue;

					imagesWithListeners.add(img);
					img.addEventListener(
						"load",
						() => {
							markImageLoaded(img);
							gate();
						},
						{ once: true, signal },
					);
					img.addEventListener(
						"error",
						() => {
							markImageLoaded(img);
							gate();
						},
						{ once: true, signal },
					);
				}

				return;
			}

			const childrenW = childrenSlot.offsetWidth;
			const childrenH = childrenSlot.offsetHeight;

			if (childrenW === 0 && childrenH === 0) return;

			// Spurious gate during an in-flight execute (ResizeObserver initial
			// entry, layout-driven resize while we're capturing, etc.) — no
			// real invalidation, no rerun. invalidate() is the only path that
			// queues a rerun for after the in-flight execute.
			if (executeInFlight) return;

			// The snapshot already reflects the latest inputs — this gate
			// call has no real invalidation behind it (most often the
			// ResizeObserver initial-entry delivery that lands after the
			// first execute already completed). Skip it; another execute
			// with the same inputs would just produce the same pixels.
			if (snapshotIsCurrent) return;

			const wasPending = pendingRef.current;
			pendingRef.current = true;

			if (!wasPending) parent.notify(id);

			setSlotSize({ width: childrenW, height: childrenH });

			executeInFlight = true;
			void Promise.resolve().then(async () => {
				try {
					await execute(childrenW, childrenH);
				} finally {
					executeInFlight = false;

					if (rerunQueued && !signal.aborted) {
						rerunQueued = false;
						gate();
					}
				}
			});
		}

		async function execute(contentW: number, contentH: number): Promise<void> {
			let targetPixels: ImageData | undefined;
			let applyPixels: ImageData | undefined;
			let mapPixels: ImageData | undefined;

			try {
				if (signal.aborted || !childrenSlot) return;

				[targetPixels, applyPixels, mapPixels] = await Promise.all([
					captureWrapper(childrenSlot, captureDimensions, imageDataPool),
					applyEl !== null ? captureWrapper(applyEl, captureDimensions, imageDataPool) : Promise.resolve(undefined),
					mapEl !== null ? captureWrapper(mapEl, captureDimensions, imageDataPool) : Promise.resolve(undefined),
				]);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (signal.aborted) return;

				let pixels: ImageData;
				let overflow: { top: number; right: number; bottom: number; left: number };
				let pixelsFromCache = false;

				if (version !== undefined) {
					const cacheKey = {
						targetHash: hashImageData(targetPixels),
						applyHash: applyPixels === undefined ? null : hashImageData(applyPixels),
						mapHash: mapPixels === undefined ? null : hashImageData(mapPixels),
						version,
					};

					const cached = await cache.get(cacheKey);

					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (signal.aborted) return;

					if (cached !== null) {
						pixels = cached;
						overflow = { top: 0, right: 0, bottom: 0, left: 0 };
						pixelsFromCache = true;
					} else {
						const rawResult = await effect(targetPixels, applyPixels, mapPixels);

						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						if (signal.aborted) return;

						const normalized = normalizeResult(rawResult);
						pixels = normalized.pixels;
						overflow = normalized.overflow;

						const hasOverflow = overflow.top !== 0 || overflow.right !== 0 || overflow.bottom !== 0 || overflow.left !== 0;

						if (hasOverflow) {
							logOverflowSkipOnce(effect, version);
						} else {
							void cache.put(cacheKey, pixels);
						}
					}
				} else {
					const rawResult = await effect(targetPixels, applyPixels, mapPixels);

					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (signal.aborted) return;

					const normalized = normalizeResult(rawResult);
					pixels = normalized.pixels;
					overflow = normalized.overflow;
				}

				// Release captured framework-owned buffers back to the pool. Skip
				// any buffer the effect returned as its result — that one is now
				// the snapshot's `pixels` and remains live. User-allocated
				// ImageData returned from effect callbacks is user-owned by
				// contract and is not released by the framework. On cache HIT,
				// `pixels` was freshly-allocated by the cache (its buffer was
				// sliced) so it is not pool-owned — all three captured buffers
				// are released unconditionally.
				if (pixelsFromCache || targetPixels !== pixels) imageDataPool.release(targetPixels);

				if (applyPixels !== undefined && (pixelsFromCache || applyPixels !== pixels)) imageDataPool.release(applyPixels);

				if (mapPixels !== undefined && (pixelsFromCache || mapPixels !== pixels)) imageDataPool.release(mapPixels);

				snapshotWasNullForInvalidate = false;
				snapshotIsCurrent = true;

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

				// Release any captured buffers we acquired before the error.
				if (targetPixels !== undefined) imageDataPool.release(targetPixels);

				if (applyPixels !== undefined) imageDataPool.release(applyPixels);

				if (mapPixels !== undefined) imageDataPool.release(mapPixels);

				reportError(createRasterEffectError(id, error));
				pendingRef.current = false;
				parent.notify(id);
			}
		}

		const contentObserver = new MutationObserver((records) => {
			const ownRecords: Array<MutationRecord> = [];
			let hasOwnRecord = false;

			for (const record of records) {
				if (!originatedInNestedBoundary(record, childrenSlot)) {
					ownRecords.push(record);
					hasOwnRecord = true;
				}
			}

			if (!hasOwnRecord) return;

			applyRecordsToCache(ownRecords, contentImageCache);
			invalidate();
		});

		contentObserver.observe(childrenSlot, SLOT_OBSERVER_OPTIONS);

		const applyObserver: MutationObserver | null =
			applyEl !== null
				? new MutationObserver((records) => {
						const ownRecords: Array<MutationRecord> = [];
						let hasOwnRecord = false;

						for (const record of records) {
							if (!originatedInNestedBoundary(record, applyEl)) {
								ownRecords.push(record);
								hasOwnRecord = true;
							}
						}

						if (!hasOwnRecord) return;

						applyRecordsToCache(ownRecords, applyImageCache);
						invalidate();
					})
				: null;

		if (applyObserver !== null && applyEl !== null) {
			applyObserver.observe(applyEl, SLOT_OBSERVER_OPTIONS);
		}

		const mapObserver: MutationObserver | null =
			mapEl !== null
				? new MutationObserver((records) => {
						const ownRecords: Array<MutationRecord> = [];
						let hasOwnRecord = false;

						for (const record of records) {
							if (!originatedInNestedBoundary(record, mapEl)) {
								ownRecords.push(record);
								hasOwnRecord = true;
							}
						}

						if (!hasOwnRecord) return;

						applyRecordsToCache(ownRecords, mapImageCache);
						invalidate();
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
	}, [id, effect, version, hasApply, hasMap, applySlot, mapSlot, captureDimensions, reportError, parent, selfRegistry, imageDataPool]);

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
