import { DisplacementMap, ProceduralNoise } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function GlitchShear() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<DisplacementMap
				scaleX={45}
				scaleY={0}
				map={<ProceduralNoise width={W} height={H} type="simplex" seed={3271} scale={3} octaves={2} />}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</DisplacementMap>
		</Canvas>
	);
}
