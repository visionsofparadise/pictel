# Lava Pool

A purely-generated molten lava surface — soft simplex-noise clouds at intermediate scale, contrast-stretched to fill the full luminance range, then mapped through a deep-maroon-through-burning-orange-through-pale-gold ramp so the noise reads as a roiling field of cooling and re-melting magma. The darkest pools settle into nearly-black blood-red where the crust has set; mid-temperature flows wash through bright orange; the hottest cracks resolve to white-gold. No flow direction, no rotation — just an organic temperature map across the frame, the kind of look a planetary close-up of an active lava lake would produce.

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/lava-pool.png)

```tsx
import { ColorGrade, GradientMap, ProceduralNoise } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 1280;

export default function LavaPool() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#1a0006", position: 0 },
					{ color: "#5a0018", position: 0.25 },
					{ color: "#c81a18", position: 0.5 },
					{ color: "#ff6a18", position: 0.72 },
					{ color: "#ffd040", position: 0.88 },
					{ color: "#fff6c8", position: 1 },
				]}
			>
				<ColorGrade contrast={1.9} brightness={1}>
					<ProceduralNoise width={W} height={H} type="simplex" seed={5417} scale={0.012} octaves={4} />
				</ColorGrade>
			</GradientMap>
		</Canvas>
	);
}
```
