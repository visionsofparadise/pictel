/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
	applyBilateral,
	applyBilateralGpu,
	applyBloom,
	applyBloomGpu,
	applyBlurGpu,
	applyBrightness,
	applyDropShadow,
	applyDropShadowGpu,
	applyHalftone,
	applyLIC,
	applyLicGpu,
	applyOutline,
	applyOutlineGpu,
	applyQuantize,
	applyShockFilter,
	applyShockFilterGpu,
	applyStructureField,
	applyUniformBlur,
	blendPixels,
	color,
	derivePalette,
	hue,
	luminosity,
	multiply,
	overlay,
	saturation,
	vividLight,
} from "@pictel/effects"
import { runBenchmark, type BenchmarkResult } from "./harness"
import { makeSwirlField, makeTestImage } from "./test-image"

const params = new URLSearchParams(window.location.search)
const effect = params.get("effect") ?? "Brightness"
const size = Number(params.get("size") ?? "1024")
const iterations = Number(params.get("iterations") ?? "20")
const warmup = Number(params.get("warmup") ?? "3")

interface EffectConfig {
	setup: () => { run: () => void | Promise<void> }
	label: string
}

// Keys here are the URL `?effect=` selector values; they intentionally match
// the pictel effect component names (PascalCase) and the parameterized
// variants use kebab-case to distinguish from the bare names.
/* eslint-disable @typescript-eslint/naming-convention */
const configs: Record<string, () => EffectConfig> = {
	Brightness: () => {
		const image = makeTestImage(size, size)

		return {
			label: `Brightness amount=1.2 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyBrightness(image, 1.2)
				},
			}),
		}
	},
	"Bilateral-s4": () => {
		const image = makeTestImage(size, size)

		return {
			label: `Bilateral spatialSigma=4 colorSigma=32 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyBilateral(image, 4, 32)
				},
			}),
		}
	},
	"Bilateral-s8": () => {
		const image = makeTestImage(size, size)

		return {
			label: `Bilateral spatialSigma=8 colorSigma=32 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyBilateral(image, 8, 32)
				},
			}),
		}
	},
	"BilateralGpu-s4": () => {
		const image = makeTestImage(size, size)

		return {
			label: `BilateralGpu spatialSigma=4 colorSigma=32 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: async () => {
					await applyBilateralGpu(image, 4, 32)
				},
			}),
		}
	},
	"BilateralGpu-s8": () => {
		const image = makeTestImage(size, size)

		return {
			label: `BilateralGpu spatialSigma=8 colorSigma=32 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: async () => {
					await applyBilateralGpu(image, 8, 32)
				},
			}),
		}
	},
	LICGpu: () => {
		const seed = makeTestImage(size, size, 0xfa11ed)
		const field = makeSwirlField(size, size)

		return {
			label: `LICGpu length=20 stepSize=1 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: async () => {
					await applyLicGpu(seed, field, 20, 1)
				},
			}),
		}
	},
	LIC: () => {
		const seed = makeTestImage(size, size, 0xfa11ed)
		const field = makeSwirlField(size, size)

		return {
			label: `LIC length=20 stepSize=1 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyLIC(seed, field, 20, 1)
				},
			}),
		}
	},
	Blur: () => {
		const image = makeTestImage(size, size)

		return {
			label: `Blur radius=20 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyUniformBlur(image, 20)
				},
			}),
		}
	},
	BlurGpu: () => {
		const image = makeTestImage(size, size)

		return {
			label: `BlurGpu radius=20 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: async () => {
					await applyBlurGpu(image, 20)
				},
			}),
		}
	},
	ShockFilter: () => {
		const image = makeTestImage(size, size)

		return {
			label: `ShockFilter iterations=8 strength=1 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyShockFilter(image, 8, 1)
				},
			}),
		}
	},
	ShockFilterGpu: () => {
		const image = makeTestImage(size, size)

		return {
			label: `ShockFilterGpu iterations=8 strength=1 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: async () => {
					await applyShockFilterGpu(image, 8, 1)
				},
			}),
		}
	},
	"Direction-structure": () => {
		const image = makeTestImage(size, size)

		return {
			label: `Direction structure-mode kernel=sobel ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyStructureField(image, "sobel")
				},
			}),
		}
	},
	Outline: () => {
		const image = makeTestImage(size, size)

		return {
			label: `Outline sigma=1 kappa=1.6 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyOutline(image, 1, 1.6, 0, 200)
				},
			}),
		}
	},
	OutlineGpu: () => {
		const image = makeTestImage(size, size)

		return {
			label: `OutlineGpu sigma=1 kappa=1.6 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: async () => {
					await applyOutlineGpu(image, 1, 1.6, 0, 200)
				},
			}),
		}
	},
	DropShadow: () => {
		const image = makeTestImage(size, size)

		return {
			label: `DropShadow blur=20 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyDropShadow(image, 0, 0, 20, "rgba(0,0,0,1)")
				},
			}),
		}
	},
	DropShadowGpu: () => {
		const image = makeTestImage(size, size)

		return {
			label: `DropShadowGpu blur=20 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: async () => {
					await applyDropShadowGpu(image, 0, 0, 20, "rgba(0,0,0,1)")
				},
			}),
		}
	},
	Bloom: () => {
		const image = makeTestImage(size, size)

		return {
			label: `Bloom threshold=0.75 radius=16 intensity=1 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyBloom(image, 0.75, 16, 1)
				},
			}),
		}
	},
	BloomGpu: () => {
		const image = makeTestImage(size, size)

		return {
			label: `BloomGpu threshold=0.75 radius=16 intensity=1 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: async () => {
					await applyBloomGpu(image, 0.75, 16, 1)
				},
			}),
		}
	},
	"Halftone-cmyk": () => {
		const image = makeTestImage(size, size)

		return {
			label: `Halftone CMYK dotSize=8 ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyHalftone(image, 8, 0, "cmyk")
				},
			}),
		}
	},
	"Quantize-16-bayer": () => {
		const image = makeTestImage(size, size)
		// Derive the 16-color median-cut palette ONCE outside the timed loop —
		// the benchmark measures applyQuantize cost, not palette derivation.
		const palette = derivePalette(image, 16)

		return {
			label: `Quantize 16-color median-cut palette Bayer-8 dither ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyQuantize(image, palette, "bayer-8")
				},
			}),
		}
	},
	"Quantize-64-bayer": () => {
		const image = makeTestImage(size, size)
		// 64-color fixed palette: 4×4×4 RGB cube (centroids at 32, 96, 160, 224).
		const palette: Array<[number, number, number]> = []

		for (let red = 0; red < 4; red++) {
			for (let green = 0; green < 4; green++) {
				for (let blue = 0; blue < 4; blue++) {
					palette.push([red * 64 + 32, green * 64 + 32, blue * 64 + 32])
				}
			}
		}

		return {
			label: `Quantize 64-color fixed palette Bayer-8 dither ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					applyQuantize(image, palette, "bayer-8")
				},
			}),
		}
	},
	// HSL blend modes — distinct seeds for src and dst so neither buffer is
	// achromatic by accident (achromatic short-circuits skew the per-pixel cost).
	Hue: () => {
		const src = makeTestImage(size, size, 0xa11ce5)
		const dst = makeTestImage(size, size, 0xb0bb1e)

		return {
			label: `Hue blend ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					blendPixels(src, dst, hue)
				},
			}),
		}
	},
	Saturation: () => {
		const src = makeTestImage(size, size, 0xa11ce5)
		const dst = makeTestImage(size, size, 0xb0bb1e)

		return {
			label: `Saturation blend ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					blendPixels(src, dst, saturation)
				},
			}),
		}
	},
	Color: () => {
		const src = makeTestImage(size, size, 0xa11ce5)
		const dst = makeTestImage(size, size, 0xb0bb1e)

		return {
			label: `Color blend ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					blendPixels(src, dst, color)
				},
			}),
		}
	},
	Luminosity: () => {
		const src = makeTestImage(size, size, 0xa11ce5)
		const dst = makeTestImage(size, size, 0xb0bb1e)

		return {
			label: `Luminosity blend ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					blendPixels(src, dst, luminosity)
				},
			}),
		}
	},
	// Multiply with opacity=0.5 — Phase 12 measures whether collapsing the
	// per-component post-blend opacity interpolation into blendPixels' main
	// loop is a net win.
	//
	// `Multiply-opacity-half-twopass` simulates the pre-Phase-12 code path
	// inline (blendPixels + second-pass lerp on the consumer side) — used to
	// record the Phase 12.1 baseline so the comparison stays apples-to-apples
	// regardless of the blendPixels signature evolution within this phase.
	//
	// `Multiply-opacity-half` calls the post-Phase-12.2 blendPixels signature
	// (opacity as the 4th argument). On a pre-12.2 build the 4th arg is
	// ignored and the entry measures the bare blend (no second pass) — that
	// number is meaningful as a sanity-check lower bound, not the ship/skip
	// signal. The Phase 12.4 decision compares the post-12.2/12.3 result of
	// this entry against the 12.1 `…-twopass` baseline.
	"Multiply-opacity-half-twopass": () => {
		const src = makeTestImage(size, size, 0xa11ce5)
		const dst = makeTestImage(size, size, 0xb0bb1e)
		const opacity = 0.5

		return {
			label: `Multiply opacity=0.5 (twopass baseline) ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					const blended = blendPixels(src, dst, multiply)

					const blendedData = blended.data
					const targetData = dst.data
					const out = new Uint8ClampedArray(targetData.length)

					for (let px = 0; px < targetData.length; px += 4) {
						out[px] = targetData[px]! + opacity * (blendedData[px]! - targetData[px]!)
						out[px + 1] = targetData[px + 1]! + opacity * (blendedData[px + 1]! - targetData[px + 1]!)
						out[px + 2] = targetData[px + 2]! + opacity * (blendedData[px + 2]! - targetData[px + 2]!)
						out[px + 3] = targetData[px + 3]! + opacity * (blendedData[px + 3]! - targetData[px + 3]!)
					}
				},
			}),
		}
	},
	"Multiply-opacity-half": () => {
		const src = makeTestImage(size, size, 0xa11ce5)
		const dst = makeTestImage(size, size, 0xb0bb1e)
		const opacity = 0.5

		return {
			label: `Multiply opacity=0.5 (in-loop) ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					blendPixels(src, dst, multiply, opacity)
				},
			}),
		}
	},
	// Phase 13 — default-opacity baselines for the generic `blendPixels(src, dst, formula)`
	// dispatch. Used to compare against the monomorphic Multiply variant.
	Multiply: () => {
		const src = makeTestImage(size, size, 0xa11ce5)
		const dst = makeTestImage(size, size, 0xb0bb1e)

		return {
			label: `Multiply blend (callback dispatch) ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					blendPixels(src, dst, multiply)
				},
			}),
		}
	},
	Overlay: () => {
		const src = makeTestImage(size, size, 0xa11ce5)
		const dst = makeTestImage(size, size, 0xb0bb1e)

		return {
			label: `Overlay blend (callback dispatch) ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					blendPixels(src, dst, overlay)
				},
			}),
		}
	},
	VividLight: () => {
		const src = makeTestImage(size, size, 0xa11ce5)
		const dst = makeTestImage(size, size, 0xb0bb1e)

		return {
			label: `VividLight blend (callback dispatch) ${String(size)}x${String(size)}`,
			setup: () => ({
				run: () => {
					blendPixels(src, dst, vividLight)
				},
			}),
		}
	},
}
/* eslint-enable @typescript-eslint/naming-convention */

const root = document.getElementById("output")!
const status = document.getElementById("status")!

function setStatus(text: string): void {
	status.textContent = text
}

function renderResult(label: string, result: BenchmarkResult): void {
	const block = document.createElement("pre")
	const text =
		`${label}\n` +
		`  iterations: ${String(result.iterations)}\n` +
		`  median:     ${result.median.toFixed(3)} ms\n` +
		`  mean:       ${result.mean.toFixed(3)} ms\n` +
		`  p95:        ${result.p95.toFixed(3)} ms`
	block.textContent = text
	root.appendChild(block)
	// eslint-disable-next-line no-console
	console.log(`BENCHMARK ${label}:`, result)
	// Persist results so external automation can scrape them even if the page
	// navigates away before the timing data is read.
	document.body.dataset[`benchmark_${effect.replace(/-/g, "_")}_median`] = String(result.median)
	document.body.dataset.benchmarkComplete = "true"

	try {
		const existing = JSON.parse(window.localStorage.getItem("pictel-benchmark-results") ?? "{}") as Record<string, BenchmarkResult & { label: string }>
		existing[effect] = { ...result, label }
		window.localStorage.setItem("pictel-benchmark-results", JSON.stringify(existing))
	} catch {
		// localStorage not available — fall back to console only.
	}
}

async function main(): Promise<void> {
	const factory = configs[effect]

	if (!factory) {
		setStatus(`Unknown effect: ${effect}. Available: ${Object.keys(configs).join(", ")}`)

		return
	}

	setStatus(`Preparing ${effect}…`)
	const config = factory()

	setStatus(`Running ${effect}: ${String(warmup)} warmup + ${String(iterations)} iterations`)

	try {
		const result = await runBenchmark(effect, config.setup, { iterations, warmup })
		renderResult(config.label, result)
		setStatus(`Done — ${effect}`)
	} catch (error) {
		setStatus(`Error running ${effect}: ${error instanceof Error ? error.message : String(error)}`)
		document.body.dataset.benchmarkError = error instanceof Error ? error.message : String(error)
	}
}

void main()
