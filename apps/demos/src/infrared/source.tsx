import { ChannelMixer, Saturate } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

const IR_MATRIX = [
	[0.0, 1.0, 0.0],
	[0.4, 0.3, 0.3],
	[1.0, 0.0, 0.0],
];

export default function Infrared() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Saturate amount={1.4} mode="parameter">
				<ChannelMixer matrix={IR_MATRIX}>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
				</ChannelMixer>
			</Saturate>
		</Canvas>
	);
}
