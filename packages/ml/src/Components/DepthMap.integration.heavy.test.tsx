import { describe, expect, test } from "vitest";
import { Canvas, Image } from "pictel";
import { renderCanvas } from "../../../pictel/src/Components/utils/render-canvas";
import { waitForRasterEffect } from "../../../pictel/src/Components/utils/wait-for-raster-effect";
import { DepthMap } from "./DepthMap";
import { gradientUrl, rasterCanvases, readCanvas } from "./utils/heavy-support";

const SIZE = 128;

describe("DepthMap heavy", () => {
	test("produces a grayscale depth map with depth variation over synthetic content", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<DepthMap>
					<Image src={gradientUrl(SIZE)} width={SIZE} height={SIZE} fit="cover" />
				</DepthMap>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container, { timeout: 500_000 });

			const canvases = rasterCanvases(handle.container);
			const output = canvases[canvases.length - 1]!;

			expect(output.width).toBe(SIZE);
			expect(output.height).toBe(SIZE);

			const pixels = readCanvas(output);
			let maxChannelSpread = 0;
			let min = 255;
			let max = 0;

			for (let i = 0; i < pixels.data.length; i += 4) {
				const r = pixels.data[i]!;
				const g = pixels.data[i + 1]!;
				const b = pixels.data[i + 2]!;
				maxChannelSpread = Math.max(maxChannelSpread, Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
				min = Math.min(min, r);
				max = Math.max(max, r);
			}

			expect(maxChannelSpread).toBeLessThanOrEqual(2);
			expect(max - min).toBeGreaterThan(20);
		} finally {
			handle.cleanup();
		}
	});
});
