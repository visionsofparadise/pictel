# Moonlit

An evening landscape pulled into deep moonlit night — warmth drained out and replaced by a cool blue cast, brightness lowered to a faint silver, saturation pushed down so most of the scene reads as a near-monochrome of cyan-greys, contrast bumped to keep the brightest highlights legible the way moonlight catches edges. The familiar day-for-night cinema treatment: the same scene, reinterpreted under a colder, fainter light source.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/moonlit.png)

```tsx
import { ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function Moonlit() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade brightness={0.6} contrast={1.25} saturation={0.45} temperature={-1.2} tint={-0.15}>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</ColorGrade>
		</Canvas>
	);
}
```
