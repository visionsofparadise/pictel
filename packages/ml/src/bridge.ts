import { RawImage } from "@huggingface/transformers"

export function imageDataToRawImage(imageData: ImageData): RawImage {
	return new RawImage(imageData.data, imageData.width, imageData.height, 4)
}

export function rawImageToImageData(raw: RawImage): ImageData {
	const rgba = raw.rgba()

	return new ImageData(new Uint8ClampedArray(rgba.data), rgba.width, rgba.height)
}
