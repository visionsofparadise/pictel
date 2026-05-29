import { Multiply, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function StageLight() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.4}
						radius={0.5}
						stops={[
							{ color: "rgba(255, 240, 220, 1)", position: 0 },
							{ color: "rgba(255, 230, 200, 1)", position: 0.55 },
							{ color: "rgba(180, 140, 110, 1)", position: 0.78 },
							{ color: "rgba(15, 10, 8, 1)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Multiply>
		</Canvas>
	);
}
