import { DisplacementMap, ProceduralNoise } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function LiquidDistortion() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<DisplacementMap
				scaleX={28}
				scaleY={70}
				map={<ProceduralNoise width={W} height={H} type="simplex" seed={1729} scale={0.008} octaves={2} />}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</DisplacementMap>
		</Canvas>
	);
}
