import type { CSSProperties } from "react";
import { tokens } from "./tokens";

interface LoadingOverlayProps {
	pending: boolean;
}

const darkenStyle: CSSProperties = {
	position: "absolute",
	inset: 0,
	backgroundColor: tokens.color.loadingOverlay,
	pointerEvents: "none",
	zIndex: 9,
};

const spinnerContainerStyle: CSSProperties = {
	position: "absolute",
	bottom: tokens.space[4],
	right: tokens.space[4],
	pointerEvents: "none",
	zIndex: 10,
};

/**
 * Full-bleed darken layer plus a bottom-right spinner. Visible when `pending`
 * is true; renders nothing otherwise. Both layers are siblings (not nested) so
 * the spinner sits above the darken without inheriting `pointer-events: none`
 * being applied to a wrapper.
 */
export function LoadingOverlay({ pending }: LoadingOverlayProps) {
	if (!pending) return null;

	return (
		<>
			<div style={darkenStyle} />
			<div style={spinnerContainerStyle}>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke={tokens.color.text}
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
		</>
	);
}
