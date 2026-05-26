import { describe, test } from "vitest";
import { renderCanvas } from "../../../../packages/pictel/src/Components/utils/render-canvas";
import { waitForRasterEffect } from "../../../../packages/pictel/src/Components/utils/wait-for-raster-effect";
import { expectMatchesFingerprint } from "./__tests__/fingerprint";
import Demo from "./PopArt";

describe("PopArt integration", () => {
	test("matches fingerprint", async () => {
		const handle = renderCanvas(<Demo />);

		try {
			await waitForRasterEffect(handle.container, { timeout: 20000 });
			await expectMatchesFingerprint(handle.container, "pop-art");
		} finally {
			handle.cleanup();
		}
	});
});
