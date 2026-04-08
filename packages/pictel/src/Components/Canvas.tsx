import { useCallback, useRef, useState, type CSSProperties, type ComponentProps } from "react";
import { CanvasContext, type CanvasContextValue, type CanvasDimensions } from "../context/canvas";
import { useContainerSize } from "../hooks/useContainerSize";
import { useDomSnapshot } from "../hooks/useDomSnapshot";
import { useMode } from "../hooks/useMode";
import type { PipelineError } from "../pipeline/errors";
import { ErrorOverlay } from "./ErrorOverlay";
import { Frame } from "./Frame";

interface CanvasProps extends ComponentProps<"div"> {
	/** Display name shown in the Viewer sidebar. Used as the `aria-label`. */
	name?: string;
	/** Output dimensions for rasterization. Either fixed `{ width, height }` or reference-based `{ reference: { width, height } }`. */
	dimensions: CanvasDimensions;
}

/**
 * Root compositing surface. Contains layers, effects, and blend modes as children.
 * Each Canvas is an independent composition with its own pixel pipeline.
 *
 * - `name` — Display name shown in the Viewer sidebar. Used as the `aria-label`.
 * - `dimensions` — Output dimensions for rasterization. Either fixed `{ width, height }` or reference-based `{ reference: { width, height } }`.
 *
 * @param props
 * @category Layout
 */
export function Canvas({ name, dimensions, children, style, ...rest }: CanvasProps) {
	const mode = useMode();
	const { ref, width, height } = useContainerSize();
	const domSnapshot = useDomSnapshot(ref);
	const maskDefsRef = useRef<SVGDefsElement>(null);
	const [errors, setErrors] = useState<Array<PipelineError>>([]);

	const reportError = useCallback((error: PipelineError) => {
		setErrors((prev) => [...prev, error]);
	}, []);

	const captureDimensions = "reference" in dimensions ? { width: dimensions.reference.width, height: dimensions.reference.height } : null;

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
		dimensions,
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
