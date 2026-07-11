import { CubeLUT } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const GOLDEN_HOUR_URL = "/golden-hour-portrait.jpg";
const LUT_URL = "/orange-and-blue-lut.cube";

const canvasW = 683;
const canvasH = 1024;

export default function LUTGrade() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<CubeLUT src={LUT_URL}>
				<Image src={GOLDEN_HOUR_URL} width={canvasW} height={canvasH} fit="cover" />
			</CubeLUT>
		</Canvas>
	);
}
