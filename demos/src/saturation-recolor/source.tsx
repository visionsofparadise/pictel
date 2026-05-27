import { ConicGradient, Saturation } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function SaturationRecolor() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Saturation
				apply={
					<ConicGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						startAngle={0}
						stops={[
							{ color: "rgb(255, 100, 100)", position: 0 },
							{ color: "rgb(100, 100, 100)", position: 0.5 },
							{ color: "rgb(255, 100, 100)", position: 1 },
						]}
					/>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Saturation>
		</Canvas>
	);
}
