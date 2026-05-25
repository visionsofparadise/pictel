 

// Throwaway probe for plan-cli-renderer.md Phase 0: confirm headless Chromium
// (via Puppeteer) can expose WebGPU, and which launch flags are needed.
// Run from the repo root: node packages/cli/scripts/webgpu-spike.mjs
//
// Methodology notes (this is the corrected v2 of the spike — see plan Phase 0):
//   1. WebGPU requires a SECURE CONTEXT. about:blank is not one; http://127.0.0.1
//      is. The probe therefore navigates to a tiny local HTTP server, not
//      about:blank, or navigator.gpu is undefined regardless of GPU support.
//   2. Puppeteer silently injects "--use-angle=swiftshader-webgl" into its
//      default args, which overrides any --use-angle flag we pass. Every config
//      below drops it via ignoreDefaultArgs.

import http from "node:http"
import puppeteer from "puppeteer"

/** Serve a minimal secure-context page on 127.0.0.1. Returns { url, close }. */
function startServer() {
	return new Promise((resolve) => {
		const server = http.createServer((_req, res) => {
			res.writeHead(200, { "Content-Type": "text/html" })
			res.end("<!doctype html><meta charset=utf-8><title>webgpu probe</title>")
		})
		server.listen(0, "127.0.0.1", () => {
			const { port } = server.address()
			resolve({
				url: `http://127.0.0.1:${port}/`,
				close: () => new Promise((r) => server.close(r)),
			})
		})
	})
}

const IGNORE = ["--use-angle=swiftshader-webgl"]

/**
 * Candidate launch configs, from least to most aggressive. Each drops
 * Puppeteer's swiftshader-webgl ANGLE default. The first that yields a WebGPU
 * adapter (hardware OR fallback) is reported as the winner.
 */
const candidates = [
	{
		label: "localhost, --enable-unsafe-webgpu only",
		config: {
			headless: true,
			ignoreDefaultArgs: IGNORE,
			args: ["--no-sandbox", "--enable-unsafe-webgpu"],
		},
	},
	{
		label: "localhost, Vulkan + ANGLE=vulkan",
		config: {
			headless: true,
			ignoreDefaultArgs: IGNORE,
			args: [
				"--no-sandbox",
				"--enable-unsafe-webgpu",
				"--enable-features=Vulkan",
				"--use-angle=vulkan",
				"--disable-vulkan-surface",
			],
		},
	},
	{
		label: "localhost, full cloud-GPU flag set",
		config: {
			headless: true,
			ignoreDefaultArgs: IGNORE,
			args: [
				"--no-sandbox",
				"--enable-unsafe-webgpu",
				"--enable-features=Vulkan",
				"--use-angle=vulkan",
				"--disable-vulkan-surface",
				"--ignore-gpu-blocklist",
				"--disable-gpu-sandbox",
				"--enable-dawn-features=allow_unsafe_apis,disable_adapter_blocklist",
				"--disable-dawn-features=disallow_unsafe_apis",
			],
		},
	},
	{
		label: "localhost, software fallback (--enable-unsafe-swiftshader)",
		config: {
			headless: true,
			ignoreDefaultArgs: IGNORE,
			args: [
				"--no-sandbox",
				"--enable-unsafe-webgpu",
				"--enable-unsafe-swiftshader",
			],
		},
	},
]

/**
 * Probe a single launch config against the secure-context URL. Reports whether
 * navigator.gpu exists, and whether requestAdapter() resolves — both the normal
 * path and the forced software-fallback path.
 */
async function probe(config, url) {
	let browser
	try {
		browser = await puppeteer.launch(config)
		const page = await browser.newPage()
		await page.goto(url, { waitUntil: "load" })
		return await page.evaluate(async () => {
			if (!navigator.gpu) return { gpu: false }
			const tryAdapter = async (opts) => {
				try {
					const a = await navigator.gpu.requestAdapter(opts)
					if (!a) return "no adapter"
					const info = a.info ?? (a.requestAdapterInfo ? await a.requestAdapterInfo() : {})
					return {
						ok: true,
						isFallback: a.isFallbackAdapter ?? null,
						vendor: info.vendor ?? "",
						architecture: info.architecture ?? "",
						description: info.description ?? "",
					}
				} catch (e) {
					return "error: " + String(e)
				}
			}
			return {
				gpu: true,
				normal: await tryAdapter(undefined),
				fallback: await tryAdapter({ forceFallbackAdapter: true }),
			}
		})
	} catch (e) {
		return { error: String(e) }
	} finally {
		if (browser) await browser.close()
	}
}

function isOk(result) {
	return (
		result &&
		result.gpu &&
		((result.normal && result.normal.ok) ||
			(result.fallback && result.fallback.ok))
	)
}

async function main() {
	const server = await startServer()
	console.log(`probe server: ${server.url}`)

	let anyOk = false
	try {
		for (const { label, config } of candidates) {
			const flags = JSON.stringify(config.args ?? [])
			const result = await probe(config, server.url)
			const ok = isOk(result)
			if (ok) anyOk = true
			console.log(`\n[${ok ? "OK  " : "FAIL"}] ${label}`)
			console.log(`        args: ${flags}`)
			console.log(`        result: ${JSON.stringify(result)}`)
		}
	} finally {
		await server.close()
	}

	if (anyOk) {
		console.log("\nWebGPU is available headless in at least one config.")
		process.exit(0)
	} else {
		console.log("\nNo launch config produced a WebGPU adapter.")
		process.exit(1)
	}
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
