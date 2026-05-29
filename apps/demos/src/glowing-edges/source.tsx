import { EdgeDetect, GradientMap } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function GlowingEdges() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#020308", position: 0 },
					{ color: "#062028", position: 0.15 },
					{ color: "#12805a", position: 0.45 },
					{ color: "#5cff8c", position: 0.78 },
					{ color: "#e8ffd0", position: 1 },
				]}
			>
				<EdgeDetect kernel="scharr">
					<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</EdgeDetect>
			</GradientMap>
		</Canvas>
	);
}
