import { Duotone, LIC, ProceduralNoise, VectorField } from "@pictel/effects";
import { Canvas } from "pictel";

const canvasW = 512;
const canvasH = 512;

const SHADOW: [number, number, number] = [42, 22, 10];
const HIGHLIGHT: [number, number, number] = [206, 154, 96];

export default function WoodGrain() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Duotone dark={SHADOW} light={HIGHLIGHT}>
				<LIC
					length={60}
					stepSize={2}
					uniformStep
					map={<VectorField pattern="linear" angle={0} width={canvasW} height={canvasH} />}
				>
					<ProceduralNoise
						width={canvasW}
						height={canvasH}
						type="simplex"
						seed={1907}
						scaleX={0.0015}
						scaleY={0.07}
						octaves={5}
						persistence={0.62}
					/>
				</LIC>
			</Duotone>
		</Canvas>
	);
}
