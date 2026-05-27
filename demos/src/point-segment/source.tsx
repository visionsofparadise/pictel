import { ConicGradient, Mask } from "@pictel/effects";
import { Sam2 } from "@pictel/ml";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-2.jpg";

const W = 713;
const H = 1024;

export default function PointSegment() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative" }}>
				<ConicGradient
					width={W}
					height={H}
					stops={[
						{ color: "rgb(60, 20, 90)", position: 0 },
						{ color: "rgb(180, 50, 110)", position: 0.4 },
						{ color: "rgb(80, 30, 130)", position: 1 },
					]}
				/>
				<div style={{ position: "absolute", inset: 0 }}>
					<Mask
						source="luminance"
						map={
							<Sam2 points={[{ x: Math.round(W / 2), y: Math.round(H * 0.35) }]}>
								<Image src={PORTRAIT_URL} width={W} height={H} fit="contain" crossOrigin="anonymous" />
							</Sam2>
						}
					>
						<Image src={PORTRAIT_URL} width={W} height={H} fit="contain" crossOrigin="anonymous" />
					</Mask>
				</div>
			</div>
		</Canvas>
	);
}
