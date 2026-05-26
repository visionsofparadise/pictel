/* eslint-disable @typescript-eslint/no-non-null-assertion */

export interface BenchmarkResult {
	name: string
	median: number
	mean: number
	p95: number
	iterations: number
}

export interface BenchmarkRun {
	run: () => void | Promise<void>
	cleanup?: () => void
}

export interface BenchmarkOptions {
	iterations?: number
	warmup?: number
}

/**
 * Runs a single benchmark. Invokes the setup once, then runs N warmup
 * iterations followed by N timed iterations. Reports median, mean, and p95.
 *
 * Timings use `performance.now()`. The harness is manual-run — no automated
 * regression on the numbers.
 */
export async function runBenchmark(
	name: string,
	setup: () => Promise<BenchmarkRun> | BenchmarkRun,
	options: BenchmarkOptions = {},
): Promise<BenchmarkResult> {
	const iterations = options.iterations ?? 20
	const warmup = options.warmup ?? 3

	const fixture = await setup()

	try {
		for (let warmIdx = 0; warmIdx < warmup; warmIdx++) {
			await fixture.run()
		}

		const samples = new Float64Array(iterations)

		for (let iterIdx = 0; iterIdx < iterations; iterIdx++) {
			const t0 = performance.now()
			await fixture.run()
			const t1 = performance.now()
			samples[iterIdx] = t1 - t0
		}

		const sorted = Array.from(samples).sort((left, right) => left - right)
		const median = sorted[Math.floor(sorted.length / 2)]!
		const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length
		const p95Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))
		const p95 = sorted[p95Index]!

		return { name, median, mean, p95, iterations }
	} finally {
		fixture.cleanup?.()
	}
}
