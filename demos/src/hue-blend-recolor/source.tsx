import { ConicGradient, Hue } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function HueBlendRecolor() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Hue
				apply={
					<ConicGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						startAngle={0}
						stops={[
							{ color: "rgb(255, 60, 60)", position: 0 },
							{ color: "rgb(60, 220, 80)", position: 0.33 },
							{ color: "rgb(60, 100, 255)", position: 0.66 },
							{ color: "rgb(255, 60, 60)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Hue>
		</Canvas>
	);
}
