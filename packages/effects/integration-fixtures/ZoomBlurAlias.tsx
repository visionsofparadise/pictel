import { LinearGradient, ZoomBlur } from "@pictel/effects";
import { Canvas } from "pictel";

const canvasW = 256;
const canvasH = 256;

export default function ZoomBlurAliasFixture() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<ZoomBlur centerX={0.5} centerY={0.5} length={24}>
				<LinearGradient
					width={canvasW}
					height={canvasH}
					angle={45}
					stops={[
						{ color: "#0a1f3a", position: 0 },
						{ color: "#4dd0c5", position: 0.5 },
						{ color: "#f7ecd0", position: 1 },
					]}
				/>
			</ZoomBlur>
		</Canvas>
	);
}
