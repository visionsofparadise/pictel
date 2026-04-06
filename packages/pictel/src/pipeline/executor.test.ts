import { describe, it, expect, vi, beforeEach } from "vitest";
import { executePipeline, type ObserverControl, type CaptureContext } from "./executor";
import type { EffectNode } from "./graph";
import type { CaptureCache } from "./capture";
import type { MaskState } from "./masking";
import type { StackingOrder } from "./stacking";
import type { PipelineState } from "./state";

const mockCaptureChildren = vi.fn();
const mockCaptureBehind = vi.fn();
const mockApplyCutout = vi.fn();
const mockGetElementsBehind = vi.fn().mockReturnValue([]);

vi.mock("./capture", () => ({
	captureChildren: (...args: Array<unknown>) => mockCaptureChildren(...args),
	captureBehind: (...args: Array<unknown>) => mockCaptureBehind(...args),
}));

vi.mock("./masking", () => ({
	applyCutout: (...args: Array<unknown>) => mockApplyCutout(...args),
}));

vi.mock("./stacking", () => ({
	getElementsBehind: (...args: Array<unknown>) => mockGetElementsBehind(...args),
}));

function createMockImageData(tag: string): ImageData {
	return { _tag: tag, data: new Uint8ClampedArray([255, 0, 0, 255]), width: 1, height: 1 } as unknown as ImageData;
}

function createMockStackingOrder(): StackingOrder {
	return { order: [], indexOf: new Map() };
}

function createNode(
	id: string,
	type: "raster" | "composite",
	effect: (...args: Array<unknown>) => void | Promise<void>,
	dependsOn: Array<string> = [],
): EffectNode {
	return {
		registration: {
			id,
			ref: { current: { tagName: "DIV", getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) }) } as unknown as HTMLElement },
			type,
			effect,
		},
		dependsOn,
	};
}

function createMockMaskState(): MaskState {
	return { tracked: new Map(), svgContainer: null, canvasRect: null };
}

function createMockPipelineState(): PipelineState {
	return {
		stackingOrder: createMockStackingOrder(),
		rects: new Map(),
		maskState: createMockMaskState(),
	};
}

function createMockCaptureContext(): CaptureContext {
	return {
		canvasRoot: { tagName: "DIV" } as unknown as HTMLElement,
		captureDimensions: null,
		cache: new Map() as CaptureCache,
	};
}

describe("executePipeline", () => {
	let state: PipelineState;
	let capture: CaptureContext;
	let mockObserver: ObserverControl;
	const childrenData = createMockImageData("children");
	const behindData = createMockImageData("behind");

	beforeEach(() => {
		vi.clearAllMocks();
		state = createMockPipelineState();
		capture = createMockCaptureContext();
		mockObserver = { disconnect: vi.fn(), reconnect: vi.fn() };
		mockCaptureChildren.mockResolvedValue(childrenData);
		mockCaptureBehind.mockResolvedValue(behindData);
		mockGetElementsBehind.mockReturnValue([]);
	});

	it("calls raster effect callback with captured ImageData", async () => {
		const effect = vi.fn();
		const node = createNode("r1", "raster", effect);

		const errors = await executePipeline([[node]], state, capture, mockObserver);

		expect(errors).toHaveLength(0);
		expect(effect).toHaveBeenCalledWith(childrenData);
	});

	it("calls composite effect callback with self and behind ImageData", async () => {
		const effect = vi.fn();
		const node = createNode("c1", "composite", effect);

		const errors = await executePipeline([[node]], state, capture, mockObserver);

		expect(errors).toHaveLength(0);
		expect(effect).toHaveBeenCalledWith(childrenData, behindData);
	});

	it("runs effects in the same level concurrently", async () => {
		const order: Array<string> = [];
		const effect1 = vi.fn(async () => {
			order.push("start-1");
			await Promise.resolve();
			order.push("end-1");
		});
		const effect2 = vi.fn(async () => {
			order.push("start-2");
			await Promise.resolve();
			order.push("end-2");
		});

		const node1 = createNode("r1", "raster", effect1);
		const node2 = createNode("r2", "raster", effect2);

		await executePipeline([[node1, node2]], state, capture, mockObserver);

		// Both start before either ends (concurrent execution via Promise.all)
		expect(order.indexOf("start-1")).toBeLessThan(order.indexOf("end-2"));
		expect(order.indexOf("start-2")).toBeLessThan(order.indexOf("end-1"));
	});

	it("skips downstream dependents when upstream fails", async () => {
		const failEffect = vi.fn(() => {
			throw new Error("upstream failure");
		});
		const downstreamEffect = vi.fn();

		const upstreamNode = createNode("r1", "raster", failEffect);
		const downstreamNode = createNode("r2", "raster", downstreamEffect, ["r1"]);

		const errors = await executePipeline([[upstreamNode], [downstreamNode]], state, capture, mockObserver);

		expect(errors).toHaveLength(1);
		expect(errors[0]!.id).toBe("r1");
		expect(downstreamEffect).not.toHaveBeenCalled();
	});

	it("returns empty error array when all effects succeed", async () => {
		const node1 = createNode("r1", "raster", vi.fn());
		const node2 = createNode("r2", "raster", vi.fn());

		const errors = await executePipeline([[node1, node2]], state, capture, mockObserver);

		expect(errors).toEqual([]);
	});
});
