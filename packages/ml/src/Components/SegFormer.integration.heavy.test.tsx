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
			let nonOpaque = 0;
			let colored = 0;

			for (let i = 0; i < pixels.data.length; i += 4) {
				const r = pixels.data[i]!;
				const g = pixels.data[i + 1]!;
				const b = pixels.data[i + 2]!;
				const alpha = pixels.data[i + 3]!;

				if (alpha !== 255) nonOpaque++;
				if (r > 0 || g > 0 || b > 0) colored++;
			}

			const total = pixels.width * pixels.height;
			expect(nonOpaque).toBe(0);
			expect(colored / total).toBeGreaterThan(0.05);
		} finally {
			handle.cleanup();
		}
	});
});
