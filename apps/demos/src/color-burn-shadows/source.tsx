import { ColorBurn, LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function ColorBurnShadows() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorBurn
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={180}
						stops={[
							{ color: "rgb(255, 255, 255)", position: 0 },
							{ color: "rgb(255, 255, 255)", position: 0.45 },
							{ color: "rgb(180, 130, 90)", position: 0.75 },
							{ color: "rgb(60, 30, 20)", position: 1 },
						]}
					/>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
			</ColorBurn>
		</Canvas>
	);
}
