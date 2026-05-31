import { HardLight, LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

export default function HardLightDrama() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<HardLight
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={20}
						stops={[
							{ color: "rgb(220, 110, 80)", position: 0 },
							{ color: "rgb(128, 128, 128)", position: 0.5 },
							{ color: "rgb(20, 30, 90)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</HardLight>
		</Canvas>
	);
}
