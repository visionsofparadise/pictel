import { Fragment, useCallback, useEffect, useMemo, useState, type CSSProperties, type ComponentProps } from "react";
import { CanvasContext, type CanvasContextValue, type CanvasDimensions } from "../context/canvas";
import { ErrorChip } from "../design-system/ErrorChip";
import { LoadingOverlay } from "../design-system/LoadingOverlay";
import { RenderStrip } from "../design-system/RenderStrip";
import { tokens } from "../design-system/tokens";
import { Workspace } from "../design-system/Workspace";
import { useContainerSize } from "../hooks/useContainerSize";
import { useMode } from "../hooks/useMode";
import { useSearchParam } from "../hooks/useSearchParam";
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

const renderOuterStyle = (width: number, height: number): CSSProperties => ({
	position: "relative",
	width,
	height,
	backgroundColor: "transparent",
	overflow: "hidden",
	boxSizing: "border-box",
});

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
	const [errors, setErrors] = useState<Array<PipelineError>>([]);

	const reportError = useCallback((error: PipelineError) => {
		setErrors((prev) => [...prev, error]);
	}, []);

	const widthParam = useSearchParam("width", "");
	const heightParam = useSearchParam("height", "");
	const overrideWidth = Number(widthParam);
	const overrideHeight = Number(heightParam);
	const hasDimensionOverride =
		mode === "render" &&
		widthParam !== "" &&
		heightParam !== "" &&
		Number.isFinite(overrideWidth) &&
		Number.isFinite(overrideHeight) &&
		overrideWidth > 0 &&
		overrideHeight > 0;
	const effectiveWidth = hasDimensionOverride ? overrideWidth : dimensions.width;
	const effectiveHeight = hasDimensionOverride ? overrideHeight : dimensions.height;

	const captureDimensions = useMemo(
		() => ({ width: effectiveWidth, height: effectiveHeight }),
		[effectiveWidth, effectiveHeight],
	);
	const effectiveDimensions = useMemo<CanvasDimensions>(
		() => ({ width: effectiveWidth, height: effectiveHeight }),
		[effectiveWidth, effectiveHeight],
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
		dimensions: effectiveDimensions,
		viewport: { width, height },
		captureDimensions,
		reportError,
	};

	if (mode === "render") {
		const errorAttribute =
			errors.length > 0
				? JSON.stringify(errors.map((entry) => ({ id: entry.id, message: entry.error.message })))
				: undefined;

		return (
			<CanvasContext.Provider value={contextValue}>
				<div
					ref={ref}
					aria-label={name}
					data-pictel-canvas=""
					data-pictel-error={errorAttribute}
					style={{ ...renderOuterStyle(effectiveWidth, effectiveHeight), ...style }}
					{...rest}
				>
					<Frame>{children}</Frame>
				</div>
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
		</CanvasContext.Provider>
	);
}
