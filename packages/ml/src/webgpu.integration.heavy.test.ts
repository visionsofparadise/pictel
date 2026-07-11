import { expect, test } from "vitest";
import { requireWebGPU } from "./webgpu";

test("a WebGPU adapter is reachable in the heavy environment", async () => {
	const adapter = await requireWebGPU();

	expect(adapter).toBeTruthy();
});
