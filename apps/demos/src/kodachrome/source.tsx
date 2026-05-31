import { ChannelMixer, ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

const KODACHROME_MIX: Array<Array<number>> = [
	[1.12, 0.04, -0.08],
	[-0.03, 1.05, -0.02],
	[-0.05, -0.04, 1.18],
];

export default function Kodachrome() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade contrast={1.18} saturation={1.35} temperature={0.08} tint={-0.04} brightness={0.98}>
				<ChannelMixer matrix={KODACHROME_MIX}>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
				</ChannelMixer>
			</ColorGrade>
		</Canvas>
	);
}
