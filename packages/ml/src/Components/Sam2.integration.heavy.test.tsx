import { describe, expect, test } from "vitest";
import { Canvas, Image } from "pictel";
import { renderCanvas } from "../../../pictel/src/Components/utils/render-canvas";
import { waitForRasterEffect } from "../../../pictel/src/Components/utils/wait-for-raster-effect";
import { Sam2 } from "./Sam2";
import { rasterCanvases, readCanvas, subjectDiscUrl } from "./utils/heavy-support";

const SIZE = 128;

describe("Sam2 heavy", () => {
	test("produces a binary opaque mask that separates the prompted object from its background", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: SIZE, height: SIZE }}>
				<Sam2
					points={[{ x: SIZE / 2, y: SIZE / 2 }]}
					negativePoints={[
						{ x: 4, y: 4 },
						{ x: SIZE - 4, y: 4 },
						{ x: 4, y: SIZE - 4 },
						{ x: SIZE - 4, y: SIZE - 4 },
					]}
				>
					<Image src={subjectDiscUrl(SIZE)} width={SIZE} height={SIZE} fit="cover" />
				</Sam2>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container, { timeout: 500_000 });

			const canvases = rasterCanvases(handle.container);
			const output = canvases[canvases.length - 1]!;

			expect(output.width).toBe(SIZE);
			expect(output.height).toBe(SIZE);

			const pixels = readCanvas(output);
			let white = 0;
			let black = 0;
			let nonBinary = 0;
			let nonOpaque = 0;
			let discWhite = 0;
			let discTotal = 0;
			let bgWhite = 0;
			let bgTotal = 0;
			const discRadius = SIZE * 0.3;

			for (let y = 0; y < SIZE; y++) {
				for (let x = 0; x < SIZE; x++) {
					const offset = (y * SIZE + x) * 4;
					const r = pixels.data[offset]!;
					const g = pixels.data[offset + 1]!;
					const b = pixels.data[offset + 2]!;
					const alpha = pixels.data[offset + 3]!;

					if (alpha !== 255) nonOpaque++;

					const isWhite = r === 255 && g === 255 && b === 255;
					const isBlack = r === 0 && g === 0 && b === 0;

					if (isWhite) white++;
					else if (isBlack) black++;
					else nonBinary++;

					const inDisc = Math.hypot(x - SIZE / 2, y - SIZE / 2) <= discRadius;

					if (inDisc) {
						discTotal++;

						if (isWhite) discWhite++;
					} else {
						bgTotal++;

						if (isWhite) bgWhite++;
					}
				}
			}

			expect(nonOpaque).toBe(0);
			expect(nonBinary).toBe(0);
			expect(white).toBeGreaterThan(0);
			expect(black).toBeGreaterThan(0);

			const discWhiteFraction = discWhite / discTotal;
			const bgWhiteFraction = bgWhite / bgTotal;
			const discPurity = Math.max(discWhiteFraction, 1 - discWhiteFraction);

			expect(discPurity).toBeGreaterThan(0.85);
			expect(Math.abs(discWhiteFraction - bgWhiteFraction)).toBeGreaterThan(0.6);
		} finally {
			handle.cleanup();
		}
	});
});
