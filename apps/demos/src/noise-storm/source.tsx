import { ColorGrade, Duotone, ProceduralNoise } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 1280;

const DEEP_PURPLE: [number, number, number] = [18, 6, 42];
const HOT_ORANGE: [number, number, number] = [255, 170, 60];

export default function NoiseStorm() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade contrast={1.4} saturation={1.55} brightness={1.05}>
				<Duotone dark={DEEP_PURPLE} light={HOT_ORANGE}>
					<ProceduralNoise
						width={W}
						height={H}
						type="perlin"
						seed={2718}
						scale={5}
						octaves={6}
					/>
				</Duotone>
			</ColorGrade>
		</Canvas>
	);
}
