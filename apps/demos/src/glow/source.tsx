import { Bloom } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const canvasW = 640;
const canvasH = 960;

export default function Glow() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Bloom threshold={0.15} radius={18} intensity={6}>
				<Image
					src={LANDSCAPE_URL}
					width={canvasW}
					height={canvasH}
					fit="cover"
				/>
			</Bloom>
		</Canvas>
	);
}
