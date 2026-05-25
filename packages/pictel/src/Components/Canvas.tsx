import { Fragment, useCallback, useMemo, useState, useSyncExternalStore, type CSSProperties, type ComponentProps, type ReactNode } from "react";
import { CanvasContext, type CanvasContextValue, type CanvasDimensions } from "../context/canvas";
import { PipelineContext, createRegistry } from "../context/pipeline";
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

function getPendingServerSnapshot(): boolean {
	return false;
}

const offscreenHostStyle: CSSProperties = {
	position: "fixed",
	left: -10000,
	top: 0,
	pointerEvents: "none",
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
	const registry = useMemo(() => createRegistry(), []);
	const pending = useSyncExternalStore(registry.subscribe, registry.anyPending, getPendingServerSnapshot);

	const [offscreenHost, setOffscreenHost] = useState<HTMLDivElement | null>(null);

	const contextValue: CanvasContextValue | null = offscreenHost === null
		? null
		: {
			mode,
			dimensions: effectiveDimensions,
			viewport: { width, height },
			captureDimensions,
			reportError,
			offscreenHost,
		};

	function provideCanvasContext(content: ReactNode): ReactNode {
		if (contextValue === null) return null;

		return <CanvasContext.Provider value={contextValue}>{content}</CanvasContext.Provider>;
	}

	if (mode === "render") {
		const errorAttribute =
			errors.length > 0
				? JSON.stringify(errors.map((entry) => ({ id: entry.id, message: entry.error.message })))
				: undefined;

		return (
			<PipelineContext.Provider value={registry}>
				<div
					ref={ref}
					aria-label={name}
					data-pictel-canvas=""
					data-pictel-pending={pending ? "" : undefined}
					data-pictel-error={errorAttribute}
					style={{ ...renderOuterStyle(effectiveWidth, effectiveHeight), ...style }}
					{...rest}
				>
					<div ref={setOffscreenHost} aria-hidden="true" style={offscreenHostStyle} />
					{provideCanvasContext(<Frame>{children}</Frame>)}
				</div>
			</PipelineContext.Provider>
		);
	}

	const renderStripVisible = mode === "preview" && name !== undefined && name !== "";
	const Wrapper = mode === "preview" ? Workspace : Fragment;
	const baseOuterStyle = mode === "preview" ? previewOuterStyle : displayOuterStyle(dimensions.width, dimensions.height);

	return (
		<PipelineContext.Provider value={registry}>
			<div
				ref={ref}
				aria-label={name}
				data-pictel-canvas=""
				data-pictel-pending={pending ? "" : undefined}
				style={{ ...baseOuterStyle, ...style }}
				{...rest}
			>
				<div ref={setOffscreenHost} aria-hidden="true" style={offscreenHostStyle} />
				{provideCanvasContext(
					<>
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
					</>,
				)}
			</div>
		</PipelineContext.Provider>
	);
}
