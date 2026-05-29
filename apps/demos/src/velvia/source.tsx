import { ChannelMixer, ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

const VELVIA_MIX: Array<Array<number>> = [
	[1.08, -0.02, -0.06],
	[-0.05, 1.15, -0.05],
	[-0.04, -0.05, 1.18],
];

export default function Velvia() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade contrast={1.22} saturation={1.55} temperature={0.02} tint={-0.02}>
				<ChannelMixer matrix={VELVIA_MIX}>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</ChannelMixer>
			</ColorGrade>
		</Canvas>
	);
}
