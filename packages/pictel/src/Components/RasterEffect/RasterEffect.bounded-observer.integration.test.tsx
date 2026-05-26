import { describe, expect, test } from "vitest";
import { type ReactNode } from "react";
import { Brightness } from "@pictel/effects";
import { Canvas } from "../../index";
import { Image } from "../Image/Image";
import { renderCanvas } from "../utils/render-canvas";
import { solidImage } from "../utils/test-images";
import { waitForRasterEffect } from "../utils/wait-for-raster-effect";

function buildComposition(src: string): ReactNode {
	return (
		<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
			<Brightness amount={1}>
				<Brightness amount={1}>
					<Image src={src} width={64} height={64} />
				</Brightness>
			</Brightness>
		</Canvas>
	);
}

function getOuterChildrenSlot(container: HTMLElement): HTMLDivElement {
	// Multiple [data-pictel-raster-effect] divs exist (outer + inner). Document order puts outer first — it wraps inner.
	const slots = container.querySelectorAll<HTMLDivElement>("[data-pictel-raster-effect]");

	if (slots.length === 0) throw new Error("no [data-pictel-raster-effect] found");

	return slots[0]!;
}

function extractDisplay(styleString: string | null): string {
	if (styleString === null || styleString === "") return "block";

	const match = /display:\s*([a-zA-Z-]+)/.exec(styleString);

	return match ? match[1]! : "block";
}

describe.sequential("RasterEffect bounded observer", () => {
	test("outer invalidates exactly once per nested re-run (display toggles one full cycle)", async () => {
		const srcA = solidImage("#ff0000", 64, 64);
		const srcB = solidImage("#00ff00", 64, 64);

		const handle = renderCanvas(buildComposition(srcA));

		try {
			await waitForRasterEffect(handle.container);

			const outerSlot = getOuterChildrenSlot(handle.container);

			// Steady state: snapshot is set, so the slot is display: none.
			expect(outerSlot.style.display).toBe("none");

			// Record every display value the slot transitions through. MutationObserver batches multiple
			// writes within one microtask; reconstruct intermediates from each record's oldValue, then
			// append the final post-batch reading so the closing transition isn't lost.
			const observed: Array<string> = [];

			const instrumentation = new MutationObserver((records) => {
				for (const record of records) {
					if (record.target !== outerSlot) continue;
					if (record.attributeName !== "style") continue;

					observed.push(extractDisplay(record.oldValue));
				}

				observed.push(extractDisplay(outerSlot.getAttribute("style")));
			});

			instrumentation.observe(outerSlot, {
				attributes: true,
				attributeFilter: ["style"],
				attributeOldValue: true,
			});

			// Trigger an inner-only re-run by swapping the leaf Image's src. The new src forces Image's
			// RasterSource to re-decode and re-acquire pending; that pending change propagates through
			// inner's selfRegistry → inner re-executes → inner notifies outer → outer re-executes.
			// The outer's effect callback identity is unchanged (Brightness amount stays 1) so the outer
			// only re-runs because the inner does.
			handle.root.render(buildComposition(srcB));

			await waitForRasterEffect(handle.container);

			instrumentation.disconnect();

			// Collapse consecutive duplicates — only transitions matter, and per-flush trailing reads can repeat.
			const sequence: Array<string> = [];

			for (const value of observed) {
				if (sequence[sequence.length - 1] !== value) sequence.push(value);
			}

			let noneToBlock = 0;
			let blockToNone = 0;

			for (let i = 1; i < sequence.length; i += 1) {
				if (sequence[i - 1] === "none" && sequence[i] === "block") noneToBlock += 1;
				if (sequence[i - 1] === "block" && sequence[i] === "none") blockToNone += 1;
			}

			// Phase 2 + 3 invariant: exactly one invalidate → re-snapshot cycle on the outer per inner re-run.
			// Without Phase 2's invalidate-in-subscribe, the outer never repaints children — display stays "none".
			// Without Phase 3's boundary filter, path A would add extra cycles inside the inner's pending span.
			expect(noneToBlock, `noneToBlock=${String(noneToBlock)} sequence=${JSON.stringify(sequence)}`).toBe(1);
			expect(blockToNone, `blockToNone=${String(blockToNone)} sequence=${JSON.stringify(sequence)}`).toBe(1);
			expect(outerSlot.style.display).toBe("none");
		} finally {
			handle.cleanup();
		}
	});
});
