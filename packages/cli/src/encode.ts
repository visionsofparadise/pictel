import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import sharp from "sharp";

/**
 * Encodes a raw PNG screenshot buffer (as captured by `renderEntry`) to a
 * target image format. PNG output ignores `quality`; JPEG, WebP, and AVIF
 * apply it as Sharp's `quality` option. Sharp also handles the format-specific
 * concerns (compression, ICC profiles, metadata) the design assigns to it.
 *
 * @param buffer - The raw PNG buffer to re-encode.
 * @param format - The target output format.
 * @param quality - Encoding quality (1–100); ignored when `format` is `"png"`.
 */
export async function encode(
  buffer: Buffer,
  format: "png" | "jpeg" | "webp" | "avif",
  quality?: number,
): Promise<Buffer> {
  const image = sharp(buffer);

  switch (format) {
    case "png":
      return image.png().toBuffer();
    case "jpeg":
      return image.jpeg({ quality }).toBuffer();
    case "webp":
      return image.webp({ quality }).toBuffer();
    case "avif":
      return image.avif({ quality }).toBuffer();
  }
}

/**
 * Writes an encoded image buffer to disk, creating the parent directory tree
 * if it does not already exist.
 *
 * @param buffer - The encoded image bytes.
 * @param outPath - The destination file path.
 */
export async function writeOutput(buffer: Buffer, outPath: string): Promise<void> {
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, buffer);
}
