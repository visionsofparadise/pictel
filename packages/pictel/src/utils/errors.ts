export interface PipelineError {
	readonly id: string;
	readonly error: Error;
	readonly timestamp: number;
}

export function createPipelineError(id: string, error: unknown): PipelineError {
	return {
		id,
		error: error instanceof Error ? error : new Error(String(error)),
		timestamp: Date.now(),
	};
}
