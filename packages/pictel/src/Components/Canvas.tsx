import { useCallback, useEffect, useRef, useState, type CSSProperties, type ComponentProps } from "react";
import { CanvasContext, type CanvasContextValue, type CanvasDimensions } from "../context/canvas";
import { useContainerSize } from "../hooks/useContainerSize";
import { useDomSnapshot } from "../hooks/useDomSnapshot";
import { useMode } from "../hooks/useMode";
import type { PipelineError } from "../utils/errors";
import { ErrorOverlay } from "./ErrorOverlay";
import { Frame } from "./Frame";

function LoadingIndicator() {
	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				backgroundColor: "rgba(0, 0, 0, 0.3)",
				zIndex: 9999,
				pointerEvents: "none",
				display: "flex",
				alignItems: "flex-end",
				justifyContent: "flex-end",
				padding: 8,
			}}
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
			>
				<path d="M12 2a10 10 0 0 1 10 10">
					<animateTransform
						attributeName="transform"
						type="rotate"
						from="0 12 12"
						to="360 12 12"
						dur="0.8s"
						repeatCount="indefinite"
					/>
				</path>
			</svg>
		</div>
	);
}

interface CanvasProps extends ComponentProps<"div"> {
	/** Display name shown in the Viewer sidebar. Used as the `aria-label`. */
	name?: string;
	/** Output dimensions for rasterization. Either fixed `{ width, height }` or reference-based `{ reference: { width, height } }`. */
	dimensions?: CanvasDimensions;
	/** Overrides URL-based mode detection. Use `"display"` for inline embedding without chrome or fixed dimensions. */
	mode?: string;
}

/**
 * Root compositing surface. Contains layers, effects, and blend modes as children.
 * Each Canvas is an independent composition with its own pixel pipeline.
 *
 * - `name` — Display name shown in the Viewer sidebar. Used as the `aria-label`.
 * - `dimensions` — Output dimensions for rasterization. Either fixed `{ width, height }` or reference-based `{ reference: { width, height } }`.
 * - `mode` — Overrides URL-based mode detection. Use `"display"` for inline embedding without chrome or fixed dimensions.
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

	const captureDimensions = dimensions && "reference" in dimensions ? { width: dimensions.reference.width, height: dimensions.reference.height } : null;
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

	useEffect(() => {
		const container = ref.current;

		if (!container) return;

		if (width === 0 || height === 0) return;

		const pipelines = container.querySelectorAll("[data-pictel-pipeline]");

		for (const pipeline of pipelines) {
			pipeline.dispatchEvent(new CustomEvent("pictel:resize"));
		}
	}, [width, height, ref]);

	const outerStyle: CSSProperties = {
		position: "relative",
		width: "100%",
		height: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		boxSizing: "border-box",
		...style,
	};

	const contextValue: CanvasContextValue = {
		mode,
		dimensions: dimensions ?? null,
		viewport: { width, height },
		domSnapshot,
		maskDefs: maskDefsRef,
		canvasRoot: ref,
		captureDimensions,
		reportError,
	};

	return (
		<CanvasContext.Provider value={contextValue}>
			<div
				ref={ref}
				aria-label={name}
				style={outerStyle}
				{...rest}
			>
				<Frame>{children}</Frame>
				{pending && <LoadingIndicator />}
				<ErrorOverlay errors={errors} />
			</div>
			<svg
				width="0"
				height="0"
				style={{ position: "absolute", pointerEvents: "none" }}
			>
				<defs ref={maskDefsRef} />
			</svg>
		</CanvasContext.Provider>
	);
}
