import { describe, expect, test } from "vitest";
import { createSubscriberCache } from "./subscriber-cache";

type Key = readonly [id: string];

function makeCache() {
	const loadCalls: Array<string> = [];
	const disposed: Array<string> = [];
	const cache = createSubscriberCache<{ id: string }, Key>({
		cacheKey: (id) => id,
		load: async (id) => {
			loadCalls.push(id);

			return { id };
		},
		dispose: async (resource) => {
			disposed.push(resource.id);
		},
	});

	return { cache, loadCalls, disposed };
}

function deferred(): { promise: Promise<void>; resolve: () => void } {
	let resolve!: () => void;
	const promise = new Promise<void>((res) => {
		resolve = res;
	});

	return { promise, resolve };
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe("createSubscriberCache", () => {
	test("identical keys share a single in-flight load", async () => {
		const { cache, loadCalls } = makeCache();

		const first = cache.subscribe("model");
		const second = cache.subscribe("model");

		expect(loadCalls).toEqual(["model"]);
		expect(cache.size()).toBe(1);

		const [a, b] = await Promise.all([first.promise, second.promise]);
		expect(a).toBe(b);
	});

	test("disposes only when subscribers and in-flight both reach zero", async () => {
		const { cache, disposed } = makeCache();

		const first = cache.subscribe("model");
		const second = cache.subscribe("model");
		await first.promise;

		first.unsubscribe();
		await flush();
		expect(disposed).toEqual([]);
		expect(cache.size()).toBe(1);

		second.unsubscribe();
		await flush();
		expect(disposed).toEqual(["model"]);
		expect(cache.size()).toBe(0);
	});

	test("defers disposal while a track call is in flight, then disposes", async () => {
		const { cache, disposed } = makeCache();

		const sub = cache.subscribe("model");
		await sub.promise;

		const gate = deferred();
		const trackPromise = cache.track(["model"], async () => {
			await gate.promise;

			return 42;
		});
		await Promise.resolve();

		sub.unsubscribe();
		expect(disposed).toEqual([]);
		expect(cache.size()).toBe(1);

		gate.resolve();
		expect(await trackPromise).toBe(42);
		await flush();
		expect(disposed).toEqual(["model"]);
		expect(cache.size()).toBe(0);
	});

	test("re-subscribing before deferred disposal cancels the disposal", async () => {
		const { cache, disposed, loadCalls } = makeCache();

		const sub = cache.subscribe("model");
		await sub.promise;

		const gate = deferred();
		const trackPromise = cache.track(["model"], async () => {
			await gate.promise;

			return 1;
		});
		await Promise.resolve();

		sub.unsubscribe();
		const resubscribed = cache.subscribe("model");
		expect(loadCalls).toEqual(["model"]);

		gate.resolve();
		await trackPromise;
		await flush();
		expect(disposed).toEqual([]);
		expect(cache.size()).toBe(1);

		resubscribed.unsubscribe();
		await flush();
		expect(disposed).toEqual(["model"]);
	});

	test("size() reflects distinct live keys with dedupe and release accounting", async () => {
		const { cache } = makeCache();

		expect(cache.size()).toBe(0);

		const a = cache.subscribe("m1");
		const b = cache.subscribe("m2");
		const c = cache.subscribe("m1");
		expect(cache.size()).toBe(2);

		await Promise.all([a.promise, b.promise, c.promise]);

		a.unsubscribe();
		await flush();
		expect(cache.size()).toBe(2);

		c.unsubscribe();
		await flush();
		expect(cache.size()).toBe(1);

		b.unsubscribe();
		await flush();
		expect(cache.size()).toBe(0);
	});
});
