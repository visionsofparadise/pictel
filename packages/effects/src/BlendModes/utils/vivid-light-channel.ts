import { colorBurn } from "./color-burn"
import { colorDodge } from "./color-dodge"

export function vividLightChannel(dst: number, src: number): number {
	return src <= 0.5 ? colorBurn(dst, 2 * src) : colorDodge(dst, 2 * src - 1)
}
