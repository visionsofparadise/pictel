import { LinearGradient, Screen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function LightLeak() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={210}
						stops={[
							{ color: "rgba(0, 0, 0, 0)", position: 0 },
							{ color: "rgba(0, 0, 0, 0)", position: 0.45 },
							{ color: "rgba(255, 140, 60, 0.5)", position: 0.7 },
							{ color: "rgba(255, 220, 140, 0.85)", position: 0.92 },
							{ color: "rgba(255, 255, 220, 0.95)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Screen>
		</Canvas>
	);
}
