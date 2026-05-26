// Bilateral filter — compute shader.
//
// Mirrors the CPU `applyBilateral` math: for each pixel, accumulate a weighted
// sum of neighbors within `radius`, where the per-neighbor weight is the
// product of a spatial Gaussian (distance from center) and a color Gaussian
// (per-channel diff vs. center). Alpha is passed through from the center pixel
// unchanged.
//
// Sampling uses `textureLoad` on rgba8unorm (no hardware filtering needed —
// bilateral does its own weighted gather). Out-of-bounds neighbors clamp to
// the edge, matching the CPU implementation's `Math.max/Math.min` clamps.
//
// Workgroup 8×8 is the starting point; 20.5 tunes empirically.

struct Uniforms {
	spatial_denom: f32, // 2 * spatialSigma * spatialSigma (0 sentinel → identity)
	color_denom: f32,   // 2 * colorSigma   * colorSigma   (0 sentinel → identity)
	radius: i32,
	width: i32,
	height: i32,
	_pad0: f32,
	_pad1: f32,
	_pad2: f32,
}

@group(0) @binding(0) var src_tex: texture_2d<f32>;
@group(0) @binding(1) var dst_tex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var<uniform> params: Uniforms;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
	let x = i32(gid.x);
	let y = i32(gid.y);

	if (x >= params.width || y >= params.height) {
		return;
	}

	let center = textureLoad(src_tex, vec2<i32>(x, y), 0);
	// Color comparisons happen in the same 0..255 unit space as the CPU peer so
	// the LUT-bucketing equivalence holds; the texture lookup returns 0..1
	// floats, so multiply by 255 to match.
	let center_r = center.r * 255.0;
	let center_g = center.g * 255.0;
	let center_b = center.b * 255.0;

	let radius = params.radius;
	let y_min = max(0, y - radius);
	let y_max = min(params.height - 1, y + radius);
	let x_min = max(0, x - radius);
	let x_max = min(params.width - 1, x + radius);

	let spatial_denom = params.spatial_denom;
	let color_denom = params.color_denom;

	var weight_sum: f32 = 0.0;
	var r_sum: f32 = 0.0;
	var g_sum: f32 = 0.0;
	var b_sum: f32 = 0.0;

	for (var ny: i32 = y_min; ny <= y_max; ny = ny + 1) {
		let dy = ny - y;

		for (var nx: i32 = x_min; nx <= x_max; nx = nx + 1) {
			let dx = nx - x;

			let neighbor = textureLoad(src_tex, vec2<i32>(nx, ny), 0);
			let n_r = neighbor.r * 255.0;
			let n_g = neighbor.g * 255.0;
			let n_b = neighbor.b * 255.0;

			let spatial_dist_sq = f32(dx * dx + dy * dy);
			var spatial_weight: f32;

			if (spatial_denom == 0.0) {
				spatial_weight = select(0.0, 1.0, dx == 0 && dy == 0);
			} else {
				spatial_weight = exp(-spatial_dist_sq / spatial_denom);
			}

			let d_r = n_r - center_r;
			let d_g = n_g - center_g;
			let d_b = n_b - center_b;
			let color_dist_sq = d_r * d_r + d_g * d_g + d_b * d_b;
			var color_weight: f32;

			if (color_denom == 0.0) {
				color_weight = select(0.0, 1.0, color_dist_sq == 0.0);
			} else {
				color_weight = exp(-color_dist_sq / color_denom);
			}

			let weight = spatial_weight * color_weight;

			weight_sum = weight_sum + weight;
			r_sum = r_sum + weight * n_r;
			g_sum = g_sum + weight * n_g;
			b_sum = b_sum + weight * n_b;
		}
	}

	// Renormalize and write back into 0..1 space. weight_sum is guaranteed
	// nonzero because the center pixel itself contributes weight 1.
	let out_r = (r_sum / weight_sum) / 255.0;
	let out_g = (g_sum / weight_sum) / 255.0;
	let out_b = (b_sum / weight_sum) / 255.0;

	textureStore(dst_tex, vec2<i32>(x, y), vec4<f32>(out_r, out_g, out_b, center.a));
}
