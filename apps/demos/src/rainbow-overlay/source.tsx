import { RadialGradient, Screen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function RainbowOverlay() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={1.4}
						radius={1.6}
						stops={[
							{ color: "rgba(0, 0, 0, 1)", position: 0 },
							{ color: "rgba(0, 0, 0, 1)", position: 0.62 },
							{ color: "rgba(140, 0, 200, 0.65)", position: 0.66 },
							{ color: "rgba(0, 0, 200, 0.75)", position: 0.7 },
							{ color: "rgba(0, 200, 200, 0.85)", position: 0.74 },
							{ color: "rgba(0, 200, 0, 0.85)", position: 0.78 },
							{ color: "rgba(255, 220, 0, 0.85)", position: 0.82 },
							{ color: "rgba(255, 110, 0, 0.85)", position: 0.86 },
							{ color: "rgba(255, 30, 30, 0.85)", position: 0.9 },
							{ color: "rgba(0, 0, 0, 0)", position: 0.93 },
							{ color: "rgba(0, 0, 0, 0)", position: 1 },
						]}
					/>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Screen>
		</Canvas>
	);
}
