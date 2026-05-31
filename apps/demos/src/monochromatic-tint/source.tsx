import { Duotone } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

const SHADOW: [number, number, number] = [22, 38, 64];
const HIGHLIGHT: [number, number, number] = [248, 232, 198];

export default function MonochromaticTint() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Duotone dark={SHADOW} light={HIGHLIGHT}>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Duotone>
		</Canvas>
	);
}
