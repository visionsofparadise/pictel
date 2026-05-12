import { describe, expect, it } from "vitest";
import { computeFitRect } from "./Image";

describe("computeFitRect", () => {
	describe("fill", () => {
		it("stretches any source to the destination dimensions", () => {
			expect(computeFitRect(100, 100, 200, 100, "fill")).toEqual({ x: 0, y: 0, w: 200, h: 100 });
			expect(computeFitRect(50, 200, 100, 100, "fill")).toEqual({ x: 0, y: 0, w: 100, h: 100 });
			expect(computeFitRect(300, 400, 50, 50, "fill")).toEqual({ x: 0, y: 0, w: 50, h: 50 });
		});
	});

	describe("cover", () => {
		it("scales square source into wide dst by 2 (height fit), letterboxes vertically off-canvas", () => {
			// 100x100 source → 200x100 dst. max(2, 1) = 2 → 200x200, centered → y=-50.
			expect(computeFitRect(100, 100, 200, 100, "cover")).toEqual({ x: 0, y: -50, w: 200, h: 200 });
		});

		it("scales wide source into square dst on the smaller-axis-fits side", () => {
			// 200x100 source → 100x100 dst. max(0.5, 1) = 1 → 200x100, centered → x=-50.
			expect(computeFitRect(200, 100, 100, 100, "cover")).toEqual({ x: -50, y: 0, w: 200, h: 100 });
		});

		it("identity when source matches destination", () => {
			expect(computeFitRect(100, 100, 100, 100, "cover")).toEqual({ x: 0, y: 0, w: 100, h: 100 });
		});
	});

	describe("contain", () => {
		it("scales square source into wide dst by the smaller ratio, letterboxing horizontally", () => {
			// 100x100 source → 200x100 dst. min(2, 1) = 1 → 100x100, centered → x=50.
			expect(computeFitRect(100, 100, 200, 100, "contain")).toEqual({ x: 50, y: 0, w: 100, h: 100 });
		});

		it("scales wide source into square dst by the smaller ratio, letterboxing vertically", () => {
			// 200x100 source → 100x100 dst. min(0.5, 1) = 0.5 → 100x50, centered → y=25.
			expect(computeFitRect(200, 100, 100, 100, "contain")).toEqual({ x: 0, y: 25, w: 100, h: 50 });
		});

		it("identity when source matches destination", () => {
			expect(computeFitRect(100, 100, 100, 100, "contain")).toEqual({ x: 0, y: 0, w: 100, h: 100 });
		});
	});

	describe("none", () => {
		it("centers a smaller source inside a larger destination", () => {
			expect(computeFitRect(50, 50, 100, 100, "none")).toEqual({ x: 25, y: 25, w: 50, h: 50 });
		});

		it("centers a larger source over a smaller destination (negative origin, drawImage clips)", () => {
			expect(computeFitRect(200, 200, 100, 100, "none")).toEqual({ x: -50, y: -50, w: 200, h: 200 });
		});

		it("identity when source matches destination", () => {
			expect(computeFitRect(100, 100, 100, 100, "none")).toEqual({ x: 0, y: 0, w: 100, h: 100 });
		});
	});

	describe("square source into square destination", () => {
		it("produces an identity rect for all four fit modes", () => {
			const expected = { x: 0, y: 0, w: 100, h: 100 };
			expect(computeFitRect(100, 100, 100, 100, "fill")).toEqual(expected);
			expect(computeFitRect(100, 100, 100, 100, "cover")).toEqual(expected);
			expect(computeFitRect(100, 100, 100, 100, "contain")).toEqual(expected);
			expect(computeFitRect(100, 100, 100, 100, "none")).toEqual(expected);
		});
	});
});
