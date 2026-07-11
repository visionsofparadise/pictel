import { describe, expect, test } from "vitest";
import { Canvas, Image } from "pictel";
import { renderCanvas } from "../../../pictel/src/Components/utils/render-canvas";
import { waitForRasterEffect } from "../../../pictel/src/Components/utils/wait-for-raster-effect";
import { SegFormer } from "./SegFormer";
import { checkerUrl, rasterCanvases, readCanvas } from "./utils/heavy-support";

const SIZE = 128;

describe("SegFormer heavy", () => {
	test("produces a fully opaque palette-colored segment map that is non-blank", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<SegFormer>
					<Image src={checkerUrl(SIZE)} width={SIZE} height={SIZE} fit="cover" />
				</SegFormer>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container, { timeout: 500_000 });

			const canvases = rasterCanvases(handle.container);
			const output = canvases[canvases.length - 1]!;

			expect(output.width).toBe(SIZE);
			expect(output.height).toBe(SIZE);

			const pixels = readCanvas(output);
			// SegFormer paints segmented regions in this fixed palette and leaves the rest black;
			// the synthetic checker's own colors are absent from it, so a passthrough or a
			// wrong-canvas read produces off-palette pixels and fails.
			const palette = new Set([
				"230,25,75", "60,180,75", "255,225,25", "0,130,200",
				"245,130,48", "145,30,180", "70,240,240", "240,50,230",
				"210,245,60", "250,190,212", "0,128,128", "220,190,255",
				"170,110,40", "255,250,200", "128,0,0", "170,255,195",
				"128,128,0", "255,215,180", "0,0,128", "128,128,128",
			]);
			let nonOpaque = 0;
			let segmented = 0;
			let offPalette = 0;

			for (let i = 0; i < pixels.data.length; i += 4) {
				const r = pixels.data[i]!;
				const g = pixels.data[i + 1]!;
				const b = pixels.data[i + 2]!;
				const alpha = pixels.data[i + 3]!;

				if (alpha !== 255) nonOpaque++;
				if (r > 0 || g > 0 || b > 0) {
					segmented++;
					if (!palette.has(`${r},${g},${b}`)) offPalette++;
				}
			}

			const total = pixels.width * pixels.height;
			expect(nonOpaque).toBe(0);
			expect(segmented / total).toBeGreaterThan(0.05);
			expect(offPalette).toBe(0);
		} finally {
			handle.cleanup();
		}
	});
});
