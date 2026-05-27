# Retro Sunburst

A purely-generated retro-poster sunburst — twenty-four alternating cream and rust-red wedges meet at the centre of the frame and radiate outward to the edges, the way mid-century food packaging and circus advertising used to break up a flat background. Each wedge is a hard-edged sector with no gradation between adjacent wedges; the result is a high-energy radial backdrop that can stand alone as art or sit behind a foreground subject.

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/retro-sunburst.png)

```tsx
import { ConicGradient } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 1280;

export default function RetroSunburst() {
	const stops = Array.from({ length: 24 }, (_, index) => {
		const isCream = index % 2 === 0;
		return {
			color: isCream ? "rgb(248, 232, 198)" : "rgb(202, 78, 52)",
			position: index / 24,
		};
	}).concat([{ color: "rgb(248, 232, 198)", position: 1 }]);

	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ConicGradient
				width={W}
				height={H}
				centerX={0.5}
				centerY={0.5}
				startAngle={0}
				stops={stops}
			/>
		</Canvas>
	);
}
```
