import { ChannelMixer, Contrast } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

const GLITCH_MATRIX = [
	[0.2, 0.1, 1.1],
	[1.0, 0.05, 0.1],
	[0.05, 1.05, 0.0],
];

export default function GlitchChannels() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Contrast amount={1.18} mode="parameter">
				<ChannelMixer matrix={GLITCH_MATRIX}>
					<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</ChannelMixer>
			</Contrast>
		</Canvas>
	);
}
