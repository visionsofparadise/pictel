// ShockFilter per-iteration step. Inputs:
//   src_tex     — current RGBA channels (the per-pixel state being shocked)
//   smooth_tex  — the box-blurred version of src_tex (radius 1, separable)
//   dst_tex     — output: shocked next-state RGBA
//
// CPU peer: `Effects/ShockFilter.tsx::applyShockFilter`. Same algorithm:
//   1. luminance(smooth_tex(x,y)) gives a smoothed-luminance field
//   2. laplacian = sum(4 cardinal neighbours of lum) - 4*lum_center
//   3. sign = sign(laplacian)
//   4. for each channel:
//        gradX = (src(x+1,y).c - src(x-1,y).c) / 2
//        gradY = (src(x,y+1).c - src(x,y-1).c) / 2
//        gradMag = sqrt(gradX² + gradY²)
//        next = src(x,y).c - sign * gradMag * dt
//        next = clamp(next, 0, 255)  // CPU works in 0..255, we work in 0..1
//   5. alpha pass-through from src_tex
//
// Boundary handling: clamp-to-edge — matches CPU peer's `y > 0 ? y - 1 : 0`
// and equivalents.

struct Params {
	dt: f32,
	width: i32,
	height: i32,
	_pad: i32,
}

@group(0) @binding(0) var src_tex: texture_2d<f32>;
@group(0) @binding(1) var smooth_tex: texture_2d<f32>;
@group(0) @binding(2) var dst_tex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(3) var<uniform> params: Params;

// Match the CPU peer's `luminance(r,g,b) = 0.299*r + 0.587*g + 0.114*b` on
// the 0..255 scale. The shader reads 0..1 floats so we multiply by 255
// before luminance — but BT.601 weights commute with the scale (linear),
// so we can just compute on the 0..1 floats and the relative magnitudes
// of laplacian/sign are identical to the CPU peer's 0..255 path.
fn lum(c: vec4<f32>) -> f32 {
	return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
	let x = i32(gid.x);
	let y = i32(gid.y);

	if (x >= params.width || y >= params.height) {
		return;
	}

	let x_left = max(0, x - 1);
	let x_right = min(params.width - 1, x + 1);
	let y_up = max(0, y - 1);
	let y_down = min(params.height - 1, y + 1);

	// Laplacian on smoothed luminance.
	let lum_center = lum(textureLoad(smooth_tex, vec2<i32>(x, y), 0));
	let lum_left = lum(textureLoad(smooth_tex, vec2<i32>(x_left, y), 0));
	let lum_right = lum(textureLoad(smooth_tex, vec2<i32>(x_right, y), 0));
	let lum_up = lum(textureLoad(smooth_tex, vec2<i32>(x, y_up), 0));
	let lum_down = lum(textureLoad(smooth_tex, vec2<i32>(x, y_down), 0));

	let laplacian = lum_left + lum_right + lum_up + lum_down - 4.0 * lum_center;

	var sign_val: f32 = 0.0;

	if (laplacian > 0.0) {
		sign_val = 1.0;
	} else if (laplacian < 0.0) {
		sign_val = -1.0;
	}

	// Shock the source's RGB. The CPU peer computes gradient on the
	// pre-smoothing channels (state being shocked), not on smoothed —
	// `current[centerIdx]` etc. are the raw `channels` array, which holds the
	// PRE-blur state (the blur outputs go to `smoothed` and feed the laplacian
	// only). Mirror that: read gradient from `src_tex`.
	let s_center = textureLoad(src_tex, vec2<i32>(x, y), 0);
	let s_left = textureLoad(src_tex, vec2<i32>(x_left, y), 0);
	let s_right = textureLoad(src_tex, vec2<i32>(x_right, y), 0);
	let s_up = textureLoad(src_tex, vec2<i32>(x, y_up), 0);
	let s_down = textureLoad(src_tex, vec2<i32>(x, y_down), 0);

	let grad_x_r = (s_right.r - s_left.r) * 0.5;
	let grad_y_r = (s_down.r - s_up.r) * 0.5;
	let grad_x_g = (s_right.g - s_left.g) * 0.5;
	let grad_y_g = (s_down.g - s_up.g) * 0.5;
	let grad_x_b = (s_right.b - s_left.b) * 0.5;
	let grad_y_b = (s_down.b - s_up.b) * 0.5;

	let grad_mag_r = sqrt(grad_x_r * grad_x_r + grad_y_r * grad_y_r);
	let grad_mag_g = sqrt(grad_x_g * grad_x_g + grad_y_g * grad_y_g);
	let grad_mag_b = sqrt(grad_x_b * grad_x_b + grad_y_b * grad_y_b);

	let dt = params.dt;
	var out_r = s_center.r - sign_val * grad_mag_r * dt;
	var out_g = s_center.g - sign_val * grad_mag_g * dt;
	var out_b = s_center.b - sign_val * grad_mag_b * dt;

	// Clamp to 0..1 (the storage texture is rgba8unorm — out-of-range values
	// would be clipped by the format anyway, but explicit clamp keeps the
	// math identical to the CPU peer's `clamp(shocked, 0, 255)`).
	out_r = clamp(out_r, 0.0, 1.0);
	out_g = clamp(out_g, 0.0, 1.0);
	out_b = clamp(out_b, 0.0, 1.0);

	textureStore(dst_tex, vec2<i32>(x, y), vec4<f32>(out_r, out_g, out_b, s_center.a));
}
