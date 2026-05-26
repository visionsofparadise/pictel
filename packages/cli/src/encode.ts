import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import sharp from "sharp";

export interface EncodeOptions {
  readonly format: "png" | "jpeg" | "webp" | "avif";
  readonly quality?: number;
  readonly width?: number;
  readonly height?: number;
}

export async function encode(buffer: Buffer, options: EncodeOptions): Promise<Buffer> {
  let image = sharp(buffer);

  if (options.width !== undefined || options.height !== undefined) {
    image = image.resize({ width: options.width, height: options.height, fit: "fill" });
  }

  switch (options.format) {
    case "png":
      return image.png().toBuffer();
    case "jpeg":
      return image.jpeg({ quality: options.quality }).toBuffer();
    case "webp":
      return image.webp({ quality: options.quality }).toBuffer();
    case "avif":
      return image.avif({ quality: options.quality }).toBuffer();
  }
}

export async function writeOutput(buffer: Buffer, outPath: string): Promise<void> {
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, buffer);
}
