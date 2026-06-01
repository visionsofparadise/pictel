import { beforeEach, describe, expect, test } from "vitest";
import { useCallback } from "react";
import { Canvas } from "../../index";
import { clearEffectCache } from "../../effect-cache/effect-cache";
import { RasterEffect, type RasterEffectCallback } from "./RasterEffect";
import { renderCanvas } from "../utils/render-canvas";
import { readPixel, readRasterEffectOutput } from "../utils/read-raster-effect-output";
import { solidImage } from "../utils/test-images";
import { waitForRasterEffect } from "../utils/wait-for-raster-effect";

function getOuterCanvas(container: HTMLElement): HTMLCanvasElement {
	const all = Array.from(container.querySelectorAll<HTMLCanvasElement>("canvas[data-pictel-raster]"));

	if (all.length === 0) throw new Error("no canvas[data-pictel-raster] found in container");

	return all[all.length - 1]!;
}

function invertedCopy(target: ImageData): ImageData {
	const out = new Uint8ClampedArray(target.data.length);

	for (let i = 0; i < target.data.length; i += 4) {
		out[i] = 255 - target.data[i]!;
		out[i + 1] = 255 - target.data[i + 1]!;
		out[i + 2] = 255 - target.data[i + 2]!;
		out[i + 3] = target.data[i + 3]!;
	}

	return new ImageData(out, target.width, target.height);
}

describe.sequential("RasterEffect cache integration", () => {
	beforeEach(async () => {
		await clearEffectCache();
	});

	test("cache hit: identical second mount with same version runs effect once", async () => {
		const callCounter = { count: 0 };
		const src = solidImage("#ff0000", 64, 64);

		function CachedInvert({ children, version }: { children: React.ReactNode; version: string }) {
			const effect = useCallback<RasterEffectCallback>((target) => {
				callCounter.count += 1;

				return { pixels: invertedCopy(target) };
			}, []);

			return (
				<RasterEffect effect={effect} version={version}>
					{children}
				</RasterEffect>
			);
		}

		const first = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<CachedInvert version="invert@1">
					<img src={src} />
				</CachedInvert>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(first.container);

			expect(callCounter.count).toBe(1);

			const firstPixels = readRasterEffectOutput(getOuterCanvas(first.container));
			const [r1, g1, b1] = readPixel(firstPixels, 10, 10);
			expect(r1).toBeLessThanOrEqual(5);
			expect(g1).toBeGreaterThanOrEqual(250);
			expect(b1).toBeGreaterThanOrEqual(250);
		} finally {
			first.cleanup();
		}

		const second = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<CachedInvert version="invert@1">
					<img src={src} />
				</CachedInvert>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(second.container);

			expect(callCounter.count).toBe(1);

			const secondPixels = readRasterEffectOutput(getOuterCanvas(second.container));
			const [r2, g2, b2] = readPixel(secondPixels, 10, 10);
			expect(r2).toBeLessThanOrEqual(5);
			expect(g2).toBeGreaterThanOrEqual(250);
			expect(b2).toBeGreaterThanOrEqual(250);
		} finally {
			second.cleanup();
		}
	});

	test("cache miss on version change: same source, different version runs effect twice", async () => {
		const callCounter = { count: 0 };
		const src = solidImage("#ff0000", 64, 64);

		function CachedInvert({ children, version }: { children: React.ReactNode; version: string }) {
			const effect = useCallback<RasterEffectCallback>((target) => {
				callCounter.count += 1;

				return { pixels: invertedCopy(target) };
			}, []);

			return (
				<RasterEffect effect={effect} version={version}>
					{children}
				</RasterEffect>
			);
		}

		const first = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<CachedInvert version="invert@1">
					<img src={src} />
				</CachedInvert>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(first.container);
			expect(callCounter.count).toBe(1);
		} finally {
			first.cleanup();
		}

		const second = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<CachedInvert version="invert@2">
					<img src={src} />
				</CachedInvert>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(second.container);
			expect(callCounter.count).toBe(2);
		} finally {
			second.cleanup();
		}
	});

	test("cache miss on source change: different source, same version runs effect twice", async () => {
		const callCounter = { count: 0 };
		const srcA = solidImage("#ff0000", 64, 64);
		const srcB = solidImage("#00ff00", 64, 64);

		function CachedInvert({ children, version }: { children: React.ReactNode; version: string }) {
			const effect = useCallback<RasterEffectCallback>((target) => {
				callCounter.count += 1;

				return { pixels: invertedCopy(target) };
			}, []);

			return (
				<RasterEffect effect={effect} version={version}>
					{children}
				</RasterEffect>
			);
		}

		const first = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<CachedInvert version="invert@1">
					<img src={srcA} />
				</CachedInvert>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(first.container);
			expect(callCounter.count).toBe(1);
		} finally {
			first.cleanup();
		}

		const second = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<CachedInvert version="invert@1">
					<img src={srcB} />
				</CachedInvert>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(second.container);
			expect(callCounter.count).toBe(2);
		} finally {
			second.cleanup();
		}
	});

	test("bypass when version undefined: identical second mount runs effect twice", async () => {
		const callCounter = { count: 0 };
		const src = solidImage("#ff0000", 64, 64);

		function UncachedInvert({ children }: { children: React.ReactNode }) {
			const effect = useCallback<RasterEffectCallback>((target) => {
				callCounter.count += 1;

				return { pixels: invertedCopy(target) };
			}, []);

			return <RasterEffect effect={effect}>{children}</RasterEffect>;
		}

		const first = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<UncachedInvert>
					<img src={src} />
				</UncachedInvert>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(first.container);
			expect(callCounter.count).toBe(1);
		} finally {
			first.cleanup();
		}

		const second = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<UncachedInvert>
					<img src={src} />
				</UncachedInvert>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(second.container);
			expect(callCounter.count).toBe(2);
		} finally {
			second.cleanup();
		}
	});
});
