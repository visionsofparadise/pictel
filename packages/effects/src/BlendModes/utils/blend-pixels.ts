export type BlendFormula = (
  sr: number,
  sg: number,
  sb: number,
  dr: number,
  dg: number,
  db: number,
) => [number, number, number]

export function blendPixels(
  src: ImageData,
  dst: ImageData,
  formula: BlendFormula,
): ImageData {
  const sd = src.data
  const dd = dst.data
  const out = new Uint8ClampedArray(sd.length)

  for (let offset = 0; offset < sd.length; offset += 4) {
    /* eslint-disable @typescript-eslint/no-non-null-assertion -- hot path, bounds guaranteed by loop */
    const srcR = sd[offset]!,     srcG = sd[offset + 1]!
    const srcB = sd[offset + 2]!, srcA255 = sd[offset + 3]!
    const dstR = dd[offset]!,     dstG = dd[offset + 1]!
    const dstB = dd[offset + 2]!, dstA255 = dd[offset + 3]!
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    const sr = srcR / 255, sg = srcG / 255, sb = srcB / 255, sa = srcA255 / 255
    const dr = dstR / 255, dg = dstG / 255, db = dstB / 255, da = dstA255 / 255

    const [br, bg, bb] = formula(sr, sg, sb, dr, dg, db)

    const outA = sa + da * (1 - sa)

    if (outA === 0) {
      out[offset] = 0; out[offset + 1] = 0; out[offset + 2] = 0; out[offset + 3] = 0
    } else {
      out[offset]     = Math.round((br * sa + dr * da * (1 - sa)) / outA * 255)
      out[offset + 1] = Math.round((bg * sa + dg * da * (1 - sa)) / outA * 255)
      out[offset + 2] = Math.round((bb * sa + db * da * (1 - sa)) / outA * 255)
      out[offset + 3] = Math.round(outA * 255)
    }
  }

  return new ImageData(out, src.width, src.height)
}
