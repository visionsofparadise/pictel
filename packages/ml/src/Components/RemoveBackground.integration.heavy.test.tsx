import { describe, expect, test } from "vitest";
import { Canvas, Image } from "pictel";
import { renderCanvas } from "../../../pictel/src/Components/utils/render-canvas";
import { waitForRasterEffect } from "../../../pictel/src/Components/utils/wait-for-raster-effect";
import { RemoveBackground } from "./RemoveBackground";
import { pixelAt, rasterCanvases, readCanvas, subjectDiscUrl } from "./utils/heavy-support";

const SIZE = 128;

describe("RemoveBackground heavy", () => {
	test("splits alpha — subject region opaque, background region transparent", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<RemoveBackground>
					<Image src={subjectDiscUrl(SIZE)} width={SIZE} height={SIZE} fit="cover" />
				</RemoveBackground>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container, { timeout: 500_000 });

			const canvases = rasterCanvases(handle.container);
			const output = canvases[canvases.length - 1]!;

			expect(output.width).toBe(SIZE);
			expect(output.height).toBe(SIZE);

			const pixels = readCanvas(output);
			let opaque = 0;
			let transparent = 0;

			for (let i = 3; i < pixels.data.length; i += 4) {
				const alpha = pixels.data[i]!;

				if (alpha > 200) opaque++;
				else if (alpha < 50) transparent++;
			}

			const total = pixels.width * pixels.height;
			expect(opaque / total).toBeGreaterThan(0.02);
			expect(transparent / total).toBeGreaterThan(0.02);

			const [, , , centerAlpha] = pixelAt(pixels, SIZE / 2, SIZE / 2);
			const [, , , cornerAlpha] = pixelAt(pixels, 3, 3);
			expect(centerAlpha).toBeGreaterThan(cornerAlpha);
		} finally {
			handle.cleanup();
		}
	});
});
