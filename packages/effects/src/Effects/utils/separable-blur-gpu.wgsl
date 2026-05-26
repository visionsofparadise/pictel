// Separable box-blur compute shader, shared across `BlurGpu`, `DropShadowGpu`,
// `BloomGpu`, `OutlineGpu`, and `ShockFilterGpu`. CPU peer is
// `Effects/utils/box-blur-channel.ts` (`boxBlurChannel` /`boxBlurChannels`).
//
// Two entry points: `horizontal` blurs along x, `vertical` along y. Both read
// rgba8unorm via `textureLoad` (no hardware filtering — we do uniform-weight
// box gather over an integer radius). Boundary handling is clamp-to-edge, the
// same convention used by the CPU peer (`if (sx < 0) sx = 0; else if (sx >
// width - 1) sx = width - 1`).
//
// Workgroup 8×8 is the baseline; tune in 22.3 if the benchmark wants a different
// size.

struct Params {
	radius: i32,
	width: i32,
	height: i32,
	_pad: i32,
}

@group(0) @binding(0) var src_tex: texture_2d<f32>;
@group(0) @binding(1) var dst_tex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var<uniform> params: Params;

@compute @workgroup_size(8, 8)
fn horizontal(@builtin(global_invocation_id) gid: vec3<u32>) {
	let x = i32(gid.x);
	let y = i32(gid.y);

	if (x >= params.width || y >= params.height) {
		return;
	}

	let radius = params.radius;
	let inv_window = 1.0 / f32(2 * radius + 1);
	let max_x = params.width - 1;

	var sum_r: f32 = 0.0;
	var sum_g: f32 = 0.0;
	var sum_b: f32 = 0.0;
	var sum_a: f32 = 0.0;

	for (var k: i32 = -radius; k <= radius; k = k + 1) {
		var sx = x + k;

		if (sx < 0) {
			sx = 0;
		} else if (sx > max_x) {
			sx = max_x;
		}

		let sample = textureLoad(src_tex, vec2<i32>(sx, y), 0);
		sum_r = sum_r + sample.r;
		sum_g = sum_g + sample.g;
		sum_b = sum_b + sample.b;
		sum_a = sum_a + sample.a;
	}

	textureStore(
		dst_tex,
		vec2<i32>(x, y),
		vec4<f32>(sum_r * inv_window, sum_g * inv_window, sum_b * inv_window, sum_a * inv_window),
	);
}

@compute @workgroup_size(8, 8)
fn vertical(@builtin(global_invocation_id) gid: vec3<u32>) {
	let x = i32(gid.x);
	let y = i32(gid.y);

	if (x >= params.width || y >= params.height) {
		return;
	}

	let radius = params.radius;
	let inv_window = 1.0 / f32(2 * radius + 1);
	let max_y = params.height - 1;

	var sum_r: f32 = 0.0;
	var sum_g: f32 = 0.0;
	var sum_b: f32 = 0.0;
	var sum_a: f32 = 0.0;

	for (var k: i32 = -radius; k <= radius; k = k + 1) {
		var sy = y + k;

		if (sy < 0) {
			sy = 0;
		} else if (sy > max_y) {
			sy = max_y;
		}

		let sample = textureLoad(src_tex, vec2<i32>(x, sy), 0);
		sum_r = sum_r + sample.r;
		sum_g = sum_g + sample.g;
		sum_b = sum_b + sample.b;
		sum_a = sum_a + sample.a;
	}

	textureStore(
		dst_tex,
		vec2<i32>(x, y),
		vec4<f32>(sum_r * inv_window, sum_g * inv_window, sum_b * inv_window, sum_a * inv_window),
	);
}
