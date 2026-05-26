import { ErrorChip, type RasterEffectError } from "pictel";
import { useEffect, useRef } from "react";

/**
 * Wrapper that mounts an ErrorChip and synthesizes a `mouseenter` event on the
 * chip's root element after mount, forcing the expanded view without changing
 * ErrorChip's API.
 */
export function ForcedExpandedErrorChip({ errors }: { errors: Array<RasterEffectError> }) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;

		if (!container) return;

		const chipRoot = container.firstElementChild;

		if (!(chipRoot instanceof HTMLElement)) return;

		chipRoot.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
	}, []);

	return (
		<div ref={containerRef} style={{ display: "contents" }}>
			<ErrorChip errors={errors} />
		</div>
	);
}
