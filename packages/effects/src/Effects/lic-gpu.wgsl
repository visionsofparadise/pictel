// LIC compute shader. Per pixel: trace forward + backward streamlines through
// a Direction-packed field texture, accumulating a weighted average of seed
// samples. The CPU peer (Effects/LIC.tsx applyLIC) does the same integration
// but pays for software bilinear sampling on every step (~80 lookups +
// arithmetic per pixel at length=20). Here `textureSampleLevel(seed, sampler,
// pos)` is hardware bilinear — one tap per sample, parallelized per workgroup
// thread.
//
// Direction encoding (matches Effects/Sobel/Direction):
//   R = (cos θ + 1) * 127.5
//   G = (sin θ + 1) * 127.5
//   B = magnitude * 255
//
// Weight ramp: weight = 1 - step / length, shared between forward and
// backward halves. Boundary handling: clamp-to-edge sampler — samples that
// walk off the edge return edge-pixel values, matching the CPU peer.

struct Params {
	width: u32,
	height: u32,
	length: u32,
	stepSize: f32,
	uniformStep: u32, // 0 or 1
	_pad: u32,
}

@group(0) @binding(0) var seedTex: texture_2d<f32>;
@group(0) @binding(1) var fieldTex: texture_2d<f32>;
@group(0) @binding(2) var linearSampler: sampler;
@group(0) @binding(3) var outputTex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(4) var<uniform> params: Params;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
	let x = gid.x;
	let y = gid.y;

	if (x >= params.width || y >= params.height) {
		return;
	}

	let width = f32(params.width);
	let height = f32(params.height);

	// Convert pixel-space coords to UV-space [0,1]. Texel centers at +0.5.
	let invWidth = 1.0 / width;
	let invHeight = 1.0 / height;

	let centerUV = vec2<f32>((f32(x) + 0.5) * invWidth, (f32(y) + 0.5) * invHeight);

	// Read the seed center pixel once via textureLoad so we can fall back to
	// it if weightSum is zero (matches the CPU peer's degenerate-field path).
	let centerSeed = textureLoad(seedTex, vec2<i32>(i32(x), i32(y)), 0);

	var accumR: f32 = 0.0;
	var accumG: f32 = 0.0;
	var accumB: f32 = 0.0;
	var weightSum: f32 = 0.0;

	let lengthI = params.length;
	let lengthF = f32(lengthI);
	let uniformStep = params.uniformStep != 0u;
	let stepSize = params.stepSize;

	// Forward integration. Mirror the CPU peer: integrate field at the
	// current position via bilinear, step, sample seed at the new position.
	var fwdPos = vec2<f32>(f32(x) + 0.5, f32(y) + 0.5);

	for (var step: u32 = 0u; step < lengthI; step = step + 1u) {
		let fwdUV = vec2<f32>(fwdPos.x * invWidth, fwdPos.y * invHeight);
		let fieldSample = textureSampleLevel(fieldTex, linearSampler, fwdUV, 0.0);
		let cosT = fieldSample.r * 2.0 - 1.0;
		let sinT = fieldSample.g * 2.0 - 1.0;
		let mag = fieldSample.b;
		var stepLen = stepSize;

		if (!uniformStep) {
			stepLen = stepSize * (0.25 + 0.75 * mag);
		}

		fwdPos.x = fwdPos.x + cosT * stepLen;
		fwdPos.y = fwdPos.y + sinT * stepLen;

		let seedUV = vec2<f32>(fwdPos.x * invWidth, fwdPos.y * invHeight);
		let seedSample = textureSampleLevel(seedTex, linearSampler, seedUV, 0.0);
		let weight = 1.0 - f32(step) / lengthF;
		accumR = accumR + seedSample.r * weight;
		accumG = accumG + seedSample.g * weight;
		accumB = accumB + seedSample.b * weight;
		weightSum = weightSum + weight;
	}

	// Backward integration. Same loop, negated step direction.
	var bwdPos = vec2<f32>(f32(x) + 0.5, f32(y) + 0.5);

	for (var step: u32 = 0u; step < lengthI; step = step + 1u) {
		let bwdUV = vec2<f32>(bwdPos.x * invWidth, bwdPos.y * invHeight);
		let fieldSample = textureSampleLevel(fieldTex, linearSampler, bwdUV, 0.0);
		let cosT = fieldSample.r * 2.0 - 1.0;
		let sinT = fieldSample.g * 2.0 - 1.0;
		let mag = fieldSample.b;
		var stepLen = stepSize;

		if (!uniformStep) {
			stepLen = stepSize * (0.25 + 0.75 * mag);
		}

		bwdPos.x = bwdPos.x - cosT * stepLen;
		bwdPos.y = bwdPos.y - sinT * stepLen;

		let seedUV = vec2<f32>(bwdPos.x * invWidth, bwdPos.y * invHeight);
		let seedSample = textureSampleLevel(seedTex, linearSampler, seedUV, 0.0);
		let weight = 1.0 - f32(step) / lengthF;
		accumR = accumR + seedSample.r * weight;
		accumG = accumG + seedSample.g * weight;
		accumB = accumB + seedSample.b * weight;
		weightSum = weightSum + weight;
	}

	var outR = centerSeed.r;
	var outG = centerSeed.g;
	var outB = centerSeed.b;

	if (weightSum > 0.0) {
		outR = accumR / weightSum;
		outG = accumG / weightSum;
		outB = accumB / weightSum;
	}

	textureStore(outputTex, vec2<i32>(i32(x), i32(y)), vec4<f32>(outR, outG, outB, centerSeed.a));
}
