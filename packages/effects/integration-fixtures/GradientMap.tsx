import { GradientMap } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "/golden-hour-portrait.jpg";

const canvasW = 512;
const canvasH = 512;

export default function GradientMapFixture() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<GradientMap
				stops={[
					{ color: "#08252e", position: 0 },
					{ color: "#4a2a6a", position: 0.35 },
					{ color: "#d65d8c", position: 0.7 },
					{ color: "#f7ecd0", position: 1 },
				]}
			>
				<Image src={PORTRAIT_URL} width={canvasW} height={canvasH} fit="cover" />
			</GradientMap>
		</Canvas>
	);
}
