import { describe, expect, test } from "vitest";
import { Canvas, Image } from "pictel";
import { renderCanvas } from "../../../pictel/src/Components/utils/render-canvas";
import { waitForRasterEffect } from "../../../pictel/src/Components/utils/wait-for-raster-effect";
import { Upscale } from "./Upscale";
import { gradientUrl, rasterCanvases, readCanvas } from "./utils/heavy-support";

const SIZE = 64;

describe("Upscale heavy", () => {
	test("outputs exactly 2x the input dimensions with non-blank content", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<Upscale>
					<Image src={gradientUrl(SIZE)} width={SIZE} height={SIZE} fit="cover" />
				</Upscale>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container, { timeout: 500_000 });

			const canvases = rasterCanvases(handle.container);
			const output = canvases[canvases.length - 1]!;

			expect(output.width).toBe(SIZE * 2);
			expect(output.height).toBe(SIZE * 2);

			const pixels = readCanvas(output);
			let min = 255;
			let max = 0;

			for (let i = 0; i < pixels.data.length; i += 4) {
				const lum = pixels.data[i]!;
				min = Math.min(min, lum);
				max = Math.max(max, lum);
			}

			expect(max - min).toBeGreaterThan(20);
		} finally {
			handle.cleanup();
		}
	});
});
