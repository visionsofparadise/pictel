import { DarkerColor, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function DarkerColorMask() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<DarkerColor
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.4}
						radius={0.9}
						stops={[
							{ color: "rgb(255, 255, 255)", position: 0 },
							{ color: "rgb(140, 80, 60)", position: 0.5 },
							{ color: "rgb(20, 12, 40)", position: 1 },
						]}
					/>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</DarkerColor>
		</Canvas>
	);
}
