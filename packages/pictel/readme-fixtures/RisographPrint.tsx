import { Quantize } from "@pictel/effects";
import { Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const WIDTH = 512;
const HEIGHT = 768;

const RISO_PALETTE = [
	[245, 240, 230],
	[235, 60, 130],
	[40, 80, 180],
	[35, 35, 40],
] as const;

export const risographDimensions = { width: WIDTH, height: HEIGHT };

export const risographSourceUrl = PORTRAIT_URL;

export const RisographComposition = (
	<Quantize palette={RISO_PALETTE} dither="bayer-8">
		<Image src={PORTRAIT_URL} width={WIDTH} height={HEIGHT} fit="cover" />
	</Quantize>
);
