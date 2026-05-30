# Wood Grain

A clean-grade stretch of timber — long fibrous pore lines running uninterrupted across the panel along the grain direction, layered over the slow warm-cool drift of late-wood and early-wood ring density. The pore lines are tight and parallel; the ring bands beneath them rise and fall at a much coarser scale, giving the surface the depth real timber has when you stare into it. The palette runs from a deep walnut-shadow brown to a warm honey-tan highlight. No knots, no surface damage, no edge: this is the middle of a single board cut along its length.

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/wood-grain.png)

```tsx
import { Duotone, LIC, ProceduralNoise, VectorField } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1024;
const H = 1024;

const SHADOW: [number, number, number] = [42, 22, 10];
const HIGHLIGHT: [number, number, number] = [206, 154, 96];

export default function WoodGrain() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Duotone dark={SHADOW} light={HIGHLIGHT}>
				<LIC
					length={120}
					stepSize={2}
					uniformStep
					map={<VectorField pattern="linear" angle={0} width={W} height={H} />}
				>
					<ProceduralNoise
						width={W}
						height={H}
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
```
