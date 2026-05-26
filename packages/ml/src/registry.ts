import { pipeline as loadPipeline, type Pipeline, type PipelineType } from "@huggingface/transformers"
import { createSubscriberCache } from "./subscriber-cache"

type PipelineKey = readonly [task: PipelineType, model: string, revision: string]

const cache = createSubscriberCache<Pipeline, PipelineKey>({
	cacheKey: (task, model, revision) => `${task}:${model}:${revision}`,
	load: (task, model, revision) =>
		(loadPipeline as (task: string, model: string, options: object) => Promise<Pipeline>)(
			task,
			model,
			{ device: "webgpu", revision },
		),
	dispose: async (pipe) => {
		await pipe.dispose()
	},
})

/**
 * Resolve a Transformers.js pipeline, deduplicated by `(task, model, revision)`.
 *
 * The returned promise is not subscriber-tracked — it is for one-off callers (tests,
 * direct API users). Mounted React components must use `subscribePipeline` so the
 * pipeline is disposed when no component is using it.
 */
export function getOrLoadPipeline(task: PipelineType, model: string, revision: string): Promise<Pipeline> {
	const { promise, unsubscribe } = cache.subscribe(task, model, revision)

	// One-off callers don't manage subscriptions. Release immediately; if no other
	// subscriber exists, the cache schedules disposal once all in-flight calls drain.
	unsubscribe()

	return promise
}

/**
 * Subscribe a mounted component to a Transformers.js pipeline. Returns a promise
 * for the pipeline and an `unsubscribe` callback for the component's cleanup. When
 * the subscriber count for the `(task, model, revision)` key reaches zero and no
 * `runPipeline` call is in flight, the pipeline is disposed and the cache entry is
 * removed.
 */
export function subscribePipeline(task: PipelineType, model: string, revision: string): {
	promise: Promise<Pipeline>
	unsubscribe: () => void
} {
	return cache.subscribe(task, model, revision)
}

/**
 * Bracket an inference call so the pipeline is not disposed mid-flight. Increments
 * an in-flight count for the cache entry; if `unsubscribe` is called during the
 * inference, disposal is deferred until this call settles.
 */
export async function runPipeline<R>(
	task: PipelineType,
	model: string,
	revision: string,
	runner: (pipe: Pipeline) => Promise<R>,
): Promise<R> {
	return cache.track([task, model, revision], runner)
}

export async function disposePipeline(task: PipelineType, model: string, revision: string): Promise<void> {
	await cache.dispose(task, model, revision)
}
