/**
 * Deterministic mulberry32 PRNG. A fixed integer seed yields a fixed stream
 * of floats in [0, 1) — used by effects that need stable randomness across
 * renders (no `Math.random()`).
 */
export function mulberry32(seed: number): () => number {
	let state = seed | 0

	return () => {
		state = (state + 0x6d2b79f5) | 0
		let hash = Math.imul(state ^ (state >>> 15), 1 | state)
		hash = (hash + Math.imul(hash ^ (hash >>> 7), 61 | hash)) ^ hash

		return ((hash ^ (hash >>> 14)) >>> 0) / 0xffffffff
	}
}
