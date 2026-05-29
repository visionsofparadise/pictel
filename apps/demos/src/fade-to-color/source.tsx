import { LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const canvasW = 1024;
const canvasH = 1536;

export default function FadeToColor() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<div style={{ position: "relative", width: `${String(canvasW)}px`, height: `${String(canvasH)}px`, backgroundColor: "#f4ece1" }}>
				<Image src={PORTRAIT_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
				<div style={{ position: "absolute", inset: 0 }}>
					<LinearGradient
						width={canvasW}
						height={canvasH}
						angle={0}
						stops={[
							{ color: "rgba(244, 236, 225, 1)", position: 0 },
							{ color: "rgba(244, 236, 225, 1)", position: 0.32 },
							{ color: "rgba(244, 236, 225, 0)", position: 0.62 },
						]}
					/>
				</div>
			</div>
		</Canvas>
	);
}
