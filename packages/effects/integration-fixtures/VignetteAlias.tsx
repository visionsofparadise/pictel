import { LinearGradient, Vignette } from "@pictel/effects";
import { Canvas } from "pictel";

const canvasW = 256;
const canvasH = 256;

export default function VignetteAliasFixture() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Vignette color="rgba(20, 10, 40, 1)" radius={0.75} softness={0.4}>
				<LinearGradient
					width={canvasW}
					height={canvasH}
					angle={45}
					stops={[
						{ color: "#f4d35e", position: 0 },
						{ color: "#ee964b", position: 0.5 },
						{ color: "#0d3b66", position: 1 },
					]}
				/>
			</Vignette>
		</Canvas>
	);
}
