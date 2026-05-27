# Noise Storm

A purely-generated abstract field — multiple octaves of soft Perlin noise consolidating into broad sweeping cloud-bands, then mapped through a high-contrast duotone running from deep aubergine purple in the shadows up to hot solar orange in the highlights. Saturation is pushed so each tone reads with painted-poster intensity. The result is the kind of low-noise abstract album-cover backdrop you'd run a foreground subject against — substantial atmospheric depth, no recognizable content.

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/noise-storm.png)

```tsx
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
```
