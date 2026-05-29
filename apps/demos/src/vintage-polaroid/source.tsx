import { ColorGrade, Grain } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1280;

const PHOTO_W = 880;
const PHOTO_H = 880;

export default function VintagePolaroid() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div
				style={{
					width: W,
					height: H,
					backgroundColor: "rgb(80, 70, 64)",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "flex-start",
					paddingTop: 80,
					boxSizing: "border-box",
				}}
			>
				<div
					style={{
						width: W - 144,
						backgroundColor: "rgb(248, 244, 232)",
						padding: 36,
						paddingBottom: 180,
						boxSizing: "border-box",
					}}
				>
					<Grain intensity={14} seed={4811}>
						<ColorGrade brightness={1.05} contrast={0.88} saturation={0.7} temperature={0.9} tint={0.1}>
							<Image
								src={PORTRAIT_URL}
								width={PHOTO_W - 72}
								height={PHOTO_H - 72}
								fit="cover"
								crossOrigin="anonymous"
							/>
						</ColorGrade>
					</Grain>
				</div>
			</div>
		</Canvas>
	);
}
