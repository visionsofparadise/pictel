import { Canvas, CubeLUT, Image } from "pictel";
import goldenHour from "../../assets/Golden Hour Portrait.jpg";
import lutUrl from "../../assets/OrangeAndBlue.cube?url";

const canvasW = 683;
const canvasH = 1024;

export default function LUTGrade() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<CubeLUT src={lutUrl}>
				<Image src={goldenHour} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
			</CubeLUT>
		</Canvas>
	);
}
