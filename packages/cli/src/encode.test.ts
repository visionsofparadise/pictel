import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { encode } from "./encode";

/** Builds a known 8x6 solid-red PNG buffer to exercise the encoder against. */
async function makePng(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 220, g: 30, b: 40, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

describe("encode", () => {
  it("re-encodes a PNG buffer to WebP preserving dimensions", async () => {
    const png = await makePng(8, 6);

    const webp = await encode(png, "webp", 80);
    const metadata = await sharp(webp).metadata();

    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(8);
    expect(metadata.height).toBe(6);
  });
});
