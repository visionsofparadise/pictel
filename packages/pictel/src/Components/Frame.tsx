import type { ReactNode } from "react";
import { useCanvasContext } from "../context/canvas";

interface FrameProps {
	children?: ReactNode;
}

export function Frame({ children }: FrameProps) {
	const { mode, dimensions, viewport } = useCanvasContext();
	const isPreview = mode === "preview";
	const checkerboard = isPreview ? "repeating-conic-gradient(#e0e0e0 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px" : "transparent";

	if (!dimensions) {
		return (
			<div style={{ position: "relative", width: "100%" }}>
				{children}
			</div>
		);
	}

	if ("reference" in dimensions) {
		const referenceWidth = dimensions.reference.width;
		const referenceHeight = dimensions.reference.height;

		if (isPreview) {
			const scaleFactor = viewport.width === 0 || viewport.height === 0 ? 1 : Math.min(viewport.width / referenceWidth, viewport.height / referenceHeight, 1);

			return (
				<div
					style={{
						width: referenceWidth,
						height: referenceHeight,
						transform: `scale(${scaleFactor})`,
						transformOrigin: "center center",
						position: "relative",
						overflow: "hidden",
						background: checkerboard,
					}}
				>
					{children}
				</div>
			);
		}

		return (
			<div
				style={{
					width: referenceWidth,
					height: referenceHeight,
					position: "relative",
					overflow: "hidden",
					background: "transparent",
				}}
			>
				{children}
			</div>
		);
	}

	return (
		<div
			style={{
				aspectRatio: dimensions.aspectRatio,
				maxWidth: "100%",
				maxHeight: "100%",
				width: "100%",
				position: "relative",
				overflow: "hidden",
				background: checkerboard,
			}}
		>
			{children}
		</div>
	);
}
