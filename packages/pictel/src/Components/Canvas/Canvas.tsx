import { Fragment, useCallback, useMemo, useState, useSyncExternalStore, type CSSProperties, type ComponentProps, type ReactNode } from "react";
import { CanvasContext, type CanvasContextValue, type CanvasDimensions } from "../../context/canvas";
import { RasterEffectContext, createRegistry } from "../../context/raster-effect";
import { ErrorChip } from "./ErrorChip";
import { LoadingOverlay } from "./LoadingOverlay";
import { RenderStrip } from "./RenderStrip";
import { tokens } from "../../tokens";
import { Workspace } from "./Workspace";
import { useContainerSize } from "../../hooks/useContainerSize";
import { useMode } from "../../hooks/useMode";
import { useSearchParam } from "../../hooks/useSearchParam";
import type { Mode } from "../../hooks/useMode";
import { Frame } from "../Frame";
import type { RasterEffectError } from "../RasterEffect/Error";

interface CanvasProps extends ComponentProps<"div"> {
	name?: string;
	dimensions: CanvasDimensions;
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
 * The root of a pictel composition. Layers, effects, blend modes, and raster sources
 * go inside as children, and the Canvas renders the composed image.
 *
 * Every pictel composition needs a Canvas — effects and raster sources require one
 * as an ancestor. Use a single Canvas for a one-off image, or wrap multiple Canvases
 * in a `Viewer` to switch between them during development.
 *
 * - `name` — Display name shown in the `Viewer` sidebar and used as the `aria-label`. Optional; required if you want this Canvas to be selectable in a `Viewer`.
 * - `dimensions` — Authored pixel size as `{ width, height }`. Required. The composition is rasterized at exactly these dimensions; preview and display layouts scale visually around this fixed buffer.
 * - `mode` — Overrides automatic mode detection. `"preview"` shows the full development chrome (workspace, error chip, render button), `"display"` is a bare embed for production use, `"render"` strips all chrome for headless export. Defaults to the `?mode=` URL parameter, or `"preview"` if unset.
 *
 * @param props
 * @category Layout
 */
export function Canvas({ name, dimensions, mode: modeProp, children, style, ...rest }: CanvasProps) {
	const urlMode = useMode();
	const mode = modeProp ?? urlMode;
	const { ref, width, height } = useContainerSize();
	const [errors, setErrors] = useState<Array<RasterEffectError>>([]);

	const reportError = useCallback((error: RasterEffectError) => {
		setErrors((prev) => [...prev, error]);
	}, []);

	const widthParam = useSearchParam("canvasWidth", "");
	const heightParam = useSearchParam("canvasHeight", "");
	const overrideWidth = Number(widthParam);
	const overrideHeight = Number(heightParam);
	const hasDimensionOverride =
		mode === "render" && widthParam !== "" && heightParam !== "" && Number.isFinite(overrideWidth) && Number.isFinite(overrideHeight) && overrideWidth > 0 && overrideHeight > 0;
	const effectiveWidth = hasDimensionOverride ? overrideWidth : dimensions.width;
	const effectiveHeight = hasDimensionOverride ? overrideHeight : dimensions.height;

	const captureDimensions = useMemo(() => ({ width: effectiveWidth, height: effectiveHeight }), [effectiveWidth, effectiveHeight]);
	const effectiveDimensions = useMemo<CanvasDimensions>(() => ({ width: effectiveWidth, height: effectiveHeight }), [effectiveWidth, effectiveHeight]);
	const registry = useMemo(() => createRegistry(), []);
	const pending = useSyncExternalStore(registry.subscribe, registry.anyPending, getPendingServerSnapshot);

	const [offscreenHost, setOffscreenHost] = useState<HTMLDivElement | null>(null);

	const contextValue: CanvasContextValue | null =
		offscreenHost === null
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
		const errorAttribute = errors.length > 0 ? JSON.stringify(errors.map((entry) => ({ id: entry.id, message: entry.error.message }))) : undefined;

		return (
			<RasterEffectContext.Provider value={registry}>
				<div
					ref={ref}
					aria-label={name}
					data-pictel-canvas=""
					data-pictel-pending={pending ? "" : undefined}
					data-pictel-error={errorAttribute}
					style={{ ...renderOuterStyle(effectiveWidth, effectiveHeight), ...style }}
					{...rest}
				>
					<div
						ref={setOffscreenHost}
						aria-hidden="true"
						style={offscreenHostStyle}
					/>
					{provideCanvasContext(<Frame>{children}</Frame>)}
				</div>
			</RasterEffectContext.Provider>
		);
	}

	const renderStripVisible = mode === "preview" && name !== undefined && name !== "";
	const Wrapper = mode === "preview" ? Workspace : Fragment;
	const baseOuterStyle = mode === "preview" ? previewOuterStyle : displayOuterStyle(dimensions.width, dimensions.height);

	return (
		<RasterEffectContext.Provider value={registry}>
			<div
				ref={ref}
				aria-label={name}
				data-pictel-canvas=""
				data-pictel-pending={pending ? "" : undefined}
				style={{ ...baseOuterStyle, ...style }}
				{...rest}
			>
				<div
					ref={setOffscreenHost}
					aria-hidden="true"
					style={offscreenHostStyle}
				/>
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
		</RasterEffectContext.Provider>
	);
}
