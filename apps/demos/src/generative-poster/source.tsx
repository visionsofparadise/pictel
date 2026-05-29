import { LinePattern, Overlay, ProceduralNoise, RadialGradient, Screen } from "@pictel/effects";
import { Canvas } from "pictel";

const canvasW = 720;
const canvasH = 960;

export default function GenerativePoster() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Overlay
				apply={
					<ProceduralNoise
						width={canvasW}
						height={canvasH}
						type="simplex"
						seed={101}
						scale={0.5}
					/>
				}
			>
				<Screen
					apply={
						<LinePattern
							width={canvasW}
							height={canvasH}
							seed={5}
							spacing={26}
							thickness={2}
							angle={32}
							color="#e8a13c"
						/>
					}
				>
					<RadialGradient
						width={canvasW}
						height={canvasH}
						stops={[
							{ color: "#f6c970", position: 0 },
							{ color: "#c25a2e", position: 0.45 },
							{ color: "#1a1326", position: 1 },
						]}
						centerX={0.38}
						centerY={0.34}
						radius={0.9}
					/>
				</Screen>
			</Overlay>
		</Canvas>
	);
}
