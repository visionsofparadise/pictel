import { LinearGradient, ProceduralNoise, Screen, Threshold } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1024;
const H = 1536;

export default function StarrySky() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Screen
				apply={
					<Threshold threshold={238}>
						<ProceduralNoise
							width={W}
							height={H}
							type="simplex"
							seed={7321}
							scale={2.5}
							octaves={1}
						/>
					</Threshold>
				}
			>
				<LinearGradient
					width={W}
					height={H}
					angle={90}
					stops={[
						{ color: "rgb(2, 3, 10)", position: 0 },
						{ color: "rgb(10, 20, 40)", position: 0.65 },
						{ color: "rgb(26, 39, 80)", position: 1 },
					]}
				/>
			</Screen>
		</Canvas>
	);
}
