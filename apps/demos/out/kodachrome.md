# Kodachrome

A photograph rendered with the deep-saturation, archival-warm look of Kodachrome slide film — the colour stock that defined National Geographic covers and family-vacation slide projectors from the 1930s through the 2000s. Reds and oranges sit slightly hotter than reality; deep blues hold their depth without crushing; greens lean a touch more yellow than emulsion-modern films would render them; shadows close down with a hint of warmth rather than a neutral grey. The overall contrast is medium-high, the saturation conspicuous, and the colour balance unmistakably analogue — every frame looks like it was projected through a Carousel onto a basement screen in 1972.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/kodachrome.png)

```tsx
import { ChannelMixer, ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

const KODACHROME_MIX: Array<Array<number>> = [
	[1.12, 0.04, -0.08],
	[-0.03, 1.05, -0.02],
	[-0.05, -0.04, 1.18],
];

export default function Kodachrome() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade contrast={1.18} saturation={1.35} temperature={0.08} tint={-0.04} brightness={0.98}>
				<ChannelMixer matrix={KODACHROME_MIX}>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</ChannelMixer>
			</ColorGrade>
		</Canvas>
	);
}
```
