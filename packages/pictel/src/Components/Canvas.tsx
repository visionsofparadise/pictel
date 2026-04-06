import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from "react";
import { CanvasContext, type CanvasContextValue, type CanvasDimensions } from "../context/canvas";
import { useContainerSize } from "../hooks/useContainerSize";
import { useMode } from "../hooks/useMode";
import { useRasterPipeline } from "../hooks/useRasterPipeline";
import { ErrorOverlay } from "./ErrorOverlay";
import { Frame } from "./Frame";

interface CanvasProps extends ComponentPropsWithoutRef<"div"> {
	name?: string;
	dimensions: CanvasDimensions;
	children?: ReactNode;
}

export function Canvas({ name, dimensions, children, style, ...rest }: CanvasProps) {
	const mode = useMode();
	const { ref, width, height } = useContainerSize();
	const { register, errors } = useRasterPipeline(ref, dimensions);

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
		rasterPipeline: { register, errors },
	};

	return (
		<CanvasContext.Provider value={contextValue}>
			<div
				ref={ref}
				aria-label={name}
				data-ready="false"
				style={outerStyle}
				{...rest}
			>
				<Frame>{children}</Frame>
				<ErrorOverlay />
			</div>
		</CanvasContext.Provider>
	);
}
