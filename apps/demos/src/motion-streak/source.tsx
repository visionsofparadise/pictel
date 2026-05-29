import { LIC, VectorField } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1280;
const H = 853;

export default function MotionStreak() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<LIC
				length={34}
				stepSize={1.4}
				uniformStep
				map={<VectorField pattern="linear" angle={8} width={W} height={H} />}
			>
				<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</LIC>
		</Canvas>
	);
}
