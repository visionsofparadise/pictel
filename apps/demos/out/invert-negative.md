# Film Negative

A landscape rendered as if seen on a strip of colour-film negative, before scanning and inversion — bright sky goes inky, shadows go pale, foliage turns magenta. A subtle warm-orange bias runs through the whole frame, the way the orange dye mask in 35mm colour negatives tints every scan that comes back uncorrected. The image is recognizable but unsettling, the eye still doing the arithmetic.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/invert-negative.png)

```tsx
import { ColorGrade, Invert } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function InvertNegative() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade temperature={1.0} saturation={0.85}>
				<Invert>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</Invert>
			</ColorGrade>
		</Canvas>
	);
}
```
