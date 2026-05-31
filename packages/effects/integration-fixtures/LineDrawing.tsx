import { Blur, Contrast, Grayscale, ShockFilter } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PHOTO_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const canvasW = 640;
const canvasH = 960;

export default function LineDrawing() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Contrast amount={1.4}>
				<ShockFilter iterations={20} strength={1}>
					<Blur radius={8}>
						<Grayscale amount={1}>
							<Image
								src={PHOTO_URL}
								width={canvasW}
								height={canvasH}
								fit="cover"							/>
						</Grayscale>
					</Blur>
				</ShockFilter>
			</Contrast>
		</Canvas>
	);
}
