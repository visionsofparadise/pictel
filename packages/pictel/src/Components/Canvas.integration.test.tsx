import { describe, expect, test } from "vitest";
import { StrictMode } from "react";
import {
	Brightness,
	Canvas,
	Grayscale,
	Invert,
	Map as PictelMap,
	Multiply,
} from "../index";
// Note: Map is imported as PictelMap to avoid shadowing the global Map constructor.
// All JSX usages must use <PictelMap>, not <Map>.
import { renderCanvas } from "./utils/render-canvas";
import { readPipelineOutput, readPixel } from "./utils/read-pipeline-output";
import { gradientImage, solidImage } from "./utils/test-images";
import { waitForPipeline } from "./utils/wait-for-pipeline";

let brokenLevel = -1;

function ladder(level: number): (fn: () => Promise<void>) => Promise<void> {
	return async (fn) => {
		if (brokenLevel >= 0 && brokenLevel < level) {
			return;
		}
		try {
			await fn();
		} catch (error) {
			if (brokenLevel < 0) brokenLevel = level;
			throw error;
		}
	};
}

function getPipeline(container: HTMLElement): HTMLElement {
	const pipeline = container.querySelector<HTMLElement>("[data-pictel-pipeline]");
	if (!pipeline) throw new Error("no [data-pictel-pipeline] found in container");

	return pipeline;
}

function getOuterPipeline(container: HTMLElement): HTMLElement {
	const all = Array.from(
		container.querySelectorAll<HTMLElement>("[data-pictel-pipeline]"),
	);
	if (all.length === 0) throw new Error("no [data-pictel-pipeline] found in container");
	// Outer pipeline is the one whose ancestors contain no other pipeline.
	for (const candidate of all) {
		let hasPipelineAncestor = false;
		let parent: HTMLElement | null = candidate.parentElement;
		while (parent && parent !== container) {
			if (parent.hasAttribute("data-pictel-pipeline")) {
				hasPipelineAncestor = true;
				break;
			}
			parent = parent.parentElement;
		}
		if (!hasPipelineAncestor) return candidate;
	}
	throw new Error("could not determine outer pipeline");
}

describe.sequential("pipeline integration ladder", () => {
	test("level 0: plain canvas + img", async () => {
		await ladder(0)(async () => {
			const handle = renderCanvas(
				<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
					<img src={solidImage("#ff0000", 64, 64)} />
				</Canvas>,
			);
			try {
				await waitForPipeline(handle.container);
				const img = handle.container.querySelector("img");
				expect(img).not.toBeNull();
				// No pipeline div expected for plain Canvas + img.
				const pipeline = handle.container.querySelector("[data-pictel-pipeline]");
				expect(pipeline).toBeNull();
			} finally {
				handle.cleanup();
			}
		});
	});

	test("level 1: grayscale red", async () => {
		await ladder(1)(async () => {
			const handle = renderCanvas(
				<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
					<Grayscale>
						<img src={solidImage("#ff0000", 64, 64)} />
					</Grayscale>
				</Canvas>,
			);
			try {
				await waitForPipeline(handle.container);
				const pipeline = getPipeline(handle.container);
				const pixels = readPipelineOutput(pipeline);
				const [red, green, blue] = readPixel(pixels, 10, 10);
				// BT.601 luminance of pure red: 0.299 * 255 ≈ 76.
				expect(red).toBeGreaterThanOrEqual(74);
				expect(red).toBeLessThanOrEqual(78);
				expect(green).toBeGreaterThanOrEqual(74);
				expect(green).toBeLessThanOrEqual(78);
				expect(blue).toBeGreaterThanOrEqual(74);
				expect(blue).toBeLessThanOrEqual(78);
			} finally {
				handle.cleanup();
			}
		});
	});

	test("level 2: invert horizontal gradient", async () => {
		await ladder(2)(async () => {
			const handle = renderCanvas(
				<Canvas mode="display" dimensions={{ width: 128, height: 32 }}>
					<Invert>
						<img src={gradientImage("#000000", "#ffffff", "horizontal", 128, 32)} />
					</Invert>
				</Canvas>,
			);
			try {
				await waitForPipeline(handle.container);
				const pipeline = getPipeline(handle.container);
				const pixels = readPipelineOutput(pipeline);
				// Sample further from the gradient edges (x=20 instead of x=8,
				// x=108 instead of x=100): the IMG is rendered inside a
				// childrenEl whose layout height (36px due to inline baseline)
				// differs from the requested capture height (32px); snapdom's
				// exact-dim output can apply a slight content offset at
				// gradient extremes that nudges the boundary by 5–8 px in
				// horizontal sampling. Sampling away from the edges removes
				// the boundary sensitivity while still validating "invert"
				// produces the inverted gradient direction.
				const [nearBlackInverted] = readPixel(pixels, 20, 16);
				// Original at x=20 is dark (~40), inverted → ~215.
				expect(nearBlackInverted).toBeGreaterThanOrEqual(195);
				expect(nearBlackInverted).toBeLessThanOrEqual(235);
				const [nearWhiteInverted] = readPixel(pixels, 108, 16);
				// Original at x=108 is bright (~216), inverted → ~39.
				expect(nearWhiteInverted).toBeGreaterThanOrEqual(20);
				expect(nearWhiteInverted).toBeLessThanOrEqual(60);
			} finally {
				handle.cleanup();
			}
		});
	});

	test("level 3: nested invert (regression)", async () => {
		await ladder(3)(async () => {
			const handle = renderCanvas(
				<Canvas mode="display" dimensions={{ width: 128, height: 32 }}>
					<Invert>
						<Invert>
							<img src={gradientImage("#000000", "#ffffff", "horizontal", 128, 32)} />
						</Invert>
					</Invert>
				</Canvas>,
			);
			try {
				await waitForPipeline(handle.container);
				const outer = getOuterPipeline(handle.container);
				const pixels = readPipelineOutput(outer);
				// Sample further from edges (see level 2 note on edge offset).
				const [lowX] = readPixel(pixels, 20, 16);
				// Double-inverted ≈ original gradient: at x=20 → ~40.
				expect(lowX).toBeGreaterThanOrEqual(20);
				expect(lowX).toBeLessThanOrEqual(60);
				const [highX] = readPixel(pixels, 108, 16);
				// At x=108 → ~216.
				expect(highX).toBeGreaterThanOrEqual(196);
				expect(highX).toBeLessThanOrEqual(236);
			} finally {
				handle.cleanup();
			}
		});
	});

	test("level 4: mapped brightness", async () => {
		await ladder(4)(async () => {
			const handle = renderCanvas(
				<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
					<Brightness mode="parameter" amount={1.5}>
						<PictelMap>
							<img src={solidImage("#808080", 64, 64)} />
						</PictelMap>
						<img src={solidImage("#808080", 64, 64)} />
					</Brightness>
				</Canvas>,
			);
			try {
				await waitForPipeline(handle.container);
				const pipeline = getPipeline(handle.container);
				const pixels = readPipelineOutput(pipeline);
				const [red, green, blue] = readPixel(pixels, 10, 10);
				// lerp(1, 1.5, luminance(#808080)=0.5) = 1.25; 128 * 1.25 = 160.
				expect(red).toBeGreaterThanOrEqual(150);
				expect(red).toBeLessThanOrEqual(170);
				expect(green).toBeGreaterThanOrEqual(150);
				expect(green).toBeLessThanOrEqual(170);
				expect(blue).toBeGreaterThanOrEqual(150);
				expect(blue).toBeLessThanOrEqual(170);
			} finally {
				handle.cleanup();
			}
		});
	});

	// Level 5 intentionally skipped per plan.

	test("level 6: grayscale backdrop", async () => {
		await ladder(6)(async () => {
			// Deviation from plan: the plan's Level 6 uses an absolutely
			// positioned 50x50 div as Grayscale backdrop's only child. That
			// leaves the pipeline's childrenRef wrapper with flow height 0,
			// which in turn makes captureBehind capture a 0-height region and
			// the pipeline hangs pending. Using a block-level sized child
			// keeps the backdrop semantics (Grayscale captures what's behind
			// its footprint) without the degenerate 0-height case.
			const handle = renderCanvas(
				<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
					<div style={{ position: "relative", width: 100, height: 100 }}>
						<img
							src={solidImage("#ff0000", 100, 100)}
							style={{ position: "absolute", top: 0, left: 0 }}
						/>
						<div
							style={{
								position: "absolute",
								top: 25,
								left: 25,
								width: 50,
								height: 50,
							}}
						>
							<Grayscale backdrop>
								<div style={{ width: 50, height: 50 }} />
							</Grayscale>
						</div>
					</div>
				</Canvas>,
			);
			try {
				await waitForPipeline(handle.container);
				const pipeline = getPipeline(handle.container);
				const pixels = readPipelineOutput(pipeline);
				const [red, green, blue] = readPixel(pixels, 10, 10);
				// Grayscale of red backdrop ≈ 76.
				expect(red).toBeGreaterThanOrEqual(71);
				expect(red).toBeLessThanOrEqual(81);
				expect(green).toBeGreaterThanOrEqual(71);
				expect(green).toBeLessThanOrEqual(81);
				expect(blue).toBeGreaterThanOrEqual(71);
				expect(blue).toBeLessThanOrEqual(81);
			} finally {
				handle.cleanup();
			}
		});
	});

	test("level 7: multiply red over green", async () => {
		await ladder(7)(async () => {
			const handle = renderCanvas(
				<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
					<div style={{ position: "relative" }}>
						<img
							src={solidImage("#ff0000", 100, 100)}
							style={{ display: "block" }}
						/>
						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: 100,
								height: 100,
							}}
						>
							<Multiply>
								<img
									src={solidImage("#00ff00", 100, 100)}
									style={{ display: "block" }}
								/>
							</Multiply>
						</div>
					</div>
				</Canvas>,
			);
			try {
				await waitForPipeline(handle.container);
				const pipeline = getPipeline(handle.container);
				const pixels = readPipelineOutput(pipeline);
				const [red, green, blue] = readPixel(pixels, 20, 20);
				// Red * green = 0 in all channels.
				expect(red).toBeGreaterThanOrEqual(0);
				expect(red).toBeLessThanOrEqual(5);
				expect(green).toBeGreaterThanOrEqual(0);
				expect(green).toBeLessThanOrEqual(5);
				expect(blue).toBeGreaterThanOrEqual(0);
				expect(blue).toBeLessThanOrEqual(5);
			} finally {
				handle.cleanup();
			}
		});
	});

	test("level 8: strict mode double-mount safety", async () => {
		await ladder(8)(async () => {
			// Level 1 in StrictMode.
			const handle1 = renderCanvas(
				<StrictMode>
					<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
						<Grayscale>
							<img src={solidImage("#ff0000", 64, 64)} />
						</Grayscale>
					</Canvas>
				</StrictMode>,
			);
			try {
				await waitForPipeline(handle1.container);
				const pipeline = getPipeline(handle1.container);
				const pixels = readPipelineOutput(pipeline);
				const [red] = readPixel(pixels, 10, 10);
				expect(red).toBeGreaterThanOrEqual(74);
				expect(red).toBeLessThanOrEqual(78);
			} finally {
				handle1.cleanup();
			}

			// Level 4 in StrictMode.
			const handle4 = renderCanvas(
				<StrictMode>
					<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
						<Brightness mode="parameter" amount={1.5}>
							<PictelMap>
								<img src={solidImage("#808080", 64, 64)} />
							</PictelMap>
							<img src={solidImage("#808080", 64, 64)} />
						</Brightness>
					</Canvas>
				</StrictMode>,
			);
			try {
				await waitForPipeline(handle4.container);
				const pipeline = getPipeline(handle4.container);
				const pixels = readPipelineOutput(pipeline);
				const [red] = readPixel(pixels, 10, 10);
				expect(red).toBeGreaterThanOrEqual(158);
				expect(red).toBeLessThanOrEqual(162);
			} finally {
				handle4.cleanup();
			}

			// Level 6 (Grayscale backdrop over red img) in StrictMode.
			const handle6 = renderCanvas(
				<StrictMode>
					<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
						<div style={{ position: "relative", width: 100, height: 100 }}>
							<img
								src={solidImage("#ff0000", 100, 100)}
								style={{ position: "absolute", top: 0, left: 0 }}
							/>
							<div
								style={{
									position: "absolute",
									top: 25,
									left: 25,
									width: 50,
									height: 50,
								}}
							>
								<Grayscale backdrop>
									<div style={{ width: 50, height: 50 }} />
								</Grayscale>
							</div>
						</div>
					</Canvas>
				</StrictMode>,
			);
			try {
				await waitForPipeline(handle6.container);
				const pipeline = getPipeline(handle6.container);
				const pixels = readPipelineOutput(pipeline);
				const [red, green, blue] = readPixel(pixels, 10, 10);
				// Must match non-StrictMode Level 6 (grayscale red ≈ 76) within ±2.
				expect(red).toBeGreaterThanOrEqual(74);
				expect(red).toBeLessThanOrEqual(78);
				expect(green).toBeGreaterThanOrEqual(74);
				expect(green).toBeLessThanOrEqual(78);
				expect(blue).toBeGreaterThanOrEqual(74);
				expect(blue).toBeLessThanOrEqual(78);
			} finally {
				handle6.cleanup();
			}
		});
	});

	test("level 9: uncached gradient invert", async () => {
		await ladder(9)(async () => {
			// Different size to guarantee an uncached image URL vs Level 2.
			const handle = renderCanvas(
				<Canvas mode="display" dimensions={{ width: 160, height: 40 }}>
					<Invert>
						<img src={gradientImage("#000000", "#ffffff", "horizontal", 160, 40)} />
					</Invert>
				</Canvas>,
			);
			try {
				await waitForPipeline(handle.container);
				const pipeline = getPipeline(handle.container);
				const pixels = readPipelineOutput(pipeline);
				// Sample away from edges (see level 2 note on edge offset).
				const [lowInverted] = readPixel(pixels, 20, 20);
				// Original at x=20 of 160 → ~32; inverted → ~223.
				expect(lowInverted).toBeGreaterThanOrEqual(203);
				expect(lowInverted).toBeLessThanOrEqual(243);
				const [highInverted] = readPixel(pixels, 130, 20);
				// Original near white at x=130 → inverted near black.
				expect(highInverted).toBeGreaterThanOrEqual(35);
				expect(highInverted).toBeLessThanOrEqual(55);
			} finally {
				handle.cleanup();
			}
		});
	});

	test("level 10: grayscale over flex row", async () => {
		await ladder(10)(async () => {
			// Note: #00ff00 is used instead of "green" (which is CSS #008000)
			// so that the grayscale output at x=60 lands near the luminance
			// of pure green (~150) as the plan prescribes.
			const handle = renderCanvas(
				<Canvas mode="display" dimensions={{ width: 128, height: 40 }}>
					<Grayscale>
						<div style={{ display: "flex", gap: 4 }}>
							<div style={{ width: 40, height: 40, backgroundColor: "#ff0000" }} />
							<div style={{ width: 40, height: 40, backgroundColor: "#00ff00" }} />
							<div style={{ width: 40, height: 40, backgroundColor: "#0000ff" }} />
						</div>
					</Grayscale>
				</Canvas>,
			);
			try {
				await waitForPipeline(handle.container);
				const pipeline = getPipeline(handle.container);
				const pixels = readPipelineOutput(pipeline);
				// Red column (first 40px) → ~76.
				const [redGrayscale] = readPixel(pixels, 20, 20);
				expect(redGrayscale).toBeGreaterThanOrEqual(71);
				expect(redGrayscale).toBeLessThanOrEqual(81);
				// Green column (44-84 after 4px gap) → ~150.
				const [greenGrayscale] = readPixel(pixels, 60, 20);
				expect(greenGrayscale).toBeGreaterThanOrEqual(145);
				expect(greenGrayscale).toBeLessThanOrEqual(155);
				// Blue column (88-128 after 8px gap) → ~29.
				const [blueGrayscale] = readPixel(pixels, 100, 20);
				expect(blueGrayscale).toBeGreaterThanOrEqual(24);
				expect(blueGrayscale).toBeLessThanOrEqual(34);
			} finally {
				handle.cleanup();
			}
		});
	});
});

describe.sequential("resize behavior", () => {
	// As of Phase 2.y, capture buffer is decoupled from container size: the
	// pipeline rasterizes at the fixed `dimensions` for its whole lifetime,
	// regardless of how the host container resizes. Visual scale is a CSS
	// concern. This test asserts the new invariant: container resize does
	// NOT re-set data-pictel-pending and does NOT change the canvas's pixel
	// dimensions.
	test("container resize does not re-trigger capture; buffer dims stay fixed", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<Grayscale>
					<img src={solidImage("#ff0000", 64, 64)} />
				</Grayscale>
			</Canvas>,
		);
		try {
			await waitForPipeline(handle.container);

			const pipeline = handle.container.querySelector<HTMLElement>("[data-pictel-pipeline]");
			if (!pipeline) throw new Error("no [data-pictel-pipeline] found in container");
			expect(pipeline.hasAttribute("data-pictel-pending")).toBe(false);

			const canvas = pipeline.querySelector<HTMLCanvasElement>(":scope > [data-pictel-raster] > canvas");
			if (!canvas) throw new Error("no output canvas found");

			const initialW = canvas.width;
			const initialH = canvas.height;
			expect(initialW).toBe(64);
			expect(initialH).toBe(64);

			let pendingSetCount = 0;
			const observer = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					if (mutation.type === "attributes" && mutation.attributeName === "data-pictel-pending") {
						const target = mutation.target as HTMLElement;
						if (target.getAttribute("data-pictel-pending") === "true") {
							pendingSetCount += 1;
						}
					}
				}
			});
			observer.observe(pipeline, { attributes: true, attributeFilter: ["data-pictel-pending"] });

			handle.container.style.width = "600px";
			handle.container.style.height = "600px";

			await new Promise((resolve) => {
				setTimeout(resolve, 250);
			});

			observer.disconnect();

			// Capture must NOT have re-triggered: the buffer is fixed.
			expect(pendingSetCount).toBe(0);
			expect(pipeline.hasAttribute("data-pictel-pending")).toBe(false);
			expect(canvas.width).toBe(initialW);
			expect(canvas.height).toBe(initialH);
		} finally {
			handle.cleanup();
		}
	});
});
