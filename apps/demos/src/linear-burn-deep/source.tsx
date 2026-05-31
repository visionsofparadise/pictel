import { LinearBurn, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function LinearBurnDeep() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<LinearBurn
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						radius={1.0}
						stops={[
							{ color: "rgb(245, 230, 220)", position: 0 },
							{ color: "rgb(180, 160, 150)", position: 0.55 },
							{ color: "rgb(70, 50, 40)", position: 1 },
						]}
					/>
				}
			>
				<Image src={CITY_URL} width={W} height={H} fit="cover" />
			</LinearBurn>
		</Canvas>
	);
}
