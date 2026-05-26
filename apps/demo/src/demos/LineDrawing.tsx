import { Blur, Contrast, Grayscale, ShockFilter } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import photo from "../../assets/Portrait with Background 1.jpg";

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
								src={photo}
								width={canvasW}
								height={canvasH}
								fit="cover"
								crossOrigin="anonymous"
							/>
						</Grayscale>
					</Blur>
				</ShockFilter>
			</Contrast>
		</Canvas>
	);
}
