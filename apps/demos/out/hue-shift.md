# Hue Shift

A landscape with every colour rotated around the colour wheel — what was warm orange becomes electric green, what was sky-blue becomes magenta, what was green becomes a deep purple. Brightness and contrast of the original frame are preserved; only the hue identity has been mapped to a different position on the wheel. Saturation is lifted slightly so the swapped colours read with the same punch the originals did. The result is a recognizable scene wearing somebody else's palette.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/hue-shift.png)

```tsx
import { HueRotate, Saturate } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function HueShift() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Saturate amount={1.4} mode="parameter">
				<HueRotate angle={140} mode="parameter">
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
				</HueRotate>
			</Saturate>
		</Canvas>
	);
}
```
