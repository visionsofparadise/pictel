import { LinearGradient, SwirlBlur } from "@pictel/effects";
import { Canvas } from "pictel";

const canvasW = 256;
const canvasH = 256;

export default function SwirlBlurAliasFixture() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<SwirlBlur centerX={0.5} centerY={0.5} length={24}>
				<LinearGradient
					width={canvasW}
					height={canvasH}
					angle={0}
					stops={[
						{ color: "#2a0e44", position: 0 },
						{ color: "#d65d8c", position: 0.5 },
						{ color: "#f7ecd0", position: 1 },
					]}
				/>
			</SwirlBlur>
		</Canvas>
	);
}
