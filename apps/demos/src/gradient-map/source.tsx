import { GradientMap } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function GradientMapDemo() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#08252e", position: 0 },
					{ color: "#4a2a6a", position: 0.35 },
					{ color: "#d65d8c", position: 0.7 },
					{ color: "#f7ecd0", position: 1 },
				]}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</GradientMap>
		</Canvas>
	);
}
