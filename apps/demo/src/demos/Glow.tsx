import { Bloom } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import landscape from "../../assets/Evening Landscape.jpg";

const canvasW = 640;
const canvasH = 960;

export default function Glow() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Bloom threshold={0.15} radius={18} intensity={6}>
				<Image
					src={landscape}
					width={canvasW}
					height={canvasH}
					fit="cover"
					crossOrigin="anonymous"
				/>
			</Bloom>
		</Canvas>
	);
}
