export function mulberry32(seed: number): () => number {
	let state = seed | 0

	return () => {
		state = (state + 0x6d2b79f5) | 0
		let hash = Math.imul(state ^ (state >>> 15), 1 | state)
		hash = (hash + Math.imul(hash ^ (hash >>> 7), 61 | hash)) ^ hash

		return ((hash ^ (hash >>> 14)) >>> 0) / 0xffffffff
	}
}
