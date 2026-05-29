import { Multiply, ProceduralNoise } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 936;
const H = 1404;

export default function DappledShadow() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<ProceduralNoise
						width={W}
						height={H}
						type="simplex"
						seed={8101}
						scale={0.006}
						octaves={3}
						tint={[245, 230, 200]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Multiply>
		</Canvas>
	);
}
