import { describe, it, expect, beforeAll } from "vitest"
import { blendPixels, type BlendFormula } from "./blend-pixels"

beforeAll(() => {
  globalThis.ImageData = class ImageData {
    readonly data: Uint8ClampedArray
    readonly width: number
    readonly height: number

    constructor(data: Uint8ClampedArray, width: number, height: number) {
      this.data = data
      this.width = width
      this.height = height
    }
  } as unknown as typeof globalThis.ImageData
})

function pixel(r: number, g: number, b: number, a: number): ImageData {
  return new ImageData(new Uint8ClampedArray([r, g, b, a]), 1, 1)
}

const identity: BlendFormula = (sr, sg, sb) => [sr, sg, sb]

describe("blendPixels", () => {
  it("passes opaque source through with identity blend on opaque dest", () => {
    const result = blendPixels(pixel(255, 255, 255, 255), pixel(0, 0, 0, 255), identity)
    const d = result.data

    expect(d[0]).toBe(255)
    expect(d[1]).toBe(255)
    expect(d[2]).toBe(255)
    expect(d[3]).toBe(255)
  })

  it("composites semi-transparent source onto opaque dest via Porter-Duff", () => {
    const result = blendPixels(pixel(255, 0, 0, 128), pixel(0, 0, 255, 255), identity)
    const d = result.data

    // srcA = 128/255 ≈ 0.502, dstA = 1.0
    // outA = 0.502 + 1.0*(1-0.502) ≈ 1.0 → 255
    expect(d[3]).toBe(255)

    // outR = (1.0*0.502 + 0.0*1.0*0.498) / 1.0 ≈ 0.502 → ~128
    expect(d[0]).toBeGreaterThanOrEqual(127)
    expect(d[0]).toBeLessThanOrEqual(129)

    // outG = 0
    expect(d[1]).toBe(0)

    // outB = (0.0*0.502 + 1.0*1.0*0.498) / 1.0 ≈ 0.498 → ~127
    expect(d[2]).toBeGreaterThanOrEqual(126)
    expect(d[2]).toBeLessThanOrEqual(128)
  })

  it("leaves dest unchanged when source is fully transparent", () => {
    const result = blendPixels(pixel(255, 128, 64, 0), pixel(10, 20, 30, 255), identity)
    const d = result.data

    expect(d[0]).toBe(10)
    expect(d[1]).toBe(20)
    expect(d[2]).toBe(30)
    expect(d[3]).toBe(255)
  })

  it("passes normalized 0-1 values to the formula", () => {
    let captured: number[] = []
    const spy: BlendFormula = (sr, sg, sb, dr, dg, db) => {
      captured = [sr, sg, sb, dr, dg, db]
      return [sr, sg, sb]
    }

    // src: 51,102,153 → 0.2, 0.4, 0.6
    blendPixels(pixel(51, 102, 153, 255), pixel(0, 0, 0, 255), spy)

    expect(captured[0]).toBeCloseTo(0.2, 5)
    expect(captured[1]).toBeCloseTo(0.4, 5)
    expect(captured[2]).toBeCloseTo(0.6, 5)
    expect(captured[3]).toBeCloseTo(0, 5)
    expect(captured[4]).toBeCloseTo(0, 5)
    expect(captured[5]).toBeCloseTo(0, 5)
  })

  it("returns all zeros when both source and dest are fully transparent", () => {
    const result = blendPixels(pixel(0, 0, 0, 0), pixel(0, 0, 0, 0), identity)
    const d = result.data

    expect(d[0]).toBe(0)
    expect(d[1]).toBe(0)
    expect(d[2]).toBe(0)
    expect(d[3]).toBe(0)
  })
})
