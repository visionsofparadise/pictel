import { LinearGradient, MotionBlur } from "@pictel/effects";
import { Canvas } from "pictel";

const canvasW = 256;
const canvasH = 256;

export default function MotionBlurAliasFixture() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<MotionBlur angle={30} length={24}>
				<LinearGradient
					width={canvasW}
					height={canvasH}
					angle={90}
					stops={[
						{ color: "#1a2e6c", position: 0 },
						{ color: "#e8c468", position: 0.5 },
						{ color: "#c3324a", position: 1 },
					]}
				/>
			</MotionBlur>
		</Canvas>
	);
}
