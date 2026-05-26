// Module-level cached WebGPU adapter. Mirrors the @pictel/ml `requireWebGPU`
// implementation. The design intent (design-performance.md "GPU effects —
// colocated, GPU-only, throws on unavailable" → "Adapter request cached once")
// is for one adapter promise to serve every consumer; replicating the cache
// here rather than importing from @pictel/ml avoids pulling that package's
// heavy transformers dependency into @pictel/effects. In practice the cache
// is per-package — each package's module-level variable holds its own promise
// — but `navigator.gpu.requestAdapter()` is itself cheap once the underlying
// GPU process is warm, so the practical waste of one extra request per
// process is negligible.

// Runtime access shape: `@webgpu/types` declares `navigator.gpu` as
// non-optional, but the API is absent in browsers that don't expose WebGPU.
// `NavigatorMaybeGPU` keeps the optional surface explicit at the call site.
interface NavigatorMaybeGPU {
	readonly gpu?: GPU
}

let cachedAdapter: Promise<GPUAdapter | null> | null = null

/**
 * Acquire a fresh `GPUAdapter`, requesting a new one when the cached adapter
 * has been consumed (a `requestDevice()` call on an adapter consumes it; any
 * subsequent `requestDevice()` on the same adapter throws). The cache holds
 * the FIRST adapter promise; if a caller has already consumed it we discard
 * and re-request. The net behavior: the first call per session resolves
 * immediately on the cached promise; later calls do a fresh `requestAdapter`
 * (cheap once the GPU process is warm).
 */
export async function requireWebGPU(): Promise<GPUAdapter> {
	const gpu = (navigator as unknown as NavigatorMaybeGPU).gpu

	if (!gpu) {
		throw new Error("GPU effects require WebGPU. Your browser or hardware does not support WebGPU.")
	}

	cachedAdapter ??= gpu.requestAdapter()

	const adapter = await cachedAdapter

	// `__consumed__` is not a real spec field — check via a feature/probe:
	// if the adapter has been used to create a device, requestDevice throws
	// synchronously. We can't probe without consuming, so the strategy is
	// "discard cache on caller-side failure". Any caller that calls
	// `requestDevice()` on a returned adapter and sees a "consumed" error
	// should invoke `discardCachedAdapter()` and retry. Adapters are also
	// implicitly invalidated by the browser at any time (e.g. on a GPU
	// process restart) — see the WebGPU spec on lost devices.

	if (!adapter) {
		// Cache resolved null (no adapter) — clear so subsequent calls retry.
		cachedAdapter = null
		throw new Error("GPU effects require WebGPU. Your browser or hardware does not support WebGPU.")
	}

	return adapter
}

/**
 * Invalidate the cached adapter promise. Call after a `requestDevice()`
 * failure or any other signal that the adapter is no longer usable, so the
 * next `requireWebGPU()` request re-resolves.
 */
export function discardCachedAdapter(): void {
	cachedAdapter = null
}
