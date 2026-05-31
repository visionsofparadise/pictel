import { HardMix, LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

export default function HardMixPop() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<HardMix
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={90}
						stops={[
							{ color: "rgb(240, 80, 60)", position: 0 },
							{ color: "rgb(80, 60, 220)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</HardMix>
		</Canvas>
	);
}
