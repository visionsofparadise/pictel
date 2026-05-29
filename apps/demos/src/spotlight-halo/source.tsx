import { RadialGradient, Screen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function SpotlightHalo() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						radius={0.55}
						stops={[
							{ color: "rgba(0, 0, 0, 1)", position: 0 },
							{ color: "rgba(0, 0, 0, 1)", position: 0.6 },
							{ color: "rgba(180, 195, 220, 0.75)", position: 0.92 },
							{ color: "rgba(80, 100, 140, 0)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Screen>
		</Canvas>
	);
}
