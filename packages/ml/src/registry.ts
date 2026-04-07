import { pipeline as loadPipeline, type Pipeline, type PipelineType } from "@huggingface/transformers"

const loading = new Map<string, Promise<Pipeline>>()

function cacheKey(task: string, model: string, revision: string): string {
	return `${task}:${model}:${revision}`
}

export function getOrLoadPipeline(task: PipelineType, model: string, revision: string): Promise<Pipeline> {
	const existing = loading.get(cacheKey(task, model, revision))

	if (existing) return existing

	const promise = (loadPipeline as (task: string, model: string, options: object) => Promise<Pipeline>)(
		task,
		model,
		{ device: "webgpu", revision },
	)
	loading.set(cacheKey(task, model, revision), promise)

	return promise
}

export async function disposePipeline(task: PipelineType, model: string, revision: string): Promise<void> {
	const promise = loading.get(cacheKey(task, model, revision))

	if (!promise) return

	loading.delete(cacheKey(task, model, revision))
	const resolved = await promise
	await resolved.dispose()
}
