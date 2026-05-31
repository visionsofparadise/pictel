import { FlowBlur, LinearGradient } from "@pictel/effects";
import { Canvas } from "pictel";

const canvasW = 256;
const canvasH = 256;

export default function FlowBlurAliasFixture() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<FlowBlur length={24}>
				<LinearGradient
					width={canvasW}
					height={canvasH}
					angle={20}
					stops={[
						{ color: "#0e2a44", position: 0 },
						{ color: "#e8c468", position: 0.4 },
						{ color: "#1a2e6c", position: 0.7 },
						{ color: "#f7ecd0", position: 1 },
					]}
				/>
			</FlowBlur>
		</Canvas>
	);
}
