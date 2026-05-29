import { Color, LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function ColorBlendRecolor() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Color
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={90}
						stops={[
							{ color: "rgb(80, 130, 220)", position: 0 },
							{ color: "rgb(220, 90, 140)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Color>
		</Canvas>
	);
}
