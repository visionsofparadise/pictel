# Golden Hour Grade

A cityscape pushed toward the warm low-sun look of the hour after dawn — orange and amber lifted in the highlights, faint magenta in the midtones, saturation pulled up so the rust-and-copper tones in roof tiles and brickwork carry. The image is brighter overall and slightly higher in contrast, so the long shadows that fall between buildings deepen into a coffee-brown rather than going neutral grey. Cinematic and warm, the colour grade alone — no skies replaced, no flares added.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/golden-hour-grade.png)

```tsx
import { ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function GoldenHourGrade() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade brightness={1.05} contrast={1.15} saturation={1.25} temperature={1.4} tint={0.15}>
				<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</ColorGrade>
		</Canvas>
	);
}
```
