import { Bilateral } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function SkinSmooth() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Bilateral spatialSigma={8} colorSigma={42}>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Bilateral>
		</Canvas>
	);
}
