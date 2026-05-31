import { Vignette } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function VignetteDemo() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Vignette color="rgba(40, 25, 15, 1)" radius={0.75} softness={0.4}>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" />
			</Vignette>
		</Canvas>
	);
}
