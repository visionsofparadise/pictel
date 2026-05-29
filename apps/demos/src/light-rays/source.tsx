import { ConicGradient, Screen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function LightRays() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				opacity={0.85}
				apply={
					<ConicGradient
						width={W}
						height={H}
						centerX={0.92}
						centerY={0.04}
						startAngle={155}
						stops={[
							{ color: "rgba(255, 240, 200, 0)", position: 0 },
							{ color: "rgba(255, 240, 200, 1)", position: 0.01 },
							{ color: "rgba(255, 240, 200, 1)", position: 0.025 },
							{ color: "rgba(255, 240, 200, 0)", position: 0.04 },
							{ color: "rgba(255, 240, 200, 0)", position: 0.07 },
							{ color: "rgba(255, 240, 200, 1)", position: 0.085 },
							{ color: "rgba(255, 240, 200, 1)", position: 0.1 },
							{ color: "rgba(255, 240, 200, 0)", position: 0.115 },
							{ color: "rgba(255, 240, 200, 0)", position: 0.15 },
							{ color: "rgba(255, 240, 200, 1)", position: 0.165 },
							{ color: "rgba(255, 240, 200, 1)", position: 0.18 },
							{ color: "rgba(255, 240, 200, 0)", position: 0.195 },
							{ color: "rgba(255, 240, 200, 0)", position: 0.225 },
							{ color: "rgba(255, 240, 200, 1)", position: 0.24 },
							{ color: "rgba(255, 240, 200, 1)", position: 0.255 },
							{ color: "rgba(255, 240, 200, 0)", position: 0.27 },
							{ color: "rgba(255, 240, 200, 0)", position: 1 },
						]}
					/>
				}
			>
				<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Screen>
		</Canvas>
	);
}
