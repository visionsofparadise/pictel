import { GradientMap } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function Solarize() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#f4efe2", position: 0 },
					{ color: "#1a1a1a", position: 0.5 },
					{ color: "#f4efe2", position: 1 },
				]}
			>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" />
			</GradientMap>
		</Canvas>
	);
}
