import { PinLight, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function PinLightCutoff() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<PinLight
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.4}
						radius={0.9}
						stops={[
							{ color: "rgb(255, 220, 180)", position: 0 },
							{ color: "rgb(170, 100, 80)", position: 0.55 },
							{ color: "rgb(20, 30, 60)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</PinLight>
		</Canvas>
	);
}
