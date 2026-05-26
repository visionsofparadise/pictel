declare global {
	interface Navigator {
		readonly gpu?: GPU
	}

	interface GPU {
		requestAdapter(): Promise<GPUAdapter | null>
	}


	interface GPUAdapter {}
}

let cachedAdapter: Promise<GPUAdapter | null> | null = null

export async function requireWebGPU(): Promise<GPUAdapter> {
	if (!navigator.gpu) {
		throw new Error("ML effects require WebGPU. Your browser or hardware does not support WebGPU.")
	}

	cachedAdapter ??= navigator.gpu.requestAdapter()

	const adapter = await cachedAdapter

	if (!adapter) {
		throw new Error("ML effects require WebGPU. Your browser or hardware does not support WebGPU.")
	}

	return adapter
}
