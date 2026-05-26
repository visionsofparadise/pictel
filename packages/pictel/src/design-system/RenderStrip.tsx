import { useState, type CSSProperties } from "react";
import { createRasterEffectError } from "../Components/RasterEffect/Error";
import { useCanvasContext } from "../context/canvas";
import { ExportError, exportCanvas } from "./export";
import { tokens } from "./tokens";

type Format = "png" | "jpeg" | "webp";

interface RenderStripProps {
	canvasName: string;
	width: number;
	height: number;
	/**
	 * Disable the Render button. Set when the canvas is pending (mid-pipeline)
	 * or has surfaced any pipeline errors — exporting under either condition
	 * would capture an in-progress or broken composition.
	 */
	disabled?: boolean;
}

const containerStyle: CSSProperties = {
	position: "absolute",
	top: tokens.space[4],
	right: tokens.space[4],
	display: "flex",
	gap: tokens.space[2],
	alignItems: "center",
	zIndex: 10,
};

const selectStyle: CSSProperties = {
	backgroundColor: tokens.color.panel,
	color: tokens.color.text,
	border: `1px solid ${tokens.color.border}`,
	padding: `${String(tokens.space[2])}px ${String(tokens.space[3])}px`,
	fontSize: tokens.text.sm,
	fontFamily: tokens.font.ui,
	boxSizing: "border-box",
};

const qualityValueStyle: CSSProperties = {
	fontFamily: tokens.font.mono,
	fontSize: tokens.text.xs,
	color: tokens.color.textSecondary,
	fontVariantNumeric: "tabular-nums",
	letterSpacing: "0.02em",
	minWidth: 24,
	textAlign: "right",
};

export function RenderStrip({ canvasName, width, height, disabled = false }: RenderStripProps) {
	const { reportError } = useCanvasContext();
	const [format, setFormat] = useState<Format>("png");
	const [quality, setQuality] = useState(85);
	const [rendering, setRendering] = useState(false);
	const [hovered, setHovered] = useState(false);

	const qualityVisible = format !== "png";
	const buttonInactive = rendering || disabled;

	const qualitySliderContainerStyle: CSSProperties = {
		display: "flex",
		gap: tokens.space[1],
		alignItems: "center",
	};

	const buttonBg = buttonInactive ? tokens.color.panel : hovered ? tokens.color.panelRaised : tokens.color.panel;
	const buttonColor = buttonInactive ? tokens.color.textDisabled : tokens.color.text;

	const buttonStyle: CSSProperties = {
		appearance: "none",
		padding: `${String(tokens.space[2])}px ${String(tokens.space[4])}px`,
		backgroundColor: buttonBg,
		color: buttonColor,
		border: `1px solid ${tokens.color.border}`,
		fontSize: tokens.text.sm,
		fontFamily: tokens.font.ui,
		cursor: buttonInactive ? "not-allowed" : "pointer",
		boxSizing: "border-box",
	};

	const handleRender = async () => {
		setRendering(true);

		try {
			await exportCanvas({
				canvasName,
				width,
				height,
				format,
				quality: format === "png" ? undefined : quality / 100,
				sourceUrl: window.location.href,
			});
		} catch (caughtError) {
			const pipelineError = caughtError instanceof ExportError ? caughtError.pipelineError : createRasterEffectError("render", caughtError);

			reportError(pipelineError);
		} finally {
			setRendering(false);
		}
	};

	return (
		<div style={containerStyle}>
			<select
				style={selectStyle}
				value={format}
				onChange={(event) => {
					setFormat(event.target.value as Format);
				}}
			>
				<option value="png">PNG</option>
				<option value="jpeg">JPEG</option>
				<option value="webp">WEBP</option>
			</select>
			{qualityVisible ? (
				<div style={qualitySliderContainerStyle}>
					<input
						type="range"
						min={0}
						max={100}
						value={quality}
						onChange={(event) => {
							setQuality(Number(event.target.value));
						}}
					/>
					<span style={qualityValueStyle}>{quality}</span>
				</div>
			) : null}
			<button
				type="button"
				style={buttonStyle}
				disabled={buttonInactive}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				onClick={() => {
					void handleRender();
				}}
			>
				{rendering ? "Rendering…" : "Render"}
			</button>
		</div>
	);
}
