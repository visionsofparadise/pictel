import { LIC, VectorField } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const canvasW = 512;
const canvasH = 512;

export default function MotionStreak() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<LIC
				length={34}
				stepSize={1.4}
				uniformStep
				map={<VectorField pattern="linear" angle={8} width={canvasW} height={canvasH} />}
			>
				<Image src={CITY_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
			</LIC>
		</Canvas>
	);
}
