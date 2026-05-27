import { Bloom, Saturate } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function ChromaticGlow() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Bloom threshold={0.55} radius={28} intensity={3.5}>
				<Saturate amount={1.85} mode="parameter">
					<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</Saturate>
			</Bloom>
		</Canvas>
	);
}
