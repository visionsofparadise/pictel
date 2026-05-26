export type BlendFormula = (
  sr: number,
  sg: number,
  sb: number,
  dr: number,
  dg: number,
  db: number,
) => [number, number, number]

const NORM_LUT = new Float32Array(256)

for (let x = 0; x < 256; x++) NORM_LUT[x] = x / 255

export function blendPixels(
  src: ImageData,
  dst: ImageData,
  formula: BlendFormula,
  opacity = 1,
): ImageData {
  const sd = src.data
  const dd = dst.data
  const out = new Uint8ClampedArray(sd.length)
  const fullOpacity = opacity === 1

  for (let offset = 0; offset < sd.length; offset += 4) {
    /* eslint-disable @typescript-eslint/no-non-null-assertion -- hot path, bounds guaranteed by loop */
    const srcR = sd[offset]!,     srcG = sd[offset + 1]!
    const srcB = sd[offset + 2]!, srcA255 = sd[offset + 3]!
    const dstR = dd[offset]!,     dstG = dd[offset + 1]!
    const dstB = dd[offset + 2]!, dstA255 = dd[offset + 3]!

    const sr = NORM_LUT[srcR]!, sg = NORM_LUT[srcG]!, sb = NORM_LUT[srcB]!, sa = NORM_LUT[srcA255]!
    const dr = NORM_LUT[dstR]!, dg = NORM_LUT[dstG]!, db = NORM_LUT[dstB]!, da = NORM_LUT[dstA255]!
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    const [br, bg, bb] = formula(sr, sg, sb, dr, dg, db)

    const outA = sa + da * (1 - sa)

    if (outA === 0) {
      out[offset] = 0; out[offset + 1] = 0; out[offset + 2] = 0; out[offset + 3] = 0
    } else if (fullOpacity) {
      out[offset]     = ((br * sa + dr * da * (1 - sa)) / outA * 255 + 0.5) | 0
      out[offset + 1] = ((bg * sa + dg * da * (1 - sa)) / outA * 255 + 0.5) | 0
      out[offset + 2] = ((bb * sa + db * da * (1 - sa)) / outA * 255 + 0.5) | 0
      out[offset + 3] = Math.round(outA * 255)
    } else {
      // Per-pixel lerp from the unblended dst (denormalized) toward the blended
      // Porter-Duff output, by `opacity`. Equivalent to the previous consumer-
      // side second pass: `out = dst + opacity * (blended - dst)`.
      const blendedR = (br * sa + dr * da * (1 - sa)) / outA * 255
      const blendedG = (bg * sa + dg * da * (1 - sa)) / outA * 255
      const blendedB = (bb * sa + db * da * (1 - sa)) / outA * 255
      const blendedA = outA * 255

      out[offset]     = (dstR + opacity * (blendedR - dstR) + 0.5) | 0
      out[offset + 1] = (dstG + opacity * (blendedG - dstG) + 0.5) | 0
      out[offset + 2] = (dstB + opacity * (blendedB - dstB) + 0.5) | 0
      out[offset + 3] = Math.round(dstA255 + opacity * (blendedA - dstA255))
    }
  }

  return new ImageData(out, src.width, src.height)
}
