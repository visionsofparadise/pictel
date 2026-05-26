import { describe, test } from "vitest";
import { renderCanvas } from "../../../../packages/pictel/src/Components/utils/render-canvas";
import { waitForRasterEffect } from "../../../../packages/pictel/src/Components/utils/wait-for-raster-effect";
import { expectMatchesFingerprint } from "./__tests__/fingerprint";
import Demo from "./LineDrawing";

describe("LineDrawing integration", () => {
	test("matches fingerprint", async () => {
		const handle = renderCanvas(<Demo />);

		try {
			await waitForRasterEffect(handle.container, { timeout: 20000 });
			await expectMatchesFingerprint(handle.container, "line-drawing");
		} finally {
			handle.cleanup();
		}
	});
});
