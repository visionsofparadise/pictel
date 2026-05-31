# Chromatic Glow

A cityscape pushed into the heightened-colour cyberpunk register — saturation cranked so the warm and cool tones in roof tiles, window glass, and skylight read in bold electric hues, then bloomed so the brightest patches bleed soft halos into their surroundings. The image still reads as a real city, but with the colour intensity of a neon poster and the optical glow of an over-exposed cinematic plate.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/chromatic-glow.png)

```tsx
import { Bloom, Saturate } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function ChromaticGlow() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Bloom threshold={0.55} radius={28} intensity={3.5}>
				<Saturate amount={1.85} mode="parameter">
					<Image src={CITY_URL} width={W} height={H} fit="cover" />
				</Saturate>
			</Bloom>
		</Canvas>
	);
}
```
