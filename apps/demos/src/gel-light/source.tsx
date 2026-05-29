import { ConicGradient, SoftLight } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function GelLight() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<SoftLight
				apply={
					<ConicGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						stops={[
							{ color: "#ff2a6d", position: 0 },
							{ color: "#ff8a3c", position: 0.18 },
							{ color: "#f7d048", position: 0.34 },
							{ color: "#4cd964", position: 0.52 },
							{ color: "#3aa6ff", position: 0.7 },
							{ color: "#9b4dff", position: 0.86 },
							{ color: "#ff2a6d", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</SoftLight>
		</Canvas>
	);
}
