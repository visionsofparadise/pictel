import { Quantize } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

const RISO_PALETTE = [
	[245, 240, 230],
	[235, 60, 130],
	[40, 80, 180],
	[35, 35, 40],
] as const;

export default function RisographPrint() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Quantize palette={RISO_PALETTE} dither="bayer-8">
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Quantize>
		</Canvas>
	);
}
