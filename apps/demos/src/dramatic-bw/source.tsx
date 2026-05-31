import { ChannelMixer, ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

const RED_FILTER: Array<Array<number>> = [
	[1.6, -0.3, -0.3],
	[1.6, -0.3, -0.3],
	[1.6, -0.3, -0.3],
];

export default function DramaticBw() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade contrast={1.35} brightness={1}>
				<ChannelMixer matrix={RED_FILTER}>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
				</ChannelMixer>
			</ColorGrade>
		</Canvas>
	);
}
