import shaderSrc from "./separable-blur-gpu.wgsl?raw"

// Shared GPU separable-blur infrastructure. Per design-performance.md
// "GPU effects" → "A shared separable-convolution shader backing Blur,
// DropShadow, Bloom, Outline, and ShockFilter."
//
// API choice: callers own the WebGPU `device` and the input textures. The
// helper builds a per-call pipeline (cheap — pipelines reuse the device's
// shader cache) and two ping-pong scratch textures per input, then returns
// the final scratch texture for each input. The caller is responsible for
// destroying both the returned textures and (separately) the helper's
// internal scratch textures.
//
// This shape — input textures rather than ImageData — lets consumers chain
// without readback: ShockFilter blurs once per iteration, reads the result
// straight into the next compute pass, and only reads back to CPU at the
// end of the iteration loop. CPU peers that already have ImageData wrap a
// thin `applyXyzGpu(pixels: ImageData)` around this helper.
//
// "Multi-channel" means N independent rgba8unorm textures, all processed by
// the same pipeline in sequence (each via its own bind groups). This is
// useful for ShockFilter's three-channel smoothing pass — pack each
// channel into the red plane of a separate rgba8unorm texture, or just
// keep one full rgba texture per input. The helper doesn't care.

export interface SeparableBlurInput {
	texture: GPUTexture
	view: GPUTextureView
}

export interface SeparableBlurGpuOptions {
	iterations?: number
}

interface PipelineBundle {
	bindGroupLayout: GPUBindGroupLayout
	horizontal: GPUComputePipeline
	vertical: GPUComputePipeline
}

function buildPipelines(device: GPUDevice): PipelineBundle {
	const module = device.createShaderModule({ code: shaderSrc })

	const bindGroupLayout = device.createBindGroupLayout({
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.COMPUTE,
				texture: { sampleType: "float" },
			},
			{
				binding: 1,
				visibility: GPUShaderStage.COMPUTE,
				storageTexture: { access: "write-only", format: "rgba8unorm" },
			},
			{
				binding: 2,
				visibility: GPUShaderStage.COMPUTE,
				buffer: { type: "uniform" },
			},
		],
	})

	const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] })

	const horizontal = device.createComputePipeline({
		layout: pipelineLayout,
		compute: { module, entryPoint: "horizontal" },
	})

	const vertical = device.createComputePipeline({
		layout: pipelineLayout,
		compute: { module, entryPoint: "vertical" },
	})

	return { bindGroupLayout, horizontal, vertical }
}

function createScratchTexture(device: GPUDevice, width: number, height: number): GPUTexture {
	return device.createTexture({
		size: { width, height },
		format: "rgba8unorm",
		// TEXTURE_BINDING — read as texture_2d<f32> in subsequent passes.
		// STORAGE_BINDING — write as storage in this pass.
		// COPY_SRC — caller can read back to CPU via copyTextureToBuffer.
		usage:
			GPUTextureUsage.TEXTURE_BINDING |
			GPUTextureUsage.STORAGE_BINDING |
			GPUTextureUsage.COPY_SRC,
	})
}

const WORKGROUP_SIZE = 8

/**
 * Run a separable box blur on `inputs` and return one output texture per
 * input. Each input is blurred independently; the helper doesn't fuse across
 * inputs (one input is already a four-channel RGBA bundle).
 *
 * `iterations` defaults to 1 — one horizontal + one vertical pass. Higher
 * values run the same radius back-to-back without CPU intervention; CPU peers
 * that ship a Gaussian approximation as three box-pass calls at three
 * different radii (see `Effects/Blur.tsx::boxRadiiForGaussian`) should call
 * this helper three times instead of using `iterations`. ShockFilter's
 * smoothing pass is the natural `iterations` consumer if its outer iteration
 * stays GPU-resident; the iterations parameter exists for that case.
 *
 * The returned textures are scratch buffers owned by the helper; the caller
 * is responsible for destroying them. Inputs are not consumed — they remain
 * usable after the call (the first horizontal pass reads from them only).
 */
export async function applySeparableBlurGpu(
	inputs: ReadonlyArray<SeparableBlurInput>,
	radius: number,
	device: GPUDevice,
	{ iterations = 1 }: SeparableBlurGpuOptions = {},
): Promise<Array<GPUTexture>> {
	if (inputs.length === 0) {
		return []
	}

	const roundedRadius = Math.round(radius)

	if (roundedRadius <= 0) {
		throw new Error(`applySeparableBlurGpu: radius must round to >= 1 (got ${String(radius)})`)
	}

	const passes = Math.max(1, Math.floor(iterations))

	// All inputs must agree on dimensions (the uniform is shared per call).
	// Validate before touching the device so the contract surfaces in unit
	// tests that pass stub textures without a real GPU device.
	const firstInput = inputs[0]

	if (firstInput === undefined) {
		return []
	}

	const width = firstInput.texture.width
	const height = firstInput.texture.height

	if (
		inputs.some(
			(entry) => entry.texture.width !== width || entry.texture.height !== height,
		)
	) {
		throw new Error("applySeparableBlurGpu: all inputs must share dimensions")
	}

	const pipelines = buildPipelines(device)

	// Uniform buffer is the same across every dispatch in this call.
	const uniformBuffer = device.createBuffer({
		size: 16,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	})
	const uniformData = new ArrayBuffer(16)
	const uniformInts = new Int32Array(uniformData)
	uniformInts[0] = roundedRadius
	uniformInts[1] = width
	uniformInts[2] = height
	uniformInts[3] = 0
	device.queue.writeBuffer(uniformBuffer, 0, uniformData)

	const dispatchX = Math.ceil(width / WORKGROUP_SIZE)
	const dispatchY = Math.ceil(height / WORKGROUP_SIZE)

	const encoder = device.createCommandEncoder()
	const outputs: Array<GPUTexture> = []
	// Track scratch textures we allocated so the caller doesn't accidentally
	// double-free; the SECOND scratch (final result) is returned, the FIRST is
	// destroyed at end of call.
	const intermediates: Array<GPUTexture> = []

	for (const input of inputs) {
		// Two scratch textures act as a fixed write target pair: every
		// horizontal pass writes into scratchA, every vertical pass writes into
		// scratchB. For multi-iteration the next H pass reads from scratchB (the
		// prior V output) and writes back to scratchA — different buffers, no
		// W-while-R aliasing. The next V then re-writes scratchB; W-after-R on
		// the same buffer is fine because the prior H pass already finished
		// reading by the time V's write dispatches (WebGPU's encoder inserts
		// the dependency barrier between passes).
		const scratchA = createScratchTexture(device, width, height)
		const scratchB = createScratchTexture(device, width, height)

		let srcView = input.view

		for (let pass = 0; pass < passes; pass++) {
			// Horizontal: srcView → scratchA
			const horizontalBindGroup = device.createBindGroup({
				layout: pipelines.bindGroupLayout,
				entries: [
					{ binding: 0, resource: srcView },
					{ binding: 1, resource: scratchA.createView() },
					{ binding: 2, resource: { buffer: uniformBuffer } },
				],
			})

			const hPass = encoder.beginComputePass()
			hPass.setPipeline(pipelines.horizontal)
			hPass.setBindGroup(0, horizontalBindGroup)
			hPass.dispatchWorkgroups(dispatchX, dispatchY)
			hPass.end()

			// Vertical: scratchA → scratchB
			const verticalBindGroup = device.createBindGroup({
				layout: pipelines.bindGroupLayout,
				entries: [
					{ binding: 0, resource: scratchA.createView() },
					{ binding: 1, resource: scratchB.createView() },
					{ binding: 2, resource: { buffer: uniformBuffer } },
				],
			})

			const vPass = encoder.beginComputePass()
			vPass.setPipeline(pipelines.vertical)
			vPass.setBindGroup(0, verticalBindGroup)
			vPass.dispatchWorkgroups(dispatchX, dispatchY)
			vPass.end()

			if (pass < passes - 1) {
				// Next iteration reads from scratchB (just written) and writes
				// into scratchA — distinct buffers. Don't swap the variable
				// bindings; only update srcView.
				srcView = scratchB.createView()
			}
		}

		outputs.push(scratchB)
		intermediates.push(scratchA)
	}

	device.queue.submit([encoder.finish()])

	// Wait for the GPU to finish; mapping a tiny readback buffer is the
	// portable way to know all submitted work has completed. The caller will
	// typically copyTextureToBuffer the outputs, and that copy is encoded
	// in a fresh encoder anyway, so we can return as soon as the queue
	// commands are submitted. But to honor the `Promise<GPUTexture[]>`
	// contract semantically — completion-implies-readable — we await
	// `onSubmittedWorkDone`.
	await device.queue.onSubmittedWorkDone()

	// Clean up scratch buffers we didn't return.
	for (const intermediate of intermediates) {
		intermediate.destroy()
	}

	uniformBuffer.destroy()

	return outputs
}
