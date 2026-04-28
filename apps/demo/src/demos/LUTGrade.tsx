import { Canvas, CubeLUT } from "pictel";
import goldenHour from "../../assets/Golden Hour Portrait.jpg";
import lutUrl from "../../assets/OrangeAndBlue.cube?url";

export default function LUTGrade() {
	return (
		<Canvas mode="display" dimensions={{ width: 683, height: 1024 }}>
			<CubeLUT src={lutUrl}>
				<img src={goldenHour} crossOrigin="anonymous" style={{ display: "block", maxWidth: "100%" }} />
			</CubeLUT>
		</Canvas>
	);
}
