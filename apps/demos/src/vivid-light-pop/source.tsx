import { LinearGradient, VividLight } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function VividLightPop() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<VividLight
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={45}
						stops={[
							{ color: "rgb(255, 100, 80)", position: 0 },
							{ color: "rgb(190, 130, 100)", position: 0.5 },
							{ color: "rgb(50, 130, 220)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</VividLight>
		</Canvas>
	);
}
