import { LinearGradient, SoftLight } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function SoftLightGrade() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<SoftLight
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={90}
						stops={[
							{ color: "rgb(255, 200, 130)", position: 0 },
							{ color: "rgb(180, 160, 200)", position: 0.55 },
							{ color: "rgb(60, 80, 140)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</SoftLight>
		</Canvas>
	);
}
