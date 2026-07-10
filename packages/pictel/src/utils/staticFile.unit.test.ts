import { describe, expect, it } from "vitest";
import { staticFile } from "./staticFile";

describe("staticFile", () => {
	it("prefixes a bare path with a leading slash", () => {
		expect(staticFile("hero.jpg")).toBe("/hero.jpg");
	});

	it("strips a leading ./ before prefixing", () => {
		expect(staticFile("./hero.jpg")).toBe("/hero.jpg");
	});

	it("collapses a leading / to a single root-relative slash", () => {
		expect(staticFile("/hero.jpg")).toBe("/hero.jpg");
	});

	it("preserves nested directory segments", () => {
		expect(staticFile("./images/cards/hero.jpg")).toBe("/images/cards/hero.jpg");
	});

	it("returns root for an empty path", () => {
		expect(staticFile("")).toBe("/");
	});
});
