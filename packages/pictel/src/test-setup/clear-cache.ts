import { beforeEach } from "vitest";
import { clearEffectCache } from "../effect-cache/effect-cache";

beforeEach(async () => {
	await clearEffectCache();
});
