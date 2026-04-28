import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ComponentProps } from "react";
import { CanvasContext, type CanvasContextValue, type CanvasDimensions } from "../context/canvas";
import { ErrorChip } from "../design-system/ErrorChip";
import { LoadingOverlay } from "../design-system/LoadingOverlay";
import { RenderStrip } from "../design-system/RenderStrip";
import { tokens } from "../design-system/tokens";
import { Workspace } from "../design-system/Workspace";
import { useContainerSize } from "../hooks/useContainerSize";
import { useDomSnapshot } from "../hooks/useDomSnapshot";
import { useMode } from "../hooks/useMode";
import type { Mode } from "../modes";
import type { PipelineError } from "../utils/errors";
import { Frame } from "./Frame";

interface CanvasProps extends ComponentProps<"div"> {
	/** Display name shown in the Viewer sidebar. Used as the `aria-label`. */
	name?: string;
	/** Fixed compositing buffer size in pixels. Required. The pipeline rasterizes at exactly these dimensions; visual fit (preview workspace, display container) is a CSS-only concern handled by Frame. */
	dimensions: CanvasDimensions;
	/** Overrides URL-based mode detection. One of `"preview"` (full chrome), `"display"` (inline embed, no chrome), or `"render"` (pure composition for headless export). */
	mode?: Mode;
}

const previewOuterStyle: CSSProperties = {
	position: "relative",
	width: "100%",
	height: "100%",
	backgroundColor: tokens.color.bg,
	overflow: "hidden",
	boxSizing: "border-box",
};

// Display mode: the host page controls the size via CSS on the parent
// container or by relying on the canvas's natural pixel size. The wrapper
// box mirrors how an <img> would lay out — natural width with max-width:100%
// and aspect-ratio computed from `dimensions` so height follows. Buffer dims
// stay fixed (capture is decoupled from container size).
const displayOuterStyle = (width: number, height: number): CSSProperties => ({
	position: "relative",
	width,
	height: "auto",
	maxWidth: "100%",
	aspectRatio: `${String(width)} / ${String(height)}`,
	backgroundColor: "transparent",
	overflow: "hidden",
	boxSizing: "border-box",
});

const renderOuterStyle: CSSProperties = {
	position: "relative",
	width: "100%",
	height: "100%",
	backgroundColor: "transparent",
	overflow: "hidden",
	boxSizing: "border-box",
};

/**
 * Root compositing surface. Contains layers, effects, and blend modes as children.
 * Each Canvas is an independent composition with its own pixel pipeline.
 *
 * - `name` — Display name shown in the Viewer sidebar. Used as the `aria-label`.
 * - `dimensions` — Fixed compositing buffer size in pixels (`{ width, height }`). Required. The pipeline rasterizes at exactly these dimensions; visual fit is a CSS concern handled by Frame.
 * - `mode` — Overrides URL-based mode detection. One of `"preview"`, `"display"`, or `"render"`.
 *
 * @param props
 * @category Layout
 */
export function Canvas({ name, dimensions, mode: modeProp, children, style, ...rest }: CanvasProps) {
	const urlMode = useMode();
	const mode = modeProp ?? urlMode;
	const { ref, width, height } = useContainerSize();
	const domSnapshot = useDomSnapshot(ref);
	const maskDefsRef = useRef<SVGDefsElement>(null);
	const [errors, setErrors] = useState<Array<PipelineError>>([]);

	const reportError = useCallback((error: PipelineError) => {
		setErrors((prev) => [...prev, error]);
	}, []);

	// captureDimensions must be referentially stable across Canvas re-renders.
	// TargetEffect/CompositeEffect's useLayoutEffect lists captureDimensions in
	// deps; without memoization, a fresh object every render would force every
	// descendant pipeline to remount on each Canvas re-render (e.g. when
	// pending state toggles).
	const captureDimensions = useMemo(
		() => ({ width: dimensions.width, height: dimensions.height }),
		[dimensions.width, dimensions.height],
	);
	const [pending, setPending] = useState(true);

	useEffect(() => {
		const container = ref.current;

		if (!container) return;

		function check() {
			setPending(container!.querySelector("[data-pictel-pending]") !== null);
		}

		check();

		const observer = new MutationObserver(() => check());
		observer.observe(container, { attributes: true, subtree: true, attributeFilter: ["data-pictel-pending"] });

		return () => observer.disconnect();
	}, [ref]);

	const contextValue: CanvasContextValue = {
		mode,
		dimensions,
		viewport: { width, height },
		domSnapshot,
		maskDefs: maskDefsRef,
		canvasRoot: ref,
		captureDimensions,
		reportError,
	};

	const svgDefs = (
		<svg
			width="0"
			height="0"
			style={{ position: "absolute", pointerEvents: "none" }}
		>
			<defs ref={maskDefsRef} />
		</svg>
	);

	if (mode === "render") {
		return (
			<CanvasContext.Provider value={contextValue}>
				<div
					ref={ref}
					aria-label={name}
					data-pictel-canvas=""
					style={{ ...renderOuterStyle, ...style }}
					{...rest}
				>
					<Frame>{children}</Frame>
				</div>
				{svgDefs}
			</CanvasContext.Provider>
		);
	}

	const renderStripVisible = mode === "preview" && name !== undefined && name !== "";
	const Wrapper = mode === "preview" ? Workspace : Fragment;
	const baseOuterStyle = mode === "preview" ? previewOuterStyle : displayOuterStyle(dimensions.width, dimensions.height);

	return (
		<CanvasContext.Provider value={contextValue}>
			<div
				ref={ref}
				aria-label={name}
				data-pictel-canvas=""
				style={{ ...baseOuterStyle, ...style }}
				{...rest}
			>
				<Wrapper>
					<Frame>{children}</Frame>
				</Wrapper>
				<ErrorChip errors={errors} />
				<LoadingOverlay pending={pending} />
				{renderStripVisible && (
					<RenderStrip
						canvasName={name}
						width={dimensions.width}
						height={dimensions.height}
						disabled={pending || errors.length > 0}
					/>
				)}
			</div>
			{svgDefs}
		</CanvasContext.Provider>
	);
}
