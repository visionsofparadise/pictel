export interface RasterEffectError {
	readonly id: string;
	readonly error: Error;
	readonly timestamp: number;
}

export function createRasterEffectError(id: string, error: unknown): RasterEffectError {
	return {
		id,
		error: error instanceof Error ? error : new Error(String(error)),
		timestamp: Date.now(),
	};
}
