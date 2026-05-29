import { ProceduralNoise, Screen, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function SnowOverlay() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<Threshold threshold={222}>
						<ProceduralNoise
							width={W}
							height={H}
							type="simplex"
							seed={9214}
							scale={3.2}
							octaves={1}
						/>
					</Threshold>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Screen>
		</Canvas>
	);
}
