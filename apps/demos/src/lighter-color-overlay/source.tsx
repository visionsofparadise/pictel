import { LighterColor, ProceduralNoise, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

export default function LighterColorOverlay() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<LighterColor
				apply={
					<Threshold threshold={220}>
						<ProceduralNoise
							width={W}
							height={H}
							type="simplex"
							seed={1832}
							scale={4.5}
							octaves={2}
						/>
					</Threshold>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</LighterColor>
		</Canvas>
	);
}
