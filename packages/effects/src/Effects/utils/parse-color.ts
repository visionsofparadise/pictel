/* eslint-disable @typescript-eslint/no-non-null-assertion */

export interface ParsedColor {
	r: number
	g: number
	b: number
	a: number
}

function parseHex(hex: string): ParsedColor {
	const digits = hex.startsWith("#") ? hex.slice(1) : hex

	if (digits.length === 3) {
		return {
			r: parseInt(digits[0]! + digits[0]!, 16),
			g: parseInt(digits[1]! + digits[1]!, 16),
			b: parseInt(digits[2]! + digits[2]!, 16),
			a: 255,
		}
	}

	if (digits.length === 6) {
		return {
			r: parseInt(digits.slice(0, 2), 16),
			g: parseInt(digits.slice(2, 4), 16),
			b: parseInt(digits.slice(4, 6), 16),
			a: 255,
		}
	}

	if (digits.length === 8) {
		return {
			r: parseInt(digits.slice(0, 2), 16),
			g: parseInt(digits.slice(2, 4), 16),
			b: parseInt(digits.slice(4, 6), 16),
			a: parseInt(digits.slice(6, 8), 16),
		}
	}

	return { r: 0, g: 0, b: 0, a: 255 }
}

export function parseColor(color: string): ParsedColor {
	const trimmed = color.trim()

	if (trimmed.startsWith("#")) return parseHex(trimmed)

	const rgbaMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/.exec(trimmed)

	if (rgbaMatch) {
		return {
			r: parseInt(rgbaMatch[1]!, 10),
			g: parseInt(rgbaMatch[2]!, 10),
			b: parseInt(rgbaMatch[3]!, 10),
			a: rgbaMatch[4] !== undefined ? Math.round(parseFloat(rgbaMatch[4]) * 255) : 255,
		}
	}

	return { r: 0, g: 0, b: 0, a: 255 }
}
