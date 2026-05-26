import { Multiply, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function Vignette() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<RadialGradient
						width={W}
						height={H}
						radius={0.75}
						stops={[
							{ color: "rgba(255, 255, 255, 1)", position: 0 },
							{ color: "rgba(255, 255, 255, 1)", position: 0.4 },
							{ color: "rgba(40, 25, 15, 1)", position: 1 },
						]}
					/>
				}
			>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Multiply>
		</Canvas>
	);
}
