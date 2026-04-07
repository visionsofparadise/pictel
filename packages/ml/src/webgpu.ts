declare global {
	interface Navigator {
		readonly gpu?: GPU
	}

	interface GPU {
		requestAdapter(): Promise<GPUAdapter | null>
	}

	 
	interface GPUAdapter {}
}

export async function requireWebGPU(): Promise<void> {
	if (!navigator.gpu) {
		throw new Error("ML effects require WebGPU. Your browser or hardware does not support WebGPU.")
	}

	const adapter = await navigator.gpu.requestAdapter()

	if (!adapter) {
		throw new Error("ML effects require WebGPU. Your browser or hardware does not support WebGPU.")
	}
}
