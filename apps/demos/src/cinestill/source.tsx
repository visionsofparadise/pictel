import { Bloom, ChannelMixer, ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

const RED_BIAS_HIGHLIGHTS: Array<Array<number>> = [
	[1.25, 0, 0],
	[0, 1, 0],
	[0, 0, 1],
];

export default function Cinestill() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Bloom threshold={0.55} radius={28} intensity={1.15}>
				<ColorGrade saturation={1.05} contrast={1.08} temperature={0.05}>
					<ChannelMixer matrix={RED_BIAS_HIGHLIGHTS}>
						<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
					</ChannelMixer>
				</ColorGrade>
			</Bloom>
		</Canvas>
	);
}
