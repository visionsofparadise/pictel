 

export function rgbToHsl(red: number, green: number, blue: number): [number, number, number] {
	const rn = red / 255
	const gn = green / 255
	const bn = blue / 255

	const max = Math.max(rn, gn, bn)
	const min = Math.min(rn, gn, bn)
	const li = (max + min) / 2

	if (max === min) return [0, 0, li]

	const delta = max - min
	const sat = li > 0.5 ? delta / (2 - max - min) : delta / (max + min)

	let hue: number

	if (max === rn) {
		hue = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6
	} else if (max === gn) {
		hue = ((bn - rn) / delta + 2) / 6
	} else {
		hue = ((rn - gn) / delta + 4) / 6
	}

	return [hue * 360, sat, li]
}

export function hslToRgb(hue: number, sat: number, li: number): [number, number, number] {
	const hNorm = ((hue % 360) + 360) % 360 / 360

	if (sat === 0) {
		const gray = Math.round(li * 255)

		return [gray, gray, gray]
	}

	const qq = li < 0.5 ? li * (1 + sat) : li + sat - li * sat
	const pp = 2 * li - qq

	function hue2rgb(tc: number): number {
		let tn = tc

		if (tn < 0) tn += 1

		if (tn > 1) tn -= 1

		if (tn < 1 / 6) return pp + (qq - pp) * 6 * tn

		if (tn < 1 / 2) return qq

		if (tn < 2 / 3) return pp + (qq - pp) * (2 / 3 - tn) * 6

		return pp
	}

	return [
		Math.round(hue2rgb(hNorm + 1 / 3) * 255),
		Math.round(hue2rgb(hNorm) * 255),
		Math.round(hue2rgb(hNorm - 1 / 3) * 255),
	]
}

 
