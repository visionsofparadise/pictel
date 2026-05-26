import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { encode } from "./encode";

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

    const webp = await encode(png, { format: "webp", quality: 80 });
    const metadata = await sharp(webp).metadata();

    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(8);
    expect(metadata.height).toBe(6);
  });

  it("resizes when width/height are provided", async () => {
    const png = await makePng(8, 6);

    const resized = await encode(png, { format: "png", width: 16, height: 12 });
    const metadata = await sharp(resized).metadata();

    expect(metadata.width).toBe(16);
    expect(metadata.height).toBe(12);
  });
});
