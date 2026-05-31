import { Halftone } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function ColorHalftone() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Halftone dotSize={12} colorMode="cmyk">
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Halftone>
		</Canvas>
	);
}
