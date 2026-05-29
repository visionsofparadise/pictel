import { GradientMap } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function SplitToning() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#1a3a52", position: 0 },
					{ color: "#6b6b6b", position: 0.5 },
					{ color: "#f0d090", position: 1 },
				]}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</GradientMap>
		</Canvas>
	);
}
