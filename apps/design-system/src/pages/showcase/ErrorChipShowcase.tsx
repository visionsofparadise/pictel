import { ErrorChip, tokens, type RasterEffectError } from "pictel";
import type { CSSProperties } from "react";
import { ForcedExpandedErrorChip } from "./ForcedExpandedErrorChip";
import { subheadingStyle } from "./utils/styles";

const SAMPLE_ERRORS: Array<RasterEffectError> = [
	{
		id: "blur-12",
		error: new Error("Cannot capture pipeline output: source canvas is empty."),
		timestamp: 1700000000000,
	},
	{
		id: "displacement-3",
		error: new Error("Map child resolved with no pixels — check that DepthMap finished."),
		timestamp: 1700000001000,
	},
];

const errorChipFrameStyle: CSSProperties = {
	position: "relative",
	width: 420,
	height: 220,
	backgroundColor: tokens.color.workspace,
	border: `1px solid ${tokens.color.border}`,
	boxSizing: "border-box",
};

export function ErrorChipShowcase() {
	return (
		<div style={{ display: "flex", gap: tokens.space[6] }}>
			<div>
				<p style={subheadingStyle}>Collapsed</p>
				<div style={errorChipFrameStyle}>
					<ErrorChip errors={SAMPLE_ERRORS} />
				</div>
			</div>
			<div>
				<p style={subheadingStyle}>Expanded</p>
				<div style={errorChipFrameStyle}>
					<ForcedExpandedErrorChip errors={SAMPLE_ERRORS} />
				</div>
			</div>
		</div>
	);
}
