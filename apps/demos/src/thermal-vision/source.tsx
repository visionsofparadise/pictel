import { GradientMap } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function ThermalVision() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#000010", position: 0 },
					{ color: "#1a0050", position: 0.18 },
					{ color: "#7a0080", position: 0.38 },
					{ color: "#d12020", position: 0.58 },
					{ color: "#ffaa00", position: 0.78 },
					{ color: "#fff4c4", position: 0.92 },
					{ color: "#ffffff", position: 1 },
				]}
			>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</GradientMap>
		</Canvas>
	);
}
