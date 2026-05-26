import { describe, expect, test } from "vitest";
import { StrictMode, useEffect } from "react";
import { Canvas, useCanvasContext } from "../../index";
import { Brightness, Grayscale, Invert, Multiply } from "@pictel/effects";
import { createRasterEffectError } from "../RasterEffect/Error";
import { renderCanvas } from "../utils/render-canvas";
import { readRasterEffectOutput, readPixel } from "../utils/read-raster-effect-output";
import { gradientImage, solidImage } from "../utils/test-images";
import { waitForRasterEffect } from "../utils/wait-for-raster-effect";

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

function getCanvas(container: HTMLElement): HTMLCanvasElement {
	const canvas = container.querySelector<HTMLCanvasElement>("canvas[data-pictel-raster]");
	if (!canvas) throw new Error("no canvas[data-pictel-raster] found in container");

	return canvas;
}

function getOuterCanvas(container: HTMLElement): HTMLCanvasElement {
	const all = Array.from(
		container.querySelectorAll<HTMLCanvasElement>("canvas[data-pictel-raster]"),
	);
	if (all.length === 0) throw new Error("no canvas[data-pictel-raster] found in container");
	if (all.length === 1) return all[0]!;

	for (const candidate of all) {
		const prev = candidate.previousElementSibling;
		if (prev instanceof HTMLElement && prev.querySelector("canvas[data-pictel-raster]") !== null) {
			return candidate;
		}
	}

	throw new Error("could not determine outer raster canvas");
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
				await waitForRasterEffect(handle.container);
				const img = handle.container.querySelector("img");
				expect(img).not.toBeNull();
				const raster = handle.container.querySelector("canvas[data-pictel-raster]");
				expect(raster).toBeNull();
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
				await waitForRasterEffect(handle.container);
				const canvas = getCanvas(handle.container);
				const pixels = readRasterEffectOutput(canvas);
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
				await waitForRasterEffect(handle.container);
				const canvas = getCanvas(handle.container);
				const pixels = readRasterEffectOutput(canvas);
				// Sample away from gradient edges — inline-baseline (36px vs 32px capture) shifts boundaries by 5–8px at extremes.
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
				await waitForRasterEffect(handle.container);
				const outer = getOuterCanvas(handle.container);
				const pixels = readRasterEffectOutput(outer);
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
					<Brightness
						mode="parameter"
						amount={1.5}
						map={<img src={solidImage("#808080", 64, 64)} />}
					>
						<img src={solidImage("#808080", 64, 64)} />
					</Brightness>
				</Canvas>,
			);
			try {
				await waitForRasterEffect(handle.container);
				const canvas = getCanvas(handle.container);
				const pixels = readRasterEffectOutput(canvas);
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

	test("level 7: multiply red over green", async () => {
		await ladder(7)(async () => {
			const handle = renderCanvas(
				<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
					<Multiply apply={<img src={solidImage("#00ff00", 100, 100)} style={{ display: "block" }} />}>
						<img
							src={solidImage("#ff0000", 100, 100)}
							style={{ display: "block" }}
						/>
					</Multiply>
				</Canvas>,
			);
			try {
				await waitForRasterEffect(handle.container);
				const canvas = getCanvas(handle.container);
				const pixels = readRasterEffectOutput(canvas);
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
				await waitForRasterEffect(handle1.container);
				const canvas = getCanvas(handle1.container);
				const pixels = readRasterEffectOutput(canvas);
				const [red] = readPixel(pixels, 10, 10);
				expect(red).toBeGreaterThanOrEqual(74);
				expect(red).toBeLessThanOrEqual(78);
			} finally {
				handle1.cleanup();
			}

			const handle4 = renderCanvas(
				<StrictMode>
					<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
						<Brightness
							mode="parameter"
							amount={1.5}
							map={<img src={solidImage("#808080", 64, 64)} />}
						>
							<img src={solidImage("#808080", 64, 64)} />
						</Brightness>
					</Canvas>
				</StrictMode>,
			);
			try {
				await waitForRasterEffect(handle4.container);
				const canvas = getCanvas(handle4.container);
				const pixels = readRasterEffectOutput(canvas);
				const [red] = readPixel(pixels, 10, 10);
				expect(red).toBeGreaterThanOrEqual(150);
				expect(red).toBeLessThanOrEqual(170);
			} finally {
				handle4.cleanup();
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
				await waitForRasterEffect(handle.container);
				const canvas = getCanvas(handle.container);
				const pixels = readRasterEffectOutput(canvas);
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
				await waitForRasterEffect(handle.container);
				const canvas = getCanvas(handle.container);
				const pixels = readRasterEffectOutput(canvas);
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
	test("container resize does not re-trigger capture; buffer dims stay fixed", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<Grayscale>
					<img src={solidImage("#ff0000", 64, 64)} />
				</Grayscale>
			</Canvas>,
		);
		try {
			await waitForRasterEffect(handle.container);

			const canvasRoot = handle.container.querySelector<HTMLElement>("[data-pictel-canvas]");
			if (!canvasRoot) throw new Error("no [data-pictel-canvas] found in container");
			expect(canvasRoot.hasAttribute("data-pictel-pending")).toBe(false);

			const canvas = getCanvas(handle.container);

			const initialW = canvas.width;
			const initialH = canvas.height;
			expect(initialW).toBe(64);
			expect(initialH).toBe(64);

			let pendingSetCount = 0;
			const observer = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					if (mutation.type === "attributes" && mutation.attributeName === "data-pictel-pending") {
						const target = mutation.target as HTMLElement;
						if (target.hasAttribute("data-pictel-pending")) {
							pendingSetCount += 1;
						}
					}
				}
			});
			observer.observe(canvasRoot, { attributes: true, attributeFilter: ["data-pictel-pending"] });

			handle.container.style.width = "600px";
			handle.container.style.height = "600px";

			await new Promise((resolve) => {
				setTimeout(resolve, 250);
			});

			observer.disconnect();

			expect(pendingSetCount).toBe(0);
			expect(canvasRoot.hasAttribute("data-pictel-pending")).toBe(false);
			expect(canvas.width).toBe(initialW);
			expect(canvas.height).toBe(initialH);
		} finally {
			handle.cleanup();
		}
	});
});

function waitForElement(
	container: HTMLElement,
	selector: string,
	options: { timeout?: number } = {},
): Promise<HTMLElement> {
	const timeout = options.timeout ?? 5000;

	return new Promise((resolve, reject) => {
		const start = performance.now();
		function check(): void {
			const element = container.querySelector<HTMLElement>(selector);
			if (element) {
				resolve(element);

				return;
			}
			if (performance.now() - start > timeout) {
				reject(new Error(`waitForElement timed out waiting for ${selector}`));

				return;
			}
			requestAnimationFrame(check);
		}
		requestAnimationFrame(check);
	});
}

// reportError fires from a mount effect — the attribute lands a frame after the initial commit.
function waitForAttribute(
	element: HTMLElement,
	name: string,
	options: { timeout?: number } = {},
): Promise<void> {
	const timeout = options.timeout ?? 5000;

	return new Promise((resolve, reject) => {
		const start = performance.now();
		function check(): void {
			if (element.hasAttribute(name)) {
				resolve();

				return;
			}
			if (performance.now() - start > timeout) {
				reject(new Error(`waitForAttribute timed out waiting for ${name}`));

				return;
			}
			requestAnimationFrame(check);
		}
		requestAnimationFrame(check);
	});
}

function ErrorReporter() {
	const { reportError } = useCanvasContext();
	useEffect(() => {
		reportError(createRasterEffectError("test", new Error("boom")));
	}, [reportError]);

	return null;
}

describe.sequential("render-mode query contract", () => {
	test("?canvasWidth=/?canvasHeight= override the dimensions prop in render mode", async () => {
		window.history.replaceState(null, "", "/?canvasWidth=96&canvasHeight=48");
		const handle = renderCanvas(
			<Canvas mode="render" dimensions={{ width: 64, height: 64 }}>
				<Grayscale>
					<img src={solidImage("#ff0000", 64, 64)} />
				</Grayscale>
			</Canvas>,
		);
		try {
			await waitForRasterEffect(handle.container);
			const canvas = getCanvas(handle.container);
			expect(canvas.width).toBe(96);
			expect(canvas.height).toBe(48);
		} finally {
			handle.cleanup();
			window.history.replaceState(null, "", "/");
		}
	});

	test("data-pictel-error is present in render mode when an error is reported", async () => {
		const handle = renderCanvas(
			<Canvas mode="render" dimensions={{ width: 64, height: 64 }}>
				<ErrorReporter />
			</Canvas>,
		);
		try {
			const root = await waitForElement(handle.container, "[data-pictel-canvas]");
			await waitForAttribute(root, "data-pictel-error");
			const parsed = JSON.parse(root.getAttribute("data-pictel-error") ?? "[]") as Array<{
				id: string;
				message: string;
			}>;
			expect(parsed).toEqual([{ id: "test", message: "boom" }]);
		} finally {
			handle.cleanup();
		}
	});

	test("data-pictel-error is absent in render mode when no error is reported", async () => {
		const handle = renderCanvas(
			<Canvas mode="render" dimensions={{ width: 64, height: 64 }}>
				<Grayscale>
					<img src={solidImage("#ff0000", 64, 64)} />
				</Grayscale>
			</Canvas>,
		);
		try {
			await waitForRasterEffect(handle.container);
			const root = handle.container.querySelector<HTMLElement>("[data-pictel-canvas]");
			if (!root) throw new Error("no [data-pictel-canvas] root found");
			expect(root.hasAttribute("data-pictel-error")).toBe(false);
		} finally {
			handle.cleanup();
		}
	});
});
