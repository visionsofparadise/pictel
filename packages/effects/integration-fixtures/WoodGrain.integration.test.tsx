import { describe, test } from "vitest";
import { renderCanvas } from "../../pictel/src/Components/utils/render-canvas";
import { waitForRasterEffect } from "../../pictel/src/Components/utils/wait-for-raster-effect";
import { expectMatchesFingerprint } from "./__tests__/fingerprint";
import Demo from "./WoodGrain";

describe("WoodGrain integration", () => {
	test("matches fingerprint", async () => {
		const handle = renderCanvas(<Demo />);

		try {
			await waitForRasterEffect(handle.container, { timeout: 60000 });
			await expectMatchesFingerprint(handle.container, "wood-grain");
		} finally {
			handle.cleanup();
		}
	});
});
